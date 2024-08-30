import { NextApiRequest, NextApiResponse } from 'next';
import Avis, { AvisAttributes } from '@/models/avis';
import { ValidationError } from 'sequelize';
import { isValidString } from '@/lib/security/validateUtils';
import { checkRateLimit } from '@/lib/security/rateLimiter';

export default async function createAvis(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { pseudo, comment } = req.body;

            // Extract ip of the request
            const ip = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '';
            // Vérify limit rate
            if (!checkRateLimit(ip, 2)) {
            return res.status(429).json({ success: false, message: 'Trop de requêtes. Veuillez réessayer après 15 minutes.' });
            }             

            if (!isValidString(comment, 3, 150)) {
                return res.status(400).json({ success: false, message: 'Le commentaire doit être compris entre 3 et 150 caractére.' });
            } 
            if (!isValidString(pseudo, 3, 30)) {
                return res.status(400).json({ success: false, message: 'Le pseudo doit être compris entre 3 et 100 caractére.' });
            } 
            const newAvis = await Avis.create({ pseudo, comment, isValid: false } as AvisAttributes);

            res.status(200).json({ success: true, message: 'Review created successfully.', avis: newAvis });
        } catch (error) {
            if (error instanceof ValidationError) {
                const errorMessages = error.errors.map((err) => err.message);
                res.status(400).json({ success: false, message: errorMessages.join(', ') });
            } else {
                console.error('Error creating review:', error);
                res.status(500).json({ success: false, message: 'Failed to create the review.', error: String(error) });
            }
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed.`);
    }
}

(async () => {
    try {
        await Avis.sync({ alter: true });
        console.log('Avis table synchronized successfully');
    } catch (error) {
        console.error('Failed to synchronize Avis table:', error);
    }
})();