import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import User from '@/models/user';
import { comparePasswords } from '@/lib/security/passwordUtils';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET;
const MAX_ATTEMPTS = 3; 
const BLOCKED_LIST_PATH = path.join(process.cwd(), 'lib', 'security', 'blockedList.txt');

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
}

// Generate JWT token
const generateToken = (userId: string, userRole: string, userEmail: string) => {
    return jwt.sign({ userId, userRole, userEmail }, JWT_SECRET, { expiresIn: '1h' });
};


const readBlockedList = (): Record<string, number> => {
    if (!fs.existsSync(BLOCKED_LIST_PATH)) {
        fs.writeFileSync(BLOCKED_LIST_PATH, '');
    }
    const blockedData = fs.readFileSync(BLOCKED_LIST_PATH, 'utf-8').split('\n').filter(Boolean);
    const blockedUsers: Record<string, number> = {};

    blockedData.forEach(line => {
        const [email, attempts] = line.split(' : ');
        if (email && attempts) {
            blockedUsers[email] = parseInt(attempts, 10);
        }
    });

    return blockedUsers;
};

// update blockedList
const writeBlockedList = (blockedUsers: Record<string, number>) => {
    const data = Object.entries(blockedUsers).map(([email, attempts]) => `${email} : ${attempts}`).join('\n');
    fs.writeFileSync(BLOCKED_LIST_PATH, data);
};

// User is blocked ? 
const isUserBlocked = (email: string): boolean => {
    const blockedUsers = readBlockedList();
    return blockedUsers[email] >= MAX_ATTEMPTS;
};

// Increment login attempts
const incrementLoginAttempts = (email: string) => {
    const blockedUsers = readBlockedList();
    blockedUsers[email] = (blockedUsers[email] || 0) + 1;
    writeBlockedList(blockedUsers);
    return blockedUsers[email];
};

// reset login attempts
const resetLoginAttempts = (email: string) => {
    const blockedUsers = readBlockedList();
    if (blockedUsers[email]) {
        delete blockedUsers[email];
        writeBlockedList(blockedUsers);
    }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        try {
            // Verify if user exist
            const user = await User.findOne({ where: { email } });

            if (!user) {
                // User Not exist
                return res.status(404).json({ success: false, message: 'E-mail incorrect.' });
            }

            // User is blocked ? 
            if (isUserBlocked(email)) {
                return res.status(403).json({ success: false, message: 'Ce compte est bloqué. Veuillez contacter l\'administrateur.' });
            }

            // Password is true?
            const isPasswordValid = await comparePasswords(password, user.password);

            if (!isPasswordValid) {
                const attempts = incrementLoginAttempts(email);
                if (attempts >= MAX_ATTEMPTS) {
                    return res.status(403).json({ success: false, message: 'Compte bloqué après plusieurs tentatives échouées.' });
                }
                
                return res.status(401).json({ success: false, message: 'Mot de passe incorrect.' });
            }

            // Reset login attempts
            resetLoginAttempts(email);

            // Generate JWT token
            const userIdAsString = user.id.toString();
            const token = generateToken(userIdAsString, user.role, user.email);

         
            const userData = {
                id: user.id,
                email: user.email,
                role: user.role,
            };

            return res.status(200).json({ success: true, token, user: userData });
        } catch (error) {
            console.error('Erreur lors de l\'authentification :', error);
            return res.status(500).json({ success: false, message: 'Erreur serveur, veuillez réessayer plus tard.', error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Méthode ${req.method} non autorisée`);
    }
}