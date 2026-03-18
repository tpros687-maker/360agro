import Pedido from "../models/pedidoModel.js";
import Proveedor from "../models/proveedorModel.js";
import Producto from "../models/productoModel.js";

// =======================================================
// CREAR UN PEDIDO (SMART ORDER)
// =======================================================
export const crearPedido = async (req, res) => {
    try {
        const { items, datosEnvio, total, vendedorId } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ mensaje: "El pedido no contiene productos." });
        }

        // Buscar al proveedor receptor
        const vendedor = await Proveedor.findById(vendedorId);
        if (!vendedor) {
            return res.status(404).json({ mensaje: "Tienda (Vendedor) no encontrada." });
        }

        // Crear el Pedido
        const nuevoPedido = await Pedido.create({
            comprador: req.user._id,
            vendedor: vendedor._id,
            items,
            total,
            datosEnvio,
            estado: "Pendiente",
        });

        res.status(201).json(nuevoPedido);
    } catch (error) {
        console.error("❌ Error al crear pedido:", error);
        res.status(500).json({ mensaje: "Error interno al crear el pedido." });
    }
};

// =======================================================
// OBTENER MIS PEDIDOS (COMO COMPRADOR)
// =======================================================
export const obtenerMisPedidos = async (req, res) => {
    try {
        const pedidos = await Pedido.find({ comprador: req.user._id })
            .populate("vendedor", "nombre slug logo")
            .populate("items.producto", "titulo nombre fotoPrincipal")
            .sort({ createdAt: -1 });

        res.status(200).json(pedidos);
    } catch (error) {
        console.error("❌ Error al obtener mis pedidos:", error);
        res.status(500).json({ mensaje: "Error interno." });
    }
};

// =======================================================
// OBTENER ÓRDENES RECIBIDAS (COMO VENDEDOR/TIENDA)
// =======================================================
export const obtenerOrdenesRecibidas = async (req, res) => {
    try {
        const miTienda = await Proveedor.findOne({ usuario: req.user._id });

        if (!miTienda) {
            return res.status(404).json({ mensaje: "No administras ninguna Tienda." });
        }

        const ordenes = await Pedido.find({ vendedor: miTienda._id })
            .populate("comprador", "nombre email telefono")
            .populate("items.producto", "titulo nombre precio fotoPrincipal")
            .sort({ createdAt: -1 });

        res.status(200).json(ordenes);
    } catch (error) {
        console.error("❌ Error al obtener órdenes recibidas:", error);
        res.status(500).json({ mensaje: "Error interno." });
    }
};

// =======================================================
// ACTUALIZAR ESTADO DE LA ORDEN (VENDEDOR)
// =======================================================
export const actualizarEstadoOrden = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const miTienda = await Proveedor.findOne({ usuario: req.user._id });
        if (!miTienda) {
            return res.status(403).json({ mensaje: "No autorizado." });
        }

        const pedido = await Pedido.findOne({ _id: id, vendedor: miTienda._id });
        if (!pedido) {
            return res.status(404).json({ mensaje: "Orden no encontrada." });
        }

        pedido.estado = estado;
        await pedido.save();

        res.status(200).json(pedido);
    } catch (error) {
        console.error("❌ Error al actualizar estado:", error);
        res.status(500).json({ mensaje: "Error interno." });
    }
};
