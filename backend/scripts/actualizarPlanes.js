import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

const planes = [
  { nombre: "gratis",    tipo: "gratis",    precio: 0,  publicacionesMax: 0,   productosMax: 0,   serviciosMax: 0,   destacado: false, tienda: false, finance: false },
  { nombre: "productor", tipo: "productor", precio: 4,  publicacionesMax: 4,   productosMax: 0,   serviciosMax: 4,   destacado: false, tienda: false, finance: false },
  { nombre: "pro",       tipo: "pro",       precio: 9,  publicacionesMax: 999, productosMax: 999, serviciosMax: 999, destacado: false, tienda: true,  finance: false },
  { nombre: "empresa",   tipo: "empresa",   precio: 19, publicacionesMax: 999, productosMax: 999, serviciosMax: 999, destacado: true,  tienda: true,  finance: true  },
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Conectado a MongoDB");

  const col = mongoose.connection.collection("plans");
  const deleted = await col.deleteMany({});
  console.log(`Eliminados: ${deleted.deletedCount} planes`);

  const inserted = await col.insertMany(planes);
  console.log(`Insertados: ${inserted.insertedCount} planes`);

  await mongoose.disconnect();
  console.log("Listo.");
}

main().catch((err) => { console.error(err); process.exit(1); });
