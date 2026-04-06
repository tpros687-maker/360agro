import SiteSettings from "../models/siteSettingsModel.js";

// @desc    Obtener todos los ajustes del sitio
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
    try {
        const settings = await SiteSettings.find();
        // Convertir a un objeto clave-valor para facilitar el uso en el frontend
        const config = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json(config);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener ajustes" });
    }
};

// @desc    Obtener ajustes con metadata (para el panel admin)
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getAdminSettings = async (req, res) => {
    try {
        const settings = await SiteSettings.find().sort({ category: 1 });
        res.json(settings);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener metadatos de ajustes" });
    }
};

// @desc    Actualizar o crear un ajuste
// @route   PATCH /api/admin/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
    const { settings } = req.body; // Array de { key, value }

    try {
        const promises = settings.map(s =>
            SiteSettings.findOneAndUpdate(
                { key: s.key },
                { value: s.value },
                { upsert: true, new: true }
            )
        );
        await Promise.all(promises);
        res.json({ mensaje: "Configuración actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar configuración" });
    }
};

// @desc    Inicializar ajustes por defecto (solo una vez)
export const initDefaults = async () => {
    const defaults = [
        // GENERAL
        { key: "navbar_brand", value: "360AGRO", category: "general", label: "Nombre de Marca", type: "text" },
        { key: "theme_primary", value: "#9ecfd7", category: "general", label: "Color Primario (Hex)", type: "text" },
        { key: "theme_secondary", value: "#3f6f76", category: "general", label: "Color Contenedores (Hex)", type: "text" },
        { key: "footer_description", value: "Ecosistema de gestión agropecuaria de alta performance.", category: "general", label: "Descripción Footer", type: "textarea" },

        // HOME HERO
        { key: "home_hero_title", value: "AL ALCANCE DEL", category: "home", label: "Título Hero (Parte 1)", type: "text" },
        { key: "home_hero_title_highlight", value: "PRODUCTOR", category: "home", label: "Título Hero (Destacado)", type: "text" },
        { key: "home_hero_subtitle", value: "La terminal digital líder para el mercado soberano. Operaciones seguras y trazabilidad absoluta integradas en un solo comando.", category: "home", label: "Subtítulo Hero", type: "textarea" },
        { key: "home_hero_cta_l", value: "EXPLORAR ACTIVOS", category: "home", label: "Botón Izquierdo", type: "text" },
        { key: "home_hero_cta_r", value: "PANEL DE CONTROL", category: "home", label: "Botón Derecho", type: "text" },

        // BENTO GRID
        { key: "home_bento_l_title", value: "Mercado de Lotes", category: "home", label: "Bento Izq: Título", type: "text" },
        { key: "home_bento_l_text", value: "Gestión de activos territoriales con precisión satelital.", category: "home", label: "Bento Izq: Texto", type: "text" },
        { key: "home_bento_m_title", value: "Showroom Tiendas", category: "home", label: "Bento Centro: Título", type: "text" },
        { key: "home_bento_m_text", value: "Suministros estratégicos de alta gama.", category: "home", label: "Bento Centro: Texto", type: "text" },
        { key: "home_bento_r_title", value: "Hub de Servicios", category: "home", label: "Bento Der: Título", type: "text" },
        { key: "home_bento_r_text", value: "Logística y asistencia técnica profesional.", category: "home", label: "Bento Der: Texto", type: "text" },

        // RADAR / MAPA
        { key: "home_map_title", value: "RADAR NACIONAL SINCRONIZADO", category: "mapa", label: "Título Mapa", type: "text" },
        { key: "home_map_subtitle", value: "Monitoreo en tiempo real de la infraestructura productiva nacional.", category: "mapa", label: "Subtítulo Mapa", type: "text" },

        // AGRO IA
        { key: "ai_welcome_msg", value: "Terminal de Inteligencia Agro-Noir activa. ¿En qué puedo asistir a la operación hoy?", category: "ia", label: "Mensaje Bienvenida IA", type: "textarea" }
    ];

    try {
        for (const d of defaults) {
            await SiteSettings.findOneAndUpdate({ key: d.key }, d, { upsert: true });
        }
        console.log("✅ Ajustes por defecto inicializados");
    } catch (error) {
        console.error("❌ Error al inicializar ajustes:", error);
    }
};
