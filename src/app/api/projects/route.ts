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
        const projects = await db
            .collection('projects')
            .find({ userId: new ObjectId(session.user.id) })
            .sort({ order: 1 })
            .toArray();

        return NextResponse.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, imageUrl, projectUrl, githubUrl, technologies, featured } = body;

        if (!title?.en || !title?.fr || !description?.en || !description?.fr) {
            return NextResponse.json(
                { error: 'Title and description required in both languages' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db();

        const lastProject = await db
            .collection('projects')
            .findOne(
                { userId: new ObjectId(session.user.id) },
                { sort: { order: -1 } }
            );
        const order = (lastProject?.order ?? -1) + 1;

        const now = new Date();
        const result = await db.collection('projects').insertOne({
            userId: new ObjectId(session.user.id),
            title,
            description,
            imageUrl: imageUrl || null,
            projectUrl: projectUrl || null,
            githubUrl: githubUrl || null,
            technologies: technologies || [],
            featured: featured ?? false,
            order,
            createdAt: now,
            updatedAt: now,
        });

        return NextResponse.json(
            { _id: result.insertedId, message: 'Project created' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}
