import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import User from '@/models/user';
import { hashPassword } from '@/lib/security/passwordUtils';

async function sendWelcomeEmail(email: string, username: string) {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            tls: {
                ciphers: 'SSLv3',
            },
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: 'nekodev67@outlook.com',
            to: email,
            subject: 'Bienvenue sur notre plateforme',
            text: `Bonjour ${username},\n\nBienvenue sur notre plateforme. Votre compte a été créé avec succès.`,
            html: `<h1>Bienvenue ${username}!</h1><p>Votre compte a été créé avec succès.</p><p>Rapprochez vous de l'admin pour recevoir votre mot de passe</p>`,
        };

        const result = await transporter.sendMail(mailOptions); // Utiliser `transporter` au lieu de `transport`
        console.log('Email sent...', result);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ success: false, message: 'Tous les champs sont requis.' });
        }

        try {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'L\'email est déjà utilisé.' });
            }

            const hashedPassword = await hashPassword(password);
            const newUser = await User.create({ email, password: hashedPassword, role });

            const emailSent = await sendWelcomeEmail(email, email); //sending welcome email 

            if (emailSent) {
                return res.status(201).json({ success: true, message: 'Utilisateur créé avec succès.', user: newUser });
            } else {
                return res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi de l\'email de bienvenue.' });
            }
        } catch (error) {
            console.error('Erreur lors de la création de l\'utilisateur :', error);
            return res.status(500).json({ success: false, message: 'Erreur serveur. Veuillez réessayer plus tard.', error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Méthode ${req.method} non autorisée`);
    }
}