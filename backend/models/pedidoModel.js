import mongoose from "mongoose";

const itemPedidoSchema = new mongoose.Schema({
    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Producto",
        required: true,
    },
    cantidad: {
        type: Number,
        required: true,
        min: 1,
    },
    precioUnitario: {
        type: Number,
        required: true,
    },
});

const pedidoSchema = new mongoose.Schema(
    {
        comprador: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Almacenamos el Proveedor (Tienda) al que pertenece el pedido
        vendedor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Proveedor",
            required: true,
        },
        items: [itemPedidoSchema],
        total: {
            type: Number,
            required: true,
        },
        datosEnvio: {
            direccion: { type: String, required: true },
            telefono: { type: String, required: true },
            notas: { type: String, default: "" },
        },
        estado: {
            type: String,
            enum: ["Pendiente", "Coordinando", "Completado", "Cancelado"],
            default: "Pendiente",
        },
        numeroOrden: {
            type: String,
            unique: true,
        }
    },
    { timestamps: true }
);

// Middleware para autogenerar un Número de Orden legible
pedidoSchema.pre("save", async function (next) {
    if (!this.numeroOrden) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
        this.numeroOrden = `AM-ORD-${timestamp}-${random}`;
    }
    next();
});

const Pedido = mongoose.model("Pedido", pedidoSchema);
export default Pedido;
