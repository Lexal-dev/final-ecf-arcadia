import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import User from '@/models/user';
import { comparePasswords } from '@/lib/security/passwordUtils';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
}

// Generate JWT token 
const generateToken = (userId: string, userRole: string, userEmail:string) => {
    return jwt.sign({ userId, userRole, userEmail }, JWT_SECRET, { expiresIn: '1h' });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        try {
            // Verify if users exist
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(404).json({ success: false, message: 'Adresse email ou mot de passe incorrect.' });
            }
            
            // Verify if password is correct with use comparePasswords
            const isPasswordValid = await comparePasswords(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ success: false, message: 'Adresse email ou mot de passe incorrect.' });
            }

            //Generate JWT token valid with userId and userRole
            const userIdAsString = user.id.toString();
            const token = generateToken(userIdAsString, user.role, user.email);

            // Prepare users data to return response
            const userData = {
                id: user.id,
                email: user.email,
                role: user.role,
            };

            return res.status(200).json({ success: true, token, user: userData });
        } catch (error) {
            console.error('Erreur lors de l\'authentification :', error);
            return res.status(500).json({ success: false, message: 'Erreur serveur. Veuillez réessayer plus tard.', error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Méthode ${req.method} non autorisée`);
    }
}