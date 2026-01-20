import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET public portfolio data for a user
export async function GET(
    request: Request,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params;

        const client = await clientPromise;
        const db = client.db();

        // Find user by username
        const user = await db.collection('users').findOne(
            { username },
            { projection: { password: 0, verificationToken: 0, verificationTokenExpiry: 0 } }
        );

        if (!user || !user.emailVerified) {
            return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
        }

        const userId = user._id;

        // Fetch all portfolio data in parallel
        const [profile, skills, projects, experience, education, hobbies, resumes, testimonials] = await Promise.all([
            db.collection('profiles').findOne({ userId }),
            db.collection('skills').find({ userId }).sort({ order: 1 }).toArray(),
            db.collection('projects').find({ userId }).sort({ order: 1 }).toArray(),
            db.collection('experience').find({ userId }).sort({ order: 1 }).toArray(),
            db.collection('education').find({ userId }).sort({ order: 1 }).toArray(),
            db.collection('hobbies').find({ userId }).sort({ order: 1 }).toArray(),
            db.collection('resumes').find({ userId }).toArray(),
            db.collection('testimonials').find({ userId, status: 'approved' }).sort({ createdAt: -1 }).toArray(),
        ]);

        return NextResponse.json({
            user: { name: user.name, username: user.username, image: user.image },
            profile: profile || { bio: { en: '', fr: '' }, headline: { en: '', fr: '' }, socialLinks: {} },
            skills,
            projects,
            experience,
            education,
            hobbies,
            resumes,
            testimonials,
        });
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
    }
}
