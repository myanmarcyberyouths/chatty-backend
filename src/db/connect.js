require('dotenv').config();
const mongoose = require('mongoose')

const connect = async () => {
    const url = process.env.MONGO_URI;
    try {
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

module.exports = connect;
