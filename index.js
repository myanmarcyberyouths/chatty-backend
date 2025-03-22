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
const stickerRouter = require("./src/routes/stickerRouter");
const groupRouter = require("./src/routes/groupRouter");
const connect = require("./src/db/connect");
const logger = require("./src/utils/logger");
require("dotenv").config();
const chatService = require('./src/services/chatService');
const groupChatService = require('./src/services/groupChatService'); // Import group chat service

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(
  cors({
    origin: "*", 
    methods: ["GET", "POST" , "DELETE"],
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

io.on('connection', (socket) => {
  // Handle user connection
  chatService.handleConnection(socket);

  // Listen for chat history request (individual chat)
  socket.on('load messages', (data) => {
    chatService.loadMessages(socket, data);
  });

  // Listen for new chat messages (individual chat)
  socket.on('chat message', (data) => {
    chatService.saveMessage(io, data);
  });

  // Listen for joining a group
  socket.on('join group', (data) => {
    const { groupId } = data;
    socket.join(groupId); // Join the Socket.IO room for the group
    console.log(`User joined group room: ${groupId}`); // Debugging
  });

  // Listen for leaving a group
  socket.on('leave group', (data) => {
    const { groupId } = data;
    socket.leave(groupId); // Leave the Socket.IO room for the group
    console.log(`User left group room: ${groupId}`); // Debugging
  });

  // Listen for group chat history request
  socket.on('load group messages', (data) => {
    groupChatService.loadGroupMessages(socket, data);
  });

  // Listen for new group chat messages
  socket.on('group message', (data) => {
    groupChatService.saveGroupMessage(io, data);
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    chatService.handleDisconnection(socket);
  });
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

app.get("/", (req, res) => {
  logger.info("Welcome to the Chat App");
  res.sendFile(path.join(__dirname, "./src/index.html"));
});

// Use routers for handling user and auth routes
app.use("/api/v1", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1", messageRouter);
app.use("/api/v1", stickerRouter);
app.use("/api/v1/groups", groupRouter);

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
    process.exit(1); 
  }
};

start();
