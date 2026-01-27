// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Needed for direct script execution context


import { config } from 'dotenv';
config({ path: '.env.local' });
import clientPromise from '@/lib/mongodb';

async function checkTheme() {
    try {
        const client = await clientPromise;
        const db = client.db();

        // Find the user (assuming 'snabby' or first user)
        const user = await db.collection('users').findOne({});
        if (!user) {
            console.log('No users found');
            return;
        }

        console.log('Checking theme for user:', user.username, user._id);

        const settings = await db.collection('themeSettings').findOne({
            userId: user._id
        });

        console.log('Theme Settings:', settings);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkTheme();
