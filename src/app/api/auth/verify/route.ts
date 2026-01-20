import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, code } = body;

        if (!email || !code) {
            return NextResponse.json(
                { error: 'Email and code are required' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db();
        const usersCollection = db.collection('users');

        // Find user by email
        const user = await usersCollection.findOne({ email });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if already verified
        if (user.emailVerified) {
            return NextResponse.json(
                { error: 'Email already verified' },
                { status: 400 }
            );
        }

        // Check verification code
        if (user.verificationToken !== code) {
            return NextResponse.json(
                { error: 'Invalid verification code' },
                { status: 400 }
            );
        }

        // Check if code expired
        if (user.verificationTokenExpiry && new Date() > new Date(user.verificationTokenExpiry)) {
            return NextResponse.json(
                { error: 'Verification code expired' },
                { status: 400 }
            );
        }

        // Mark email as verified
        await usersCollection.updateOne(
            { email },
            {
                $set: {
                    emailVerified: new Date(),
                    updatedAt: new Date(),
                },
                $unset: {
                    verificationToken: '',
                    verificationTokenExpiry: '',
                },
            }
        );

        return NextResponse.json(
            { message: 'Email verified successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json(
            { error: 'Verification failed' },
            { status: 500 }
        );
    }
}
