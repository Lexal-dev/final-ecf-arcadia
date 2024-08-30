import { checkRateLimit } from '@/lib/security/rateLimiter';
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

// Ensure all required environment variables are present
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
  throw new Error('Missing required environment variables for SMTP configuration.');
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: parseInt(SMTP_PORT, 10) || 587,
  secure: false, // Use true if you are using port 465 for SSL
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Extract ip of the request
    const ip = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '';
    // Vérify limit rate
    if (!checkRateLimit(ip, 1)) {
      return res.status(429).json({ success: false, message: 'Trop de requêtes. Veuillez réessayer après 15 minutes.' });
    } 
    const { email, title, message } = req.body;

    // Validate input data
    if (!email || !title || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    try {
      const mailOptions = {
        from: SMTP_USER,
        to: 'alexislandolt67@gmail.com',
        subject: title,
        text: `Email: ${email}\n\nMessage: ${message}`,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ', info.response); // Log only the response part

      return res.status(200).json({ success: true, message: 'Email sent successfully.' });
    } catch (error) {
      console.error('Error sending email: ', error);
      return res.status(500).json({ success: false, message: 'Error sending email.' });
    }
  } else {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }
}