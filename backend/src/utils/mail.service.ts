import { getEmailTransporter } from './mail.config.js';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

class EmailQueue {
    private queue: EmailOptions[] = [];
    private processing = false;

    async add(email: EmailOptions): Promise<void> {
        this.queue.push(email);
        if (!this.processing) {
            this.process();
        }
    }

    private async process(): Promise<void> {
        if (this.queue.length === 0) {
            this.processing = false;
            return;
        }

        this.processing = true;
        const email = this.queue.shift();

        if (email) {
            try {
                await this.sendEmail(email);
            } catch (error) {
                console.error('Failed to send email:', error);
            }
        }

        setTimeout(() => this.process(), 100); 
    }

    private async sendEmail(options: EmailOptions): Promise<void> {
        const transporter = getEmailTransporter();
        await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'Cozy'}" <${process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });
    }
}

// Singleton instance of the email queue
const emailQueue = new EmailQueue();

// Email templates
const getEmailTemplate = (title: string, content: string): string => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: #ffffff;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #333;
                margin-bottom: 10px;
            }
            .content {
                margin-bottom: 30px;
            }
            .otp-code {
                background-color: #f8f9fa;
                border: 2px dashed #dee2e6;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 25px 0;
            }
            .otp-code-value {
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #333;
                font-family: 'Courier New', monospace;
            }
            .expiry-text {
                color: #6c757d;
                font-size: 14px;
                margin-top: 10px;
            }
            .footer {
                text-align: center;
                color: #6c757d;
                font-size: 12px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
            }
            .warning {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 12px;
                margin: 20px 0;
                border-radius: 4px;
                color: #856404;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Cozy</div>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>&copy; ${new Date().getFullYear()} Cozy. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Email service functions
export const EmailService = {
  
    sendVerificationEmail: async (email: string, code: string, name: string): Promise<void> => {
        const content = `
            <h2>Welcome to Cozy, ${name}!</h2>
            <p>Thank you for registering. To complete your registration, please verify your email address using the code below:</p>
            <div class="otp-code">
                <div class="otp-code-value">${code}</div>
                <div class="expiry-text">This code will expire in 10 minutes</div>
            </div>
            <p>If you didn't create an account with Cozy, please ignore this email.</p>
        `;

        await emailQueue.add({
            to: email,
            subject: 'Verify Your Email - Cozy',
            html: getEmailTemplate('Email Verification', content),
        });
    },


    sendPasswordResetEmail: async (email: string, code: string, name: string): Promise<void> => {
        const content = `
            <h2>Password Reset Request</h2>
            <p>Hi ${name},</p>
            <p>We received a request to reset your password. Use the verification code below to proceed:</p>
            <div class="otp-code">
                <div class="otp-code-value">${code}</div>
                <div class="expiry-text">This code will expire in 10 minutes</div>
            </div>
            <div class="warning">
                <strong>⚠️ Security Warning:</strong> If you didn't request a password reset, please ignore this email and ensure your account is secure.
            </div>
        `;

        await emailQueue.add({
            to: email,
            subject: 'Password Reset Request - Cozy',
            html: getEmailTemplate('Password Reset', content),
        });
    },


    resendVerificationEmail: async (email: string, code: string, name: string): Promise<void> => {
        const content = `
            <h2>Verification Code Resent</h2>
            <p>Hi ${name},</p>
            <p>As requested, here's your new verification code:</p>
            <div class="otp-code">
                <div class="otp-code-value">${code}</div>
                <div class="expiry-text">This code will expire in 10 minutes</div>
            </div>
            <p>Please use this code to verify your email address.</p>
        `;

        await emailQueue.add({
            to: email,
            subject: 'Verification Code Resent - Cozy',
            html: getEmailTemplate('Verification Code', content),
        });
    },

    sendCustomEmail: async (options: EmailOptions): Promise<void> => {
        await emailQueue.add(options);
    },
};
