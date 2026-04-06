import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/userModel.js";
import Lote from "./models/lotModel.js";
import Proveedor from "./models/proveedorModel.js";
import Tienda from "./models/tiendaModel.js";
import Producto from "./models/productoModel.js";

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        // 1. Create or Find Test User
        let testUser = await User.findOne({ email: "test@360agro.com" });
        if (!testUser) {
            testUser = await User.create({
                nombre: "Productor Test",
                email: "test@360agro.com",
                password: "password123", // Will be hashed by pre-save
                plan: "pro",
                tipoUsuario: "proveedor",
                esVerificado: true
            });
            console.log("Test user created.");
        }

        // 2. Clear previous test data (optional, but good for clean tests)
        await Lote.deleteMany({ usuario: testUser._id });
        await Tienda.deleteMany({ usuario: testUser._id });
        const oldProveedor = await Proveedor.findOne({ usuario: testUser._id });
        if (oldProveedor) {
            await Producto.deleteMany({ proveedor: oldProveedor._id });
            await Proveedor.deleteOne({ _id: oldProveedor._id });
        }

        // 3. Create Proveedor
        const proveedor = await Proveedor.create({
            usuario: testUser._id,
            nombre: "Agro-Elite Solutions",
            rubro: "Ecosistema Agro Completo",
            descripcion: "Empresa líder en soluciones integrales para el productor rural uruguayo.",
            zona: "Durazno / Florida",
            telefono: "099123456",
            whatsapp: "099123456",
            email: "contacto@agroelite.com",
            esVerificado: true,
            rating: { promedio: 4.9, totalOpiniones: 12 },
            logo: "/uploads/tiendas/vet_logo.png",
            servicios: [
                {
                    nombre: "Inseminación Artificial de Alta Genética",
                    tipoServicio: "Veterinaria",
                    descripcion: "Servicio profesional de inseminación con toros de elite.",
                    zona: "Todo el país",
                    fotos: ["/uploads/servicios/inseminacion.png"],
                    estadisticas: { visitas: 15, whatsapp: 3, telefono: 1, email: 0 }
                },
                {
                    nombre: "Servicio de Cosecha de Precisión",
                    tipoServicio: "Maquinaria",
                    descripcion: "Cosecha de soja, maíz y trigo con tecnología de mapeo de rinde.",
                    zona: "Zona Núcleo (Soriano, Colonia, Río Negro)",
                    fotos: ["/uploads/servicios/cosecha.png"],
                    estadisticas: { visitas: 24, whatsapp: 5, telefono: 2, email: 1 }
                }
            ]
        });
        console.log("Proveedor and Services created.");

        // 4. Create Lotes
        const lotes = [
            {
                usuario: testUser._id,
                titulo: "50 Novillos Hereford de Calidad",
                descripcion: "Excelentes novillos Hereford, pesando en promedio 380kg. Muy buena genética y estado sanitario.",
                categoria: "Ganado Vacuno",
                raza: "Hereford",
                cantidad: 50,
                pesoPromedio: 380,
                precio: 850,
                ubicacion: "Durazno",
                fotos: ["/uploads/lotes/hereford_cattle.png"],
                destacado: true
            },
            {
                usuario: testUser._id,
                titulo: "Lote de Terneras Angus Seleccionadas",
                descripcion: "Terneras Angus de sobreaño, ideales para invernada o cría.",
                categoria: "Cria",
                raza: "Angus",
                cantidad: 30,
                pesoPromedio: 220,
                precio: 450,
                ubicacion: "Florida",
                fotos: ["/uploads/lotes/angus_calves.png"]
            },
            {
                usuario: testUser._id,
                titulo: "Tractor John Deere 6150J - Impecable",
                descripcion: "Tractor John Deere 6150J, año 2020. Pocas horas de uso, mantenimiento oficial.",
                categoria: "Maquinaria",
                precio: 75000,
                ubicacion: "Soriano",
                fotos: ["/uploads/lotes/john_deere.png"],
                destacado: true
            }
        ];
        await Lote.create(lotes);
        console.log("Lotes created.");

        // 5. Create Tienda
        const tienda = await Tienda.create({
            usuario: testUser._id,
            nombre: "Veterinaria y Repuestos El Ombú",
            categoria: "Veterinaria",
            descripcion: "Tu aliado en el campo. Insumos veterinarios y repuestos para maquinaria.",
            zona: "Durazno",
            telefono: "099654321",
            logo: "/uploads/tiendas/vet_logo.png",
            fotos: ["/uploads/tiendas/repuestos_logo.png"]
        });

        // 6. Create Productos
        const productos = [
            {
                proveedor: proveedor._id,
                titulo: "Vacuna Antiaftosa Galmed",
                descripcion: "Vacuna de alta eficacia para la prevención de aftosa en bovinos.",
                precio: 120,
                stock: 500,
                unidadMedida: "unidad",
                categoria: "Veterinaria",
                fotoPrincipal: "vacunas.png",
                fotos: ["vacunas.png"]
            },
            {
                proveedor: proveedor._id,
                titulo: "Kit de Filtros Donaldson para John Deere",
                descripcion: "Kit completo de filtros de aceite, aire y combustible.",
                precio: 4500,
                stock: 50,
                unidadMedida: "unidad",
                categoria: "Maquinaria",
                fotoPrincipal: "filtros.png",
                fotos: ["filtros.png"]
            }
        ];
        const createdProds = await Producto.create(productos);

        // Link products to tienda
        tienda.productos = createdProds.map(p => p._id);
        await tienda.save();
        console.log("Tienda and Products created.");

        console.log("SEEDING COMPLETED SUCCESSFULLY! 🚜🌾");
        await mongoose.disconnect();
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seedData();
