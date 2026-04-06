import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function inspect() {
    try {
        const client = await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected');

        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log('\nDatabases in Cluster:');
        dbs.databases.forEach(db => console.log(`- ${db.name}`));

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

inspect();
