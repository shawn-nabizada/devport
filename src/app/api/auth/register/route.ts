import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';
import { sendVerificationEmail } from '@/lib/email';

function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, username, password } = body;

        // Validate required fields
        if (!name || !email || !username || !password) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Validate username format
        if (!/^[a-z0-9_-]+$/.test(username)) {
            return NextResponse.json(
                { error: 'Username can only contain lowercase letters, numbers, hyphens, and underscores' },
                { status: 400 }
            );
        }

        // Validate password length
        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db();
        const usersCollection = db.collection('users');

        // Check if email already exists
        const existingEmail = await usersCollection.findOne({ email });
        if (existingEmail) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            );
        }

        // Check if username already exists
        const existingUsername = await usersCollection.findOne({ username });
        if (existingUsername) {
            return NextResponse.json(
                { error: 'Username already taken' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Generate verification code
        const verificationToken = generateVerificationCode();
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create user
        const now = new Date();
        await usersCollection.insertOne({
            name,
            email,
            username,
            password: hashedPassword,
            role: 'user',
            emailVerified: null,
            verificationToken,
            verificationTokenExpiry,
            createdAt: now,
            updatedAt: now,
        });

        // Send verification email
        const emailResult = await sendVerificationEmail(email, name, verificationToken);
        if (!emailResult.success) {
            console.error('Failed to send verification email:', emailResult.error);
            // Still log to console as fallback
            console.log(`Verification code for ${email}: ${verificationToken}`);
        }

        return NextResponse.json(
            { message: 'Registration successful. Please check your email for verification code.' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Registration failed' },
            { status: 500 }
        );
    }
}
