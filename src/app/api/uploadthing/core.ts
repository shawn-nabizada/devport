import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { auth } from '@/auth';

const f = createUploadthing();

export const ourFileRouter = {
    resumeUploader: f({
        pdf: { maxFileSize: '4MB', maxFileCount: 1 },
    })
        .middleware(async () => {
            const session = await auth();
            if (!session?.user?.id) throw new Error('Unauthorized');
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log('Resume uploaded by user:', metadata.userId);
            console.log('File URL:', file.ufsUrl);
            return { uploadedBy: metadata.userId, url: file.ufsUrl };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
