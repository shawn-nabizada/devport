import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db();
        const resumes = await db
            .collection('resumes')
            .find({ userId: new ObjectId(session.user.id) })
            .toArray();

        return NextResponse.json(resumes);
    } catch (error) {
        console.error('Error fetching resumes:', error);
        return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { language, fileName, fileUrl, fileSize } = body;

        if (!language || !fileName || !fileUrl) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (language !== 'en' && language !== 'fr') {
            return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        // Delete existing resume for this language
        await db.collection('resumes').deleteOne({
            userId: new ObjectId(session.user.id),
            language,
        });

        // Insert new resume
        const result = await db.collection('resumes').insertOne({
            userId: new ObjectId(session.user.id),
            language,
            fileName,
            fileUrl,
            fileSize: fileSize || 0,
            uploadedAt: new Date(),
        });

        return NextResponse.json(
            { _id: result.insertedId, message: 'Resume saved' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error saving resume:', error);
        return NextResponse.json({ error: 'Failed to save resume' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const language = searchParams.get('language');

        if (!language) {
            return NextResponse.json({ error: 'Language required' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        await db.collection('resumes').deleteOne({
            userId: new ObjectId(session.user.id),
            language,
        });

        return NextResponse.json({ message: 'Resume deleted' });
    } catch (error) {
        console.error('Error deleting resume:', error);
        return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 });
    }
}
