import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://riyarana20062021:riya123@chatapp.xityg.mongodb.net/"
  );
};

export default connectDB
