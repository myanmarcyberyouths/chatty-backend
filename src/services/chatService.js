const Message = require('../models/message')

const chatService = {
    // Function to handle user connection
    handleConnection(socket) {
        const { user_id } = socket.handshake.query;

        if (user_id) {
            socket.join(user_id); // Join a room named after the user_id
            console.log(`User ${user_id} connected to their room`);
        }
    },

    // Function to load chat history between users
    loadMessages(socket, { sender_id, recipient_id }) {
        Message.find({
            $or: [
                { sender: sender_id, recipient: recipient_id },
                { sender: recipient_id, recipient: sender_id }
            ],
        })
            .sort({ timestamp: 1 }) // Sort by timestamp
            .then((messages) => {
                socket.emit('chat history', messages);
            })
            .catch((err) => {
                console.error('Error fetching messages:', err);
            });
    },

    // Function to save a new message and emit to users
    saveMessage(io, { sender, recipient, content }) {
        const newMessage = new Message({
            sender,
            recipient,
            content
        });

        newMessage.save()
            .then(() => {
                // Emit the message to both sender and recipient
                io.to(sender).emit('chat message', newMessage);
                io.to(recipient).emit('chat message', newMessage);
            })
            .catch((err) => {
                console.error('Error saving message:', err);
            });
    },

    // Function to handle user disconnection
    handleDisconnection(socket) {
        console.log('User disconnected:', socket.id);
    },
};

module.exports = chatService;
