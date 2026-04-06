import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/userModel.js";

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find().limit(5).select("email nombre");
        console.log("Users found:", JSON.stringify(users, null, 2));
        await mongoose.disconnect();
    } catch (error) {
        console.error("Error checking users:", error);
        process.exit(1);
    }
};

checkUsers();
