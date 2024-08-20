import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: parseInt(SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, title, message } = req.body;

    try {
      const mailOptions = {
        from: SMTP_USER,
        to: 'alexislandolt67@gmail.com',
        subject: title,
        text: `Email: ${email}\n\nMessage: ${message}`,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ', info);

      return res.status(200).json({ success: true, message: 'Email envoyé avec succès.' });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email: ', error);
      return res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi de l\'email.' });
    }
  } else {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée.' });
  }
}