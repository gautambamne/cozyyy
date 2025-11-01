import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

export const getEmailTransporter = (): nodemailer.Transporter => {
    if (!transporter) {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('Email credentials are not configured. Please set EMAIL_USER and EMAIL_PASS in .env');
        }

        transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, 
            },
            pool: true,
            maxConnections: 5, 
            maxMessages: 100, 
        });

        // Verify connection configuration
        transporter.verify((error: Error | null) => {
            if (error) {
                console.error('Email transporter verification failed:', error);
            } else {
                console.log('Email server is ready to send messages');
            }
        });
    }

    return transporter;
};

// Cleanup function to close the transporter (useful for graceful shutdown)
export const closeEmailTransporter = async (): Promise<void> => {
    if (transporter) {
        transporter.close();
        transporter = null;
    }
};
