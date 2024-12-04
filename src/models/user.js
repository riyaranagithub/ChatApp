import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    minlength: [3, "Username must be at least 3 characters long"],
    maxlength: [30, "Username cannot exceed 30 characters"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(value) {
        console.log("Email validator running....");
        if (!validator.isEmail(value)) {
          throw new Error("Not a valid email: ");
        }
      },
      message: "Please provide a valid email address",
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    validate: {
      validator: function (value) {
        console.log("Password validator running....");
        if (!validator.isStrongPassword(value, {
          minLength: 8,
          minUppercase: 1,
          minLowercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })) {
          throw new Error("Password must be at least 8 characters long, including 1 uppercase, 1 lowercase, 1 number, and 1 special character");
        }
      },
      message: "Invalid password format",
    }}
});


const messageSchema = new mongoose.Schema({
  sender: String,
  receiver:String,
  content: String,
  timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);

export {User,Message}
