import path from "path";
import fs from "fs";

const testPath = "/servicios/1774141937433-WhatsApp Image 2026-02-19 at 21.17.40.jpeg";
const cwd = process.cwd();

console.log(`CWD: ${cwd}`);

const filePath = path.join(cwd, "uploads", testPath);
console.log(`Trying exact: ${filePath}`);
console.log(`Exists? ${fs.existsSync(filePath)}`);

const fileName = path.basename(testPath);
const fallbackPath = path.join(cwd, "uploads", fileName);
console.log(`Trying fallback: ${fallbackPath}`);
console.log(`Exists? ${fs.existsSync(fallbackPath)}`);

// Simulate encoded path
const encodedPath = "/servicios/1774141937433-WhatsApp%20Image%202026-02-19%20at%2021.17.40.jpeg";
const decoded = decodeURIComponent(encodedPath);
console.log(`Decoded: ${decoded}`);
const decodedFallback = path.join(cwd, "uploads", path.basename(decoded));
console.log(`Decoded Fallback Exists? ${fs.existsSync(decodedFallback)}`);
