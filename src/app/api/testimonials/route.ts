import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';
import { sanitizeString, sanitizeEmail, sanitizeUsername } from '@/lib/sanitize';

// GET testimonials for authenticated user (dashboard)
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db();
        const testimonials = await db
            .collection('testimonials')
            .find({ userId: new ObjectId(session.user.id) })
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json(testimonials);
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
    }
}

// POST - Public endpoint to submit a testimonial
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, authorName, authorEmail, authorTitle, authorCompany, content } = body;

        // Sanitize inputs
        const cleanUsername = sanitizeUsername(username);
        const cleanName = sanitizeString(authorName, 100);
        const cleanEmail = sanitizeEmail(authorEmail);
        const cleanTitle = sanitizeString(authorTitle || '', 100);
        const cleanCompany = sanitizeString(authorCompany || '', 100);
        const cleanContent = sanitizeString(content, 2000);

        if (!cleanUsername || !cleanName || !cleanEmail || !cleanContent) {
            return NextResponse.json({ error: 'All required fields must be valid' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        // Find the portfolio owner by username
        const owner = await db.collection('users').findOne({ username: cleanUsername });
        if (!owner) {
            return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
        }

        const now = new Date();
        await db.collection('testimonials').insertOne({
            userId: owner._id,
            authorName: cleanName,
            authorEmail: cleanEmail,
            authorTitle: cleanTitle || null,
            authorCompany: cleanCompany || null,
            content: cleanContent,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
        });

        return NextResponse.json({ message: 'Testimonial submitted for review' }, { status: 201 });
    } catch (error) {
        console.error('Error submitting testimonial:', error);
        return NextResponse.json({ error: 'Failed to submit testimonial' }, { status: 500 });
    }
}

