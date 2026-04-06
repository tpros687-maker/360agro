import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const userId = "69091cd0d9838b416a69fb5a"; // Mateo Aunchayna
const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

console.log("TOKEN:", token);
