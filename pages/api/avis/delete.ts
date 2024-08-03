import { NextApiRequest, NextApiResponse } from 'next';
import Avis from '@/models/avis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        const { id } = req.query as { id: string };

        try {
            if (!/^\d+$/.test(id)) {
                return res.status(400).json({ success: false, message: 'L\'ID de l\'avis n\'est pas valide.' });
            }

            const avis = await Avis.findByPk(id);

            if (!avis) {
                return res.status(404).json({ success: false, message: 'Avis non trouvé.' });
            }

            await avis.destroy();

            return res.status(200).json({ success: true, message: 'Avis supprimé avec succès.', avis });
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'avis :', error);
            return res.status(500).json({ success: false, message: 'Erreur serveur. Veuillez réessayer plus tard.', error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).end(`Méthode ${req.method} non autorisée.`);
    }
}