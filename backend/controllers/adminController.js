import User from "../models/userModel.js";
import Lote from "../models/lotModel.js";
import Producto from "../models/productoModel.js";
import Subscripcion from "../models/subscripcionModel.js";
import Proveedor from "../models/proveedorModel.js";

/**
 * 📊 ESTADÍSTICAS GLOBALES (ADMIN)
 */
export const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalLotes = await Lote.countDocuments();
        const totalProductos = await Producto.countDocuments();
        const totalProveedores = await Proveedor.countDocuments();
        const subPendientes = await Subscripcion.countDocuments({ status: "Pendiente" });

        const proveedores = await Proveedor.find();
        const totalServicios = proveedores.reduce((acc, p) => acc + (p.servicios?.length || 0), 0);

        res.json({
            totalUsers,
            totalLotes,
            totalProductos,
            totalProveedores,
            totalServicios,
            subPendientes
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener estadísticas", error: error.message });
    }
};

/**
 * 📊 ESTADÍSTICAS PÚBLICAS (sin auth)
 */
export const getStatsPublicas = async (req, res) => {
    try {
        const totalLotes = await Lote.countDocuments({ estado: { $ne: "Vendido" } });
        const totalProveedores = await Proveedor.countDocuments();
        const proveedores = await Proveedor.find({}, "servicios");
        const totalServicios = proveedores.reduce((acc, p) => acc + (p.servicios?.length || 0), 0);

        res.json({ totalLotes, totalProveedores, totalServicios });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener stats" });
    }
};

/**
 * 👥 GESTIÓN DE USUARIOS
 */
export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort("-createdAt");
        res.json(users);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener usuarios", error: error.message });
    }
};

/**
 * ✅ VERIFICACIÓN MANUAL (AGRO-TRUST)
 */
export const toggleVerificacion = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ mensaje: "Usuario no encontrado" });

        user.esVerificado = !user.esVerificado;
        await user.save();

        // Sincronizar con el perfil de proveedor si existe
        await Proveedor.findOneAndUpdate({ usuario: id }, { esVerificado: user.esVerificado });

        res.json({ mensaje: `Usuario ${user.esVerificado ? 'verificado' : 'desverificado'} con éxito`, esVerificado: user.esVerificado });
    } catch (error) {
        res.status(500).json({ mensaje: "Error en verificación", error: error.message });
    }
};

/**
 * 💳 GESTIÓN DE SUBSCRIPCIONES PENDIENTES
 */
export const getSolicitudesSub = async (req, res) => {
    try {
        const solicitudes = await Subscripcion.find({ status: "Pendiente" })
            .populate("usuario", "nombre email plan")
            .sort("-createdAt");
        res.json(solicitudes);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener solicitudes", error: error.message });
    }
};

export const cambiarPlanUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { plan } = req.body;
        const planesValidos = ["observador", "productor", "pro", "empresa"];
        if (!planesValidos.includes(plan)) {
            return res.status(400).json({ mensaje: "Plan inválido" });
        }
        const usuario = await User.findByIdAndUpdate(
            id, { plan }, { new: true }
        ).select("-password");
        if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });
        res.json({ mensaje: `Plan actualizado a ${plan}`, usuario });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al cambiar plan", error: error.message });
    }
};

export const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await User.findById(id);
        if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });
        await User.findByIdAndDelete(id);
        res.json({ mensaje: "Usuario eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar usuario", error: error.message });
    }
};
