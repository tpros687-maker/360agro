import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "agro/chat",
    resource_type: "auto",
  },
});

const uploadChat = multer({ storage });

export default uploadChat;
