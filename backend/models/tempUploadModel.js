import mongoose from "mongoose";

const tempUploadSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fotos: {
    type: [String],
    default: [],
  },
  video: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // 🧹 se borra automáticamente después de 1 hora
  },
});

const TempUpload = mongoose.model("TempUpload", tempUploadSchema);
export default TempUpload;
