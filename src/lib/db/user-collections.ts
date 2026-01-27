import { Db, ObjectId } from 'mongodb';

/**
 * List of all collections that store user-related data.
 * Used for cascade deletion when a user is deleted.
 * 
 * IMPORTANT: If you add a new collection that stores data with a userId field,
 * you MUST add it to this list to ensure proper cleanup on user deletion.
 */
export const USER_COLLECTIONS = [
    // Single document per user (use deleteOne)
    { name: 'profiles', single: true },
    { name: 'themeSettings', single: true },
    { name: 'notification_preferences', single: true },

    // Multiple documents per user (use deleteMany)
    { name: 'skills', single: false },
    { name: 'projects', single: false },
    { name: 'experience', single: false },
    { name: 'education', single: false },
    { name: 'hobbies', single: false },
    { name: 'resumes', single: false },
    { name: 'testimonials', single: false },
    { name: 'messages', single: false },
    { name: 'layouts', single: false },
    { name: 'blocks', single: false },
] as const;

/**
 * Cascade delete all user data from all related collections.
 * @param db MongoDB database instance
 * @param userId The user's ObjectId
 */
export async function cascadeDeleteUserData(db: Db, userId: ObjectId): Promise<void> {
    await Promise.all([
        // Delete the user document itself
        db.collection('users').deleteOne({ _id: userId }),

        // Delete all related data
        ...USER_COLLECTIONS.map(collection =>
            collection.single
                ? db.collection(collection.name).deleteOne({ userId })
                : db.collection(collection.name).deleteMany({ userId })
        ),
    ]);
}
