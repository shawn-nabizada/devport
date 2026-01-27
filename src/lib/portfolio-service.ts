import { cache } from 'react';
import clientPromise from '@/lib/mongodb';

const _getPortfolio = async (username: string) => {
    try {
        const client = await clientPromise;
        const db = client.db();

        // Find user by username
        const user = await db.collection('users').findOne(
            { username },
            { projection: { password: 0, verificationToken: 0, verificationTokenExpiry: 0 } }
        );

        if (!user || (!user.emailVerified && user.role !== 'admin')) { // Allow admin or verified
            // Note: Original route checked emailVerified.
            if (!user || (!user.emailVerified)) return null;
        }

        const userId = user._id;

        // Fetch all portfolio data in parallel
        const [profile, skills, projects, experience, education, hobbies, resumes, testimonials, themeSettings, layouts, blocks] = await Promise.all([
            db.collection('profiles').findOne({ userId }),
            db.collection('skills').find({ userId }).sort({ order: 1 }).toArray(),
            db.collection('projects').find({ userId }).sort({ order: 1 }).toArray(),
            db.collection('experience').find({ userId }).sort({ order: 1 }).toArray(),
            db.collection('education').find({ userId }).sort({ order: 1 }).toArray(),
            db.collection('hobbies').find({ userId }).sort({ order: 1 }).toArray(),
            db.collection('resumes').find({ userId }).toArray(),
            db.collection('testimonials').find({ userId, status: 'approved' }).sort({ createdAt: -1 }).toArray(),
            db.collection('themeSettings').findOne({ userId }),
            db.collection('layouts').find({ userId }).toArray(),
            db.collection('blocks').find({ userId }).toArray(),
        ]);

        // Convert ObjectIds to strings for serialization if passing to Client Component from Server Component
        // Next.js Server Actions/Components can serialize simple objects but ObjectIds often cause issues ("Only plain objects...")
        // We will need to map _id to string.

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const serialize = (obj: any): any => {
            if (!obj) return obj;
            if (Array.isArray(obj)) return obj.map(serialize);
            if (obj && typeof obj === 'object') {
                if (obj._id) obj._id = obj._id.toString();
                if (obj.userId) obj.userId = obj.userId.toString();
                // Date handling? JSON.stringify handles dates as strings, which is fine for props usually.
                // But Next.js might complain about Date objects.
                // We should convert Dates to strings.
                for (const key in obj) {
                    if (obj[key] instanceof Date) {
                        obj[key] = obj[key].toISOString();
                    } else if (typeof obj[key] === 'object') {
                        obj[key] = serialize(obj[key]);
                    }
                }
            }
            return obj;
        };

        return serialize({
            user: { name: user.name, username: user.username, image: user.image },
            profile: profile || { bio: { en: '', fr: '' }, headline: { en: '', fr: '' }, socialLinks: {} },
            skills,
            projects,
            experience,
            education,
            hobbies,
            resumes,
            testimonials,
            themeId: themeSettings?.themeId || 'tech',
            customColors: themeSettings?.customColors || null,
            layouts,
            blocks,
        });

    } catch (error) {
        console.error('Error in getPortfolio:', error);
        return null;
    }
};

// Wrap with React cache() to deduplicate calls during the same request
// (e.g., generateMetadata + page component both call this)
export const getPortfolio = cache(_getPortfolio);
