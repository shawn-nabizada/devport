import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface NotificationEmailOptions {
    to: string;
    userName: string;
}

/**
 * Send email notification when someone downloads a resume
 */
export async function sendResumeDownloadNotification(
    options: NotificationEmailOptions & { resumeLanguage: 'en' | 'fr' }
) {
    const { to, userName, resumeLanguage } = options;
    const languageLabel = resumeLanguage === 'en' ? 'English' : 'French';

    try {
        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'DevPort <noreply@devport.com>',
            to,
            subject: `📄 Someone downloaded your ${languageLabel} resume!`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #3b82f6;">Resume Downloaded!</h2>
                    <p>Hi ${userName},</p>
                    <p>Great news! Someone just downloaded your <strong>${languageLabel}</strong> resume from your DevPort portfolio.</p>
                    <p>This is a sign that recruiters are interested in your profile. Keep your portfolio updated to maximize opportunities!</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                    <p style="color: #6b7280; font-size: 12px;">
                        You're receiving this because you have resume download notifications enabled.
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings">Manage preferences</a>
                    </p>
                </div>
            `,
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to send resume download notification:', error);
        return { success: false, error };
    }
}

/**
 * Send email notification when someone submits a contact message
 */
export async function sendContactMessageNotification(
    options: NotificationEmailOptions & {
        senderName: string;
        senderEmail: string;
        subject?: string;
        messagePreview: string;
    }
) {
    const { to, userName, senderName, senderEmail, subject, messagePreview } = options;

    try {
        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'DevPort <noreply@devport.com>',
            to,
            subject: `📬 New message from ${senderName}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #3b82f6;">New Contact Message!</h2>
                    <p>Hi ${userName},</p>
                    <p>You have a new message from your DevPort portfolio:</p>
                    <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                        <p style="margin: 0 0 8px 0;"><strong>From:</strong> ${senderName} (${senderEmail})</p>
                        ${subject ? `<p style="margin: 0 0 8px 0;"><strong>Subject:</strong> ${subject}</p>` : ''}
                        <p style="margin: 0;"><strong>Message:</strong></p>
                        <p style="margin: 8px 0 0 0; color: #374151;">${messagePreview}</p>
                    </div>
                    <p>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/messages" 
                           style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
                            View Message
                        </a>
                    </p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                    <p style="color: #6b7280; font-size: 12px;">
                        You're receiving this because you have contact message notifications enabled.
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings">Manage preferences</a>
                    </p>
                </div>
            `,
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to send contact message notification:', error);
        return { success: false, error };
    }
}

/**
 * Send email notification when someone submits a testimonial
 */
export async function sendTestimonialNotification(
    options: NotificationEmailOptions & {
        authorName: string;
        authorTitle?: string;
        authorCompany?: string;
    }
) {
    const { to, userName, authorName, authorTitle, authorCompany } = options;
    const authorInfo = [authorTitle, authorCompany].filter(Boolean).join(' at ');

    try {
        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'DevPort <noreply@devport.com>',
            to,
            subject: `⭐ New testimonial from ${authorName}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #3b82f6;">New Testimonial Received!</h2>
                    <p>Hi ${userName},</p>
                    <p>Someone just submitted a testimonial for your DevPort portfolio:</p>
                    <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                        <p style="margin: 0;"><strong>${authorName}</strong></p>
                        ${authorInfo ? `<p style="margin: 4px 0 0 0; color: #6b7280;">${authorInfo}</p>` : ''}
                    </div>
                    <p>The testimonial is pending your approval. Review and approve it to display on your portfolio.</p>
                    <p>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/testimonials" 
                           style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
                            Review Testimonial
                        </a>
                    </p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                    <p style="color: #6b7280; font-size: 12px;">
                        You're receiving this because you have testimonial notifications enabled.
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings">Manage preferences</a>
                    </p>
                </div>
            `,
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to send testimonial notification:', error);
        return { success: false, error };
    }
}
