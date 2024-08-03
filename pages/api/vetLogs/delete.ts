import { NextApiRequest, NextApiResponse } from 'next';
import VetLog from '@/models/vetLogs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        const { id } = req.query as { id: string };

        try {
            
            const vetLog = await VetLog.findByPk(id);

            if (!vetLog) {
                return res.status(404).json({ success: false, message: 'Rapport non trouvé.' });
            }

            // Delete vetLog
            await vetLog.destroy();

            return res.status(200).json({ success: true, message: 'Rapport supprimé avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la suppression du rapport :', error);
            return res.status(500).json({ success: false, message: 'Erreur serveur. Veuillez réessayer plus tard.', error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).end(`Méthode ${req.method} non autorisée`);
    }
}