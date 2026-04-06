import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/userModel.js";
import bcrypt from "bcryptjs";

dotenv.config();

const testUserFlow = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        const email = "test@360agro.com";
        const password = "password123";

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User ${email} NOT found.`);
        } else {
            console.log(`User ${email} found. Checking password...`);
            const isMatch = await bcrypt.compare(password, user.password);
            console.log(`Password match for ${email}: ${isMatch}`);
            if (!isMatch) {
                console.log("Strored hash:", user.password);
                // Let's see if it's double hashed or something
                const rehashed = await bcrypt.hash(password, 10);
                console.log("Example hash for 'password123':", rehashed);
            }
        }

        // Test registration error
        console.log("Testing registration for new user...");
        try {
            const newUser = await User.create({
                nombre: "Seeding Test",
                email: `test_${Date.now()}@example.com`,
                password: "password123"
            });
            console.log("Registration successful for new user:", newUser.email);
        } catch (regError) {
            console.error("Registration FAILED:", regError);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error("Script failed:", error);
        process.exit(1);
    }
};

testUserFlow();
