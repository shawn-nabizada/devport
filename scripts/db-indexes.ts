/**
 * Database Index Setup Script
 * Run with: npx tsx scripts/db-indexes.ts
 * 
 * This creates unique indexes on the users collection for:
 * - username (case-insensitive via collation)
 * - email
 */

import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env.local
function loadEnv() {
    try {
        const envPath = resolve(process.cwd(), '.env.local');
        const envContent = readFileSync(envPath, 'utf-8');
        for (const line of envContent.split('\n')) {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                if (!process.env[key.trim()]) {
                    process.env[key.trim()] = value;
                }
            }
        }
    } catch {
        // .env.local might not exist, that's okay if MONGODB_URI is set
    }
}

loadEnv();

async function setupIndexes() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error('MONGODB_URI environment variable is not set');
        process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();

        console.log('Creating indexes on users collection...');

        // Unique index on username with case-insensitive collation
        await db.collection('users').createIndex(
            { username: 1 },
            {
                unique: true,
                collation: { locale: 'en', strength: 2 },
                name: 'username_unique_ci'
            }
        );
        console.log('✓ Created unique index on username (case-insensitive)');

        // Unique index on email
        await db.collection('users').createIndex(
            { email: 1 },
            {
                unique: true,
                name: 'email_unique'
            }
        );
        console.log('✓ Created unique index on email');

        // List all indexes to confirm
        const indexes = await db.collection('users').listIndexes().toArray();
        console.log('\nCurrent indexes on users collection:');
        indexes.forEach(idx => {
            console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
        });

        console.log('\n✅ All indexes created successfully!');
    } catch (error) {
        if ((error as { code?: number }).code === 11000) {
            console.error('❌ Duplicate key error: Some users already have duplicate usernames or emails.');
            console.error('   You need to resolve duplicates before creating unique indexes.');
        } else {
            console.error('❌ Error creating indexes:', error);
        }
        process.exit(1);
    } finally {
        await client.close();
    }
}

setupIndexes();
