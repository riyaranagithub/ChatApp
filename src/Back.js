import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import {User,Message} from "./models/user.js"
import connectDB from './config/database.js';
import cors from "cors";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173", // Your frontend origin
  methods: ["GET", "POST"],
}));
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Update this to match your Vite frontend port
    methods: ['GET', 'POST'],
  },
});

app.post("/signup", async (req, res) => {
  try {
    const hashedPassword=await bcrypt.hash(req.body.password,10)
    req.body.password=hashedPassword
    const user = new User(req.body);
    await user.save();
    res.status(200).send({ message: "User Added", user });
  } catch (error) {
    if (error.name === "ValidationError") {
      // Format errors into a field-specific structure
      const errors = Object.entries(error.errors).reduce((acc, [field, err]) => {
        acc[field] = err.message;
        return acc;
      }, {});
      return res.status(400).send({ message: "Validation Failed", errors });
    }
    res.status(400).send({ message: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the email exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If login is successful, generate a JWT or return a success response
    const token = "YourJWTToken"; // Replace with actual token generation logic
    res.status(200).json({ username: user.username, message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

app.get("/userall", async (req, res) => {
  try {
    const users = await User.find(); // Retrieves all users
    res.status(200).json(users);
  } catch (error) {
    res.status(400).send("Something went wrong. Cannot find all users");
  }
});
app.get("/messageall", async (req, res) => {
  try {
    const messages = await Message.find(); // Retrieves all users
    res.status(200).json(messages);
  } catch (error) {
    res.status(400).send("Something went wrong. Cannot find all messages");
  }
});

app.post("/", async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;

    // Validate inputs
    if (!content || !sender || !receiver) {
      return res.status(400).send({ message: "Content, sender, or receiver is missing or invalid" });
    }

    // Save the message to the database
    const message = new Message({ sender, receiver, content });
    await message.save();

    res.status(200).send({ message: "Message saved successfully", messageData: message });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).send({ message: "Error saving message", error: error.message });
  }
});

//listens for incoming WebSocket connections from clients.
io.on('connection',(socket)=>{  //represents an individual client's connection to the server.
    console.log("user is connected")  //sets up an event listener that triggers whenever a client emits a 'chat message' event. The msg parameter contains the message sent by the client, which is then logged to the server console.
    socket.on('chat message', (msg) => {
      console.log("Broadcasting message:", msg);
        io.emit('chat message',msg)
      });

})

//sends the index.html file located in the src directory as the response. join(_dir, "src/index.html") ensures the path is resolved correctly.
// app.get('/',(req,res)=>{
//     res.sendFile(join(_dir,"index.html"))
// })



connectDB()
  .then(() => {
    console.log("Connection established");
    server.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.log("Connection not established", err);
  });
