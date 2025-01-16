const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const authRouter = require("./src/routes/authRouter");
const userRouter = require("./src/routes/userRouter");
const messageRouter = require("./src/routes/messageRouter");
const connect = require("./src/db/connect");
const logger = require("./src/utils/logger");
require("dotenv").config();
const { saveMessage } = require("./src/services/messageService");

const allowedOrigins = [
  "https://staging-dashboard.kalasa.gallery",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});
app.use(express.static(path.join(__dirname, "public"))); // Make sure to have a 'public' folder for static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((err, req, res, next) => {
  logger.error(err.stack); // Log the error stack
  res.status(500).json({
    success: false,
    message: "An unexpected error occurred.",
  });
});

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the Chat App!",
  });
});
app.post('/test', (req, res) => {
  return res.json({success: true, data: req.body})
})
app.get("/", (req, res) => {
  logger.info("Welcome to the Chat App");
  res.sendFile(path.join(__dirname, "./src/index.html"));
});

// Use routers for handling user and auth routes
app.use("/api/v1", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1", messageRouter);

const usernames = {};

io.on("connection", (socket) => {
  logger.info(`A user connected: ${socket.id}`);

  socket.on("adduser", (username) => {
    logger.info(`Add user: ${username}`);
    socket.username = username;
    logger.info(`User: ${socket}`);
    usernames[username] = socket.id;
    console.log(Object.keys(usernames));
    socket.emit(
      "updatechat",
      "Chat Bot",
      `${username}, you have joined the chat`
    );
    socket.broadcast.emit(
      "updatechat",
      "Chat Bot",
      `${username} has joined the chat`
    );
    io.emit("updateusers", Object.keys(usernames));
  });

    socket.on('private message', async ({ recipient, message }) => {  
      const recipientSocket = usernames[recipient];  
      try {  
          if (recipientSocket) {  
              logger.info(`Private message from ${socket.username} to ${recipient}: ${message}`);  
              io.to(recipientSocket).emit('private message', {  
                  message,  
                  from: socket.username,  
              });  
  
              // Save the message to the database  
              await saveMessage({  
                  sender: socket.username,  
                  recipient: recipient,  
                  content: message,  
              });  
  
              socket.emit('private message', {  
                  message,  
                  from: socket.username,  
                  to: recipient,  
              });  
          } else {  
              socket.emit('updatechat', 'Chat Bot', `User ${recipient} is not online.`);  
          }  
      } catch (error) {  
          console.error('Error handling private message:', error);  
          socket.emit('updatechat', 'Chat Bot', 'There was an issue sending your message.');  
      }  
  });

  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${socket.username}`);
    if (socket.username) {
      delete usernames[socket.username];
      socket.broadcast.emit(
        "updatechat",
        "Chat Bot",
        `${socket.username} has left the chat`
      );
      io.emit("updateusers", Object.keys(usernames));
    }
  });
});
// Server and database connection
const port = process.env.PORT || 3000;
const url = process.env.MONGO_URI;

const start = async () => {
  try {
    await connect(url).catch((err) => console.error(err.message));
    // logger.info("Connected to DB");
    server.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error("Error connecting to the database:", error);
    process.exit(1); // Exit the process if DB connection fails
  }
};

start();
