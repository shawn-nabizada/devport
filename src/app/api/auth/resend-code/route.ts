import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { sendVerificationEmail } from '@/lib/email';

function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.emailVerified) {
            return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
        }

        // Generate new code
        const verificationToken = generateVerificationCode();
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await usersCollection.updateOne(
            { email },
            {
                $set: {
                    verificationToken,
                    verificationTokenExpiry,
                    updatedAt: new Date(),
                },
            }
        );

        // Send email
        const emailResult = await sendVerificationEmail(email, user.name || 'User', verificationToken);

        if (!emailResult.success) {
            console.error('Failed to send verification email:', emailResult.error);
            console.log(`Resend verification code for ${email}: ${verificationToken}`);
        }

        return NextResponse.json({ message: 'Verification code sent' });
    } catch (error) {
        console.error('Resend code error:', error);
        return NextResponse.json({ error: 'Failed to resend code' }, { status: 500 });
    }
}
