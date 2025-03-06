import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/user.models.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI); 
    console.log(`\nMongoDB connected successfully! DB host: ${connectionInstance.connection.host}`);
    const plainPassword = "123456789";
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    const existingUser = await User.findOne({ username: "anish123" });
    if (!existingUser) {
      await User.collection.insertOne({
        username: "anish123",
        password: hashedPassword,
        role: "master_admin",
        name: "Master Admin",
        phone: "0000000000",
        location: "default location",
        class: "default class"
      });
      console.log("Master admin inserted in database.");
    } else {
      console.log("Master admin already exists in database.");
    }
  } catch (error) {
    console.error("MongoDB Connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
