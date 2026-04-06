import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';

dotenv.config();

const checkPlans = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}, 'nombre email plan');
        console.log('--- USUARIOS Y PLANES ---');
        users.forEach(u => {
            console.log(`${u.nombre} (${u.email}): [${u.plan}]`);
        });
        console.log('--- FIN ---');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkPlans();
