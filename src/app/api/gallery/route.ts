import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

/**
 * GET /api/gallery - List public portfolios with search/filter
 * Query params:
 *   - q: Search term (searches name, headline)
 *   - skills: Comma-separated skill names to filter by
 *   - page: Page number (default: 1)
 *   - limit: Results per page (default: 12, max: 50)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q')?.toLowerCase() || '';
        const skillsParam = searchParams.get('skills') || '';
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));
        const skip = (page - 1) * limit;

        const client = await clientPromise;
        const db = client.db();

        // Build aggregation pipeline starting from users collection
        // This ensures all users with usernames appear, even without explicit profile data
        const pipeline: object[] = [
            // Only include users with a username (required for public portfolio URL)
            {
                $match: {
                    username: { $exists: true, $nin: [null, ''] },
                },
            },

            // Left join with profiles collection (optional - user may not have saved profile)
            {
                $lookup: {
                    from: 'profiles',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'profile',
                },
            },
            {
                $unwind: {
                    path: '$profile',
                    preserveNullAndEmptyArrays: true, // Keep users without profiles
                },
            },

            // Left join with skills collection
            {
                $lookup: {
                    from: 'skills',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'skills',
                },
            },
        ];

        // Add search filter if provided
        if (query) {
            pipeline.push({
                $match: {
                    $or: [
                        { username: { $regex: query, $options: 'i' } },
                        { name: { $regex: query, $options: 'i' } },
                        { 'profile.headline.en': { $regex: query, $options: 'i' } },
                        { 'profile.headline.fr': { $regex: query, $options: 'i' } },
                        { 'profile.bio.en': { $regex: query, $options: 'i' } },
                        { 'profile.bio.fr': { $regex: query, $options: 'i' } },
                    ],
                },
            });
        }

        // Add skill filter if provided
        if (skillsParam) {
            const skillsList = skillsParam.split(',').map(s => s.trim().toLowerCase());
            pipeline.push({
                $match: {
                    $or: [
                        { 'skills.name.en': { $in: skillsList.map(s => new RegExp(s, 'i')) } },
                        { 'skills.name.fr': { $in: skillsList.map(s => new RegExp(s, 'i')) } },
                    ],
                },
            });
        }

        // Project the fields we need
        pipeline.push({
            $project: {
                userId: { $toString: '$_id' },
                username: '$username',
                name: '$name',
                image: '$image',
                headline: { $ifNull: ['$profile.headline', { en: '', fr: '' }] },
                bio: { $ifNull: ['$profile.bio', { en: '', fr: '' }] },
                location: '$profile.location',
                skills: {
                    $slice: [
                        {
                            $map: {
                                input: '$skills',
                                as: 'skill',
                                in: {
                                    name: '$$skill.name',
                                    proficiency: '$$skill.proficiency',
                                },
                            },
                        },
                        6, // Limit to 6 skills per portfolio
                    ],
                },
                featuredAt: '$profile.featuredAt',
            },
        });

        // Sort: featured first, then by most recently created
        pipeline.push({
            $sort: {
                featuredAt: -1,
                createdAt: -1,
            },
        });

        // Get total count for pagination
        const countPipeline = [...pipeline, { $count: 'total' }];
        const countResult = await db.collection('users').aggregate(countPipeline).toArray();
        const total = countResult[0]?.total || 0;

        // Add pagination
        pipeline.push({ $skip: skip }, { $limit: limit });

        const portfolios = await db.collection('users').aggregate(pipeline).toArray();

        // Separate featured and regular portfolios
        const featured = portfolios.filter(p => p.featuredAt);
        const regular = portfolios.filter(p => !p.featuredAt);

        return NextResponse.json({
            portfolios: [...featured, ...regular],
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching gallery:', error);
        return NextResponse.json({ error: 'Failed to fetch portfolios' }, { status: 500 });
    }
}
