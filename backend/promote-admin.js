import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/userModel.js";

dotenv.config();

const promoteToAdmin = async (email) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const user = await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            { tipoUsuario: "admin" },
            { new: true }
        );

        if (user) {
            console.log(`User ${email} promoted to ADMIN successfully.`);
            console.log(user);
        } else {
            console.log(`User ${email} not found.`);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error promoting user:", error);
        process.exit(1);
    }
};

const email = process.argv[2];
if (!email) {
    console.log("Please provide an email: node promote-admin.js user@example.com");
    process.exit(1);
}

promoteToAdmin(email);
