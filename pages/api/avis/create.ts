import { NextApiRequest, NextApiResponse } from 'next';
import Avis, { AvisAttributes } from '@/models/avis';
import { ValidationError } from 'sequelize';

export default async function createAvis(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { pseudo, comment } = req.body;

            if (!pseudo || pseudo.length < 3 || pseudo.length > 30) {
                res.status(400).json({ success: false, message: 'Le pseudo doit être compris entre 3 et 30 caractères.' });
                return;
            }

            if (!comment || comment.length < 3 || comment.length > 150) {
                res.status(400).json({ success: false, message: 'Le commentaire doit être compris entre 3 et 150 caractères.' });
                return;
            }

            const newAvis = await Avis.create({ pseudo, comment, isValid: false } as AvisAttributes);

            res.status(200).json({ success: true, message: 'Avis créé avec succès.', avis: newAvis });
        } catch (error) {
            if (error instanceof ValidationError) {
                const errorMessages = error.errors.map((err) => err.message);
                res.status(400).json({ success: false, message: errorMessages.join(', ') });
            } else {
                console.error('Error creating avis:', error);
                res.status(500).json({ success: false, message: 'Échec de la création de l\'avis.', error: String(error) });
            }
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Méthode ${req.method} non autorisée.`);
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