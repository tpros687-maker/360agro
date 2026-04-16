import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// Elimina un recurso de Cloudinary dado su URL pública.
// Si la URL no es de Cloudinary (ej. ruta local antigua), no hace nada.
export const eliminarDeCloudinary = async (url) => {
  if (!url || !url.includes("cloudinary.com")) return;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  if (match) {
    await cloudinary.uploader.destroy(match[1]);
  }
};
