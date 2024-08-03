import { NextApiRequest, NextApiResponse } from 'next';
import Animal from '@/models/animal';
import Report from '@/models/report';
import VetLog from '@/models/vetLogs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = typeof req.query.id === 'string' ? req.query.id : undefined;

    if (!id) {
        res.status(400).json({ success: false, message: 'Un paramètre id est requis' });
        return;
    }

    if (req.method === 'DELETE') {
        try {
            const animal = await Animal.findByPk(Number(id));
            if (!animal) {
                res.status(404).json({ success: false, message: 'Animal non trouvé' });
                return;
            }

            // Delete dependent records in the reports table
            await Report.destroy({ where: { animalId: Number(id) } });
            await VetLog.destroy({ where: { animalId: Number(id) } });
            // delete l'animal
            await animal.destroy();

            res.status(200).json({ success: true, message: 'Animal supprimé avec succès' });
        } catch (error) {
            console.error('Échec de la suppression de l\'animal:', error);
            res.status(500).json({ success: false, message: 'Échec de la suppression de l\'animal', error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Méthode ${req.method} non autorisée`);
    }
}