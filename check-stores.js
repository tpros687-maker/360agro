import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './backend/.env' });

const ProveedorSchema = new mongoose.Schema({
    nombre: String,
    usuario: mongoose.Schema.Types.ObjectId,
    tipoProveedor: String,
    slug: String
}, { strict: false });

const Proveedor = mongoose.models.Proveedor || mongoose.model('Proveedor', ProveedorSchema);

async function inspect() {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected\n');

        const stores = await Proveedor.find({ tipoProveedor: 'tienda' });
        console.log(`Found ${stores.length} stores (tipoProveedor: "tienda"):`);
        stores.forEach(s => {
            console.log(`- [${s._id}] Name: ${s.nombre} | User: ${s.usuario} | Slug: ${s.slug}`);
        });

        const all = await Proveedor.find({});
        console.log(`\nTotal records in 'proveedors' collection: ${all.length}`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

inspect();
