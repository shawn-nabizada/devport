import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/devport';

const seedUsers = [
    {
        name: 'Admin User',
        email: 'admin@devport.ca',
        username: 'admin',
        password: 'Admin123!',
        role: 'admin',
    },
    {
        name: 'Test User',
        email: 'user@devport.ca',
        username: 'testuser',
        password: 'User123!',
        role: 'user',
    },
];

async function seed() {
    console.log('🌱 Seeding database...');

    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const db = client.db();
        const users = db.collection('users');

        for (const userData of seedUsers) {
            const existing = await users.findOne({ email: userData.email });

            if (existing) {
                console.log(`  ✓ ${userData.role}: ${userData.email} (already exists)`);
                continue;
            }

            const hashedPassword = await bcrypt.hash(userData.password, 12);

            await users.insertOne({
                _id: new ObjectId(),
                name: userData.name,
                email: userData.email,
                username: userData.username,
                password: hashedPassword,
                role: userData.role,
                emailVerified: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            console.log(`  ✓ ${userData.role}: ${userData.email} (created)`);
        }

        console.log('✅ Seeding complete!');
        console.log('');
        console.log('Test accounts:');
        console.log('  Admin: admin@devport.ca / Admin123!');
        console.log('  User:  user@devport.ca / User123!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

seed();
