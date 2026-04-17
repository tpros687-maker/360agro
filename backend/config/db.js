import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000, // Esperar 15s antes de fallar
      family: 4 // Forzar IPv4 (ayuda en redes con DNS SRV problemáticos en Windows)
    });
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    // Migración: eliminar índice único usuario_1 para permitir separar tienda/servicio
    try {
      await conn.connection.collection("proveedores").dropIndex("usuario_1");
      console.log("✅ Índice usuario_1 eliminado de proveedores");
    } catch (e) {
      // Si ya no existe, ignorar
    }
  } catch (error) {
    console.error(`❌ Error al conectar MongoDB: ${error.message}`);
    // No cerramos el proceso si está en desarrollo para permitir que nodemon reintente
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;
