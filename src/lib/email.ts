import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'DevPort <onboarding@resend.dev>';

export async function sendVerificationEmail(
    email: string,
    name: string,
    code: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'Verify your DevPort account',
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
            <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; text-align: center;">
              <h1 style="color: #18181b; font-size: 24px; margin: 0 0 8px;">Welcome to DevPort!</h1>
              <p style="color: #71717a; font-size: 14px; margin: 0 0 32px;">Hi ${name}, here's your verification code:</p>
              
              <div style="background: #f4f4f5; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #18181b;">${code}</span>
              </div>
              
              <p style="color: #71717a; font-size: 12px; margin: 0;">This code expires in 24 hours.</p>
              <p style="color: #a1a1aa; font-size: 12px; margin: 16px 0 0;">If you didn't request this, you can safely ignore this email.</p>
            </div>
          </body>
        </html>
      `,
        });

        if (error) {
            console.error('Email send error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Email service error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send email',
        };
    }
}
