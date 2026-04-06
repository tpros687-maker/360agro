import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import http from "http";
import path from "path"; // Añadido para manejo de rutas
import { Server } from "socket.io";
import connectDB from "./config/db.js";

// 1. Configuración inicial (Actualizado: 2026-03-22T04:14:00)
dotenv.config();
connectDB();
initDefaults();

// 🟢 REGISTRO PREVENTIVO DE MODELOS
import "./models/userModel.js";
import "./models/lotModel.js";
import "./models/productoModel.js";
import "./models/messageModel.js";
import "./models/tiendaModel.js";
import "./models/costRecordModel.js";
import "./models/expenseModel.js";

// 2. Importación de Rutas
import userRoutes from "./routes/userRoutes.js";
import lotRoutes from "./routes/lotRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import subscripcionRoutes from "./routes/subscripcionRoutes.js";
import mercadoPagoRoutes from "./routes/mercadoPagoRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import proveedorRoutes from "./routes/proveedorRoutes.js";
import tiendaRoutes from "./routes/tiendaRoutes.js";
import tiendaUploadRoutes from "./routes/tiendaUploadRoutes.js";
import productoRoutes from "./routes/productoRoutes.js";
import servicioUploadRoutes from "./routes/servicioUploadRoutes.js";
import servicioRoutes from "./routes/servicioRoutes.js";
import pedidoRoutes from "./routes/pedidoRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import costRoutes from "./routes/costRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import gisRoutes from "./routes/gisRoutes.js";
import { initDefaults } from "./controllers/siteSettingsController.js";

const app = express();
const server = http.createServer(app);

// ⭐ CONFIG SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// ✅ MIDDLEWARES ESENCIALES (El orden importa)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // 👈 CRUCIAL: Para entender los datos del formulario

// 🟢 GESTIÓN DE DIRECTORIOS
const folders = [
  "uploads",
  "uploads/lotes", // 👈 Añadida carpeta específica para lotes
  "uploads/tiendas",
  "uploads/proveedores",
  "uploads/servicios",
  "uploads/productos",
  "uploads/mensajes"
];

folders.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Carpeta asegurada: ${dir}`);
  }
});

// ✅ Hacer pública la carpeta uploads
// 🖼 SERVIR ARCHIVOS ESTÁTICOS CON FALLBACK (PARA REPARAR RUTAS ROTAS)
app.use("/uploads", (req, res, next) => {
  const decodedPath = decodeURIComponent(req.path);
  const filePath = path.join(process.cwd(), "uploads", decodedPath);

  // 1. Intentar la ruta exacta (ej: uploads/servicios/foto.jpg)
  if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }

  // 2. Fallback: Si no existe en la subcarpeta, buscar en la raíz de uploads/
  // Esto repara automáticamente los registros viejos que apuntan a una subcarpeta inexistente.
  const fileName = path.basename(decodedPath);
  const fallbackPath = path.join(process.cwd(), "uploads", fileName);

  if (fs.existsSync(fallbackPath) && fs.lstatSync(fallbackPath).isFile()) {
    return res.sendFile(fallbackPath);
  }

  next();
});

// app.use("/uploads", express.static("uploads")); // Comentado en favor del middleware de arriba

// 🟢 RUTAS API
app.use("/api/users", userRoutes);
app.use("/api/lots", lotRoutes);
app.use("/api/planes", planRoutes);
app.use("/api/subscripciones", subscripcionRoutes);
app.use("/api/mercadopago", mercadoPagoRoutes);
app.use("/api/mensajes", messageRoutes);
app.use("/api/proveedores", proveedorRoutes);
app.use("/api/tiendas/upload", tiendaUploadRoutes);
app.use("/api/tiendas", tiendaRoutes);
app.use("/api/servicios-profesionales/upload", servicioUploadRoutes);
app.use("/api/servicios-profesionales", servicioRoutes);
app.use("/api/servicios", servicioRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/costs", costRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/gis", gisRoutes);

app.get("/", (req, res) => {
  res.send("🚜 API 360 Agro Operativa con WebSockets 🔌");
});

// 🟢 SOCKET.IO (Se mantiene igual)
io.on("connection", (socket) => {
  console.log("🟢 Terminal conectada:", socket.id);
  socket.on("joinChat", ({ referenciaId, userId }) => {
    const room = `${referenciaId}-${userId}`;
    socket.join(room);
  });
  socket.on("enviarMensaje", (mensaje) => {
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