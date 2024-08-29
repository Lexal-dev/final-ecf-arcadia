import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import User from '@/models/user';
import { hashPassword } from '@/lib/security/passwordUtils';
import { validateRoleAccess } from '@/lib/security/validateUtils';

async function sendWelcomeEmail(email: string, username: string) {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_PORT === '465', // True if port is 465, else false
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: 'nekodev67@outlook.com',
            to: email,
            subject: 'Welcome to Our Platform',
            text: `Hello ${username},\n\nWelcome to our platform. Your account has been successfully created.`,
            html: `<h1>Welcome ${username}!</h1><p>Your account has been successfully created.</p><p>Contact the admin to receive your password.</p>`,
        };

        await transporter.sendMail(mailOptions); // Send email
        console.log('Email sent to', email);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // extract Authorization
    const token = req.headers.authorization?.split(' ')[1];
    // role verification
    if (!token || !validateRoleAccess('ADMIN', token)) {
        return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }    
    if (req.method === 'POST') {

        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }
        
        try {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email is already in use.' });
            }

            const hashedPassword = await hashPassword(password);
            const newUser = await User.create({ email, password: hashedPassword, role });

            // Send welcome email, but don't block user creation if it fails
            sendWelcomeEmail(email, email).catch(error => {
                // Log the error but continue
                console.error('Failed to send welcome email:', error);
            });

            return res.status(201).json({ success: true, message: 'User created successfully.', user: newUser });
        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({ success: false, message: 'Server error. Please try again later.', error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} not allowed`);
    }
}