import dotenv from 'dotenv';
dotenv.config();

import jwt from 'jsonwebtoken';
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { User, Message } from './models/user.js';
import connectDB from './config/database.js';
import cors from 'cors';
import bcrypt from 'bcrypt';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
  })
);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
});

// Signup endpoint
app.post('/signup', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword;

    const user = new User(req.body);
    await user.save();
    res.status(200).send({ message: 'User Added', user });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.entries(error.errors).reduce((acc, [field, err]) => {
        acc[field] = err.message;
        return acc;
      }, {});
      return res.status(400).send({ message: 'Validation Failed', errors });
    }
    res.status(400).send({ message: error.message });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ username: user.username, message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// Get all users
app.get('/userall', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).send('Something went wrong. Cannot find all users');
  }
});

// Get all messages
app.get('/messageall', async (req, res) => {
  try {
    const messages = await Message.find();
    res.status(200).json(messages);
  } catch (error) {
    res.status(400).send('Something went wrong. Cannot find all messages');
  }
});

// Save message
app.post('/', async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;

    if (!content || !sender || !receiver) {
      return res.status(400).send({ message: 'Content, sender, or receiver is missing or invalid' });
    }

    const message = new Message({ sender, receiver, content });
    await message.save();

    res.status(200).send({ message: 'Message saved successfully', messageData: message });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).send({ message: 'Error saving message', error: error.message });
  }
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('User is connected');
  socket.on('chat message', (msg) => {
    console.log('Broadcasting message:', msg);
    io.emit('chat message', msg);
  });
});

// Connect to the database and start the server
connectDB()
  .then(() => {
    console.log('Database connection established');
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed', err);
  });
