import { NextApiRequest, NextApiResponse } from 'next';
import Avis, { AvisAttributes } from '@/models/avis';
import { ValidationError } from 'sequelize';

export default async function createAvis(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { pseudo, comment } = req.body;

            if (!pseudo || pseudo.length < 3 || pseudo.length > 30) {
                res.status(400).json({ success: false, message: 'The pseudonym must be between 3 and 30 characters long.' });
                return;
            }

            if (!comment || comment.length < 3 || comment.length > 150) {
                res.status(400).json({ success: false, message: 'The comment must be between 3 and 150 characters long.' });
                return;
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