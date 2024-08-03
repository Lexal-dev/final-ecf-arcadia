import { NextApiRequest, NextApiResponse } from 'next';
import Avis from '@/models/avis';
import { ValidationError } from 'sequelize';

interface UpdateBody {
    isValid: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'PUT') {
        const { id } = req.query as { id: string };
        const { isValid } = req.body as UpdateBody;

        try {
            // Verify if id is integer
            if (!/^\d+$/.test(id)) {
                return res.status(400).json({ success: false, message: 'L\'ID de l\'avis n\'est pas valide.' });
            }

            // Vérifier si isValid est un boolean
            if (typeof isValid !== 'boolean') {
                return res.status(400).json({ success: false, message: 'La valeur de validation n\'est pas valide.' });
            }

            const avis = await Avis.findByPk(id);

            if (!avis) {
                return res.status(404).json({ success: false, message: 'Avis non trouvé.' });
            }

            avis.isValid = isValid;
            await avis.save();

            return res.status(200).json({ success: true, message: 'Avis mis à jour avec succès.', avis });
        } catch (error) {
            if (error instanceof ValidationError) {
                const errorMessages = error.errors.map((err) => err.message);
                return res.status(400).json({ success: false, message: errorMessages.join(', ') });
            } else {
                console.error('Erreur lors de la mise à jour de l\'avis :', error);
                return res.status(500).json({ success: false, message: 'Erreur serveur. Veuillez réessayer plus tard.', error: String(error) });
            }
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        return res.status(405).end(`Méthode ${req.method} non utilisée`);
    }
}