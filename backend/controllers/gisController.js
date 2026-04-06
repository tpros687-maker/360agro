import GisAsset from "../models/gisAssetModel.js";

// @desc    Obtener todos los activos GIS del usuario
// @route   GET /api/gis
// @access  Private
export const getGisAssets = async (req, res) => {
    try {
        const assets = await GisAsset.find({ usuario: req.user._id });
        res.json(assets);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener activos GIS", error: error.message });
    }
};

// @desc    Crear un nuevo activo GIS
// @route   POST /api/gis
// @access  Private
export const createGisAsset = async (req, res) => {
    const { nombre, tipo, subtipo, geometry, hectareas, isSubdivision, cultivo, cabezas, categoria, center, nombrePotrero, numeroFranja, estadoPastoreo, fechaUltimoMovimiento, cabezasActuales, logbook, planificacionInsumos, subdivisiones, franjaActual } = req.body;

    try {
        const asset = new GisAsset({
            usuario: req.user._id,
            nombre,
            tipo,
            geometry,
            hectareas,
            isSubdivision,
            cultivo,
            cabezas,
            categoria,
            center,
            nombrePotrero,
            numeroFranja,
            estadoPastoreo,
            fechaUltimoMovimiento,
            cabezasActuales,
            logbook,
            planificacionInsumos,
            subtipo,
            subdivisiones,
            franjaActual
        });

        const createdAsset = await asset.save();
        res.status(201).json(createdAsset);
    } catch (error) {
        console.error("Error validación Mongoose:", error.message);
        res.status(400).json({ mensaje: "Error al crear activo GIS", error: error.message });
    }
};

// @desc    Actualizar un activo GIS
// @route   PUT /api/gis/:id
// @access  Private
export const updateGisAsset = async (req, res) => {
    try {
        const asset = await GisAsset.findById(req.params.id);

        if (asset && asset.usuario.toString() === req.user._id.toString()) {
            asset.nombre = req.body.nombre || asset.nombre;
            asset.tipo = req.body.tipo || asset.tipo;
            asset.geometry = req.body.geometry || asset.geometry;
            asset.hectareas = req.body.hectareas ?? asset.hectareas;
            asset.isSubdivision = req.body.isSubdivision ?? asset.isSubdivision;
            asset.cultivo = req.body.cultivo || asset.cultivo;
            asset.cabezas = req.body.cabezas ?? asset.cabezas;
            asset.categoria = req.body.categoria || asset.categoria;
            asset.center = req.body.center || asset.center;
            asset.nombrePotrero = req.body.nombrePotrero || asset.nombrePotrero;
            asset.numeroFranja = req.body.numeroFranja ?? asset.numeroFranja;
            asset.subtipo = req.body.subtipo || asset.subtipo;

            // --- GESTIÓN DE PASTOREO (FARM OS) ---
            if (req.body.estadoPastoreo && req.body.estadoPastoreo !== asset.estadoPastoreo) {
                asset.estadoPastoreo = req.body.estadoPastoreo;
                asset.fechaUltimoMovimiento = new Date(); // Si cambia el estado, se resetea el reloj
            }
            asset.cabezasActuales = req.body.cabezasActuales ?? asset.cabezasActuales;
            if (req.body.fechaUltimoMovimiento) asset.fechaUltimoMovimiento = req.body.fechaUltimoMovimiento;

            // --- PASTOREO ROTATIVO (NUEVO) ---
            asset.subdivisiones = req.body.subdivisiones ?? asset.subdivisiones;
            asset.franjaActual = req.body.franjaActual ?? asset.franjaActual;

            // --- FARM OS EXTENSIONS (LOGBOOK & PLANNING) ---
            if (req.body.logbook) asset.logbook = req.body.logbook;
            if (req.body.planificacionInsumos) asset.planificacionInsumos = req.body.planificacionInsumos;

            // Atajo para insertar una sola entrada en el logbook
            if (req.body.newLogEntry) {
                asset.logbook.push({
                    tipo: req.body.newLogEntry.tipo,
                    descripcion: req.body.newLogEntry.descripcion,
                    fecha: new Date(),
                    severidad: req.body.newLogEntry.severidad || 'Normal'
                });
            }

            const updatedAsset = await asset.save();
            res.json(updatedAsset);
        } else {
            res.status(404).json({ mensaje: "Activo GIS no encontrado" });
        }
    } catch (error) {
        res.status(400).json({ mensaje: "Error al actualizar activo GIS", error: error.message });
    }
};

// @desc    Eliminar un activo GIS
// @route   DELETE /api/gis/:id
// @access  Private
export const deleteGisAsset = async (req, res) => {
    try {
        const asset = await GisAsset.findById(req.params.id);

        if (asset && asset.usuario.toString() === req.user._id.toString()) {
            await asset.deleteOne();
            res.json({ mensaje: "Activo GIS eliminado" });
        } else {
            res.status(404).json({ mensaje: "Activo GIS no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar activo GIS", error: error.message });
    }
};
