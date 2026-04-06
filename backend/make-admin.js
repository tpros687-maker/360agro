import mongoose from 'mongoose';
import User from './models/userModel.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const promoteAccount = async (email) => {
    try {
        await connectDB();
        const user = await User.findOneAndUpdate(
            { email },
            { tipoUsuario: 'admin' },
            { new: true }
        );

        if (user) {
            console.log(`✅ USUARIO PROMOVIDO: ${user.nombre} (${user.email}) ahora es ADMIN.`);
        } else {
            console.log(`❌ ERROR: No se encontró ningún usuario con el email: ${email}`);
        }
    } catch (error) {
        console.error('❌ ERROR FATAL:', error.message);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

promoteAccount('mateoaun01@gmail.com');
