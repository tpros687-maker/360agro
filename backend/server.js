import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";

// 1. Configuración inicial
dotenv.config();
connectDB();

// =======================================================
// 🟢 REGISTRO PREVENTIVO DE MODELOS (Fix MissingSchemaError)
// =======================================================
// Importamos los modelos antes que las rutas para que Mongoose los registre
import "./models/userModel.js";
import "./models/lotModel.js";
import "./models/productoModel.js"; // <--- Crucial para el chat de productos
import "./models/messageModel.js";
import "./models/tiendaModel.js";

// 2. Importación de Rutas
import userRoutes from "./routes/userRoutes.js";
import lotRoutes from "./routes/lotRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import subscripcionRoutes from "./routes/subscripcionRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import proveedorRoutes from "./routes/proveedorRoutes.js";
import tiendaRoutes from "./routes/tiendaRoutes.js";
import tiendaUploadRoutes from "./routes/tiendaUploadRoutes.js";
import productoRoutes from "./routes/productoRoutes.js";
import servicioUploadRoutes from "./routes/servicioUploadRoutes.js";
import servicioRoutes from "./routes/servicioRoutes.js";
import pedidoRoutes from "./routes/pedidoRoutes.js";

const app = express();
const server = http.createServer(app);

// ⭐ CONFIG SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(cors());
app.use(express.json());

// =======================================================
// 🟢 GESTIÓN DE DIRECTORIOS
// =======================================================
const folders = [
  "uploads",
  "uploads/tiendas",
  "uploads/servicios",
  "uploads/productos",
  "uploads/mensajes" // Añadida carpeta para archivos del chat
];

folders.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Carpeta asegurada: ${dir}`);
  }
});

app.use("/uploads", express.static("uploads"));

// =======================================================
// 🟢 RUTAS API
// =======================================================
app.use("/api/users", userRoutes);
app.use("/api/lots", lotRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/subscripciones", subscripcionRoutes);
app.use("/api/mensajes", messageRoutes);
app.use("/api/proveedores", proveedorRoutes);
app.use("/api/tiendas/upload", tiendaUploadRoutes);
app.use("/api/tiendas", tiendaRoutes);
app.use("/api/servicios-profesionales/upload", servicioUploadRoutes);
app.use("/api/servicios-profesionales", servicioRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/pedidos", pedidoRoutes);

app.get("/", (req, res) => {
  res.send("🚜 API 360 Agro Operativa con WebSockets 🔌");
});

// =======================================================
// 🟢 SOCKET.IO — LÓGICA HÍBRIDA (Lotes y Productos)
// =======================================================
io.on("connection", (socket) => {
  console.log("🟢 Terminal conectada:", socket.id);

  socket.on("joinChat", ({ referenciaId, userId, otroUsuarioId }) => {
    // Sala universal basada en la referencia (lote o producto) + el par de usuarios
    const room = `${referenciaId}-${userId}`;
    socket.join(room);
    console.log(`📌 Usuario ${userId} en sala de negociación: ${room}`);
  });

  socket.on("enviarMensaje", (mensaje) => {
    // Detectamos si es lote o producto para canalizar el socket
    const refId = mensaje.lote || mensaje.producto;
    const roomReceptor = `${refId}-${mensaje.receptor}`;
    const roomEmisor = `${refId}-${mensaje.emisor._id}`;

    io.to(roomReceptor).emit("nuevoMensaje", mensaje);
    io.to(roomEmisor).emit("nuevoMensaje", mensaje);
  });

  socket.on("disconnect", () => {
    console.log("❌ Terminal desconectada:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Servidor central funcionando en puerto ${PORT}`)
);