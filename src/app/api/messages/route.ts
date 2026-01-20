import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';
import { sanitizeString, sanitizeEmail, sanitizeUsername } from '@/lib/sanitize';

// GET all messages for the authenticated user
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db();
        const messages = await db
            .collection('messages')
            .find({ userId: new ObjectId(session.user.id) })
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

// POST - Public endpoint to send a message to a portfolio owner
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, senderName, senderEmail, subject, message } = body;

        // Sanitize inputs
        const cleanUsername = sanitizeUsername(username);
        const cleanName = sanitizeString(senderName, 100);
        const cleanEmail = sanitizeEmail(senderEmail);
        const cleanSubject = sanitizeString(subject || '', 200);
        const cleanMessage = sanitizeString(message, 5000);

        if (!cleanUsername || !cleanName || !cleanEmail || !cleanMessage) {
            return NextResponse.json(
                { error: 'All fields are required and must be valid' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db();

        // Find the portfolio owner by username
        const owner = await db.collection('users').findOne({ username: cleanUsername });
        if (!owner) {
            return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
        }

        // Save the message
        const now = new Date();
        await db.collection('messages').insertOne({
            userId: owner._id,
            senderName: cleanName,
            senderEmail: cleanEmail,
            subject: cleanSubject || null,
            message: cleanMessage,
            read: false,
            createdAt: now,
        });

        return NextResponse.json(
            { message: 'Message sent successfully' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}

