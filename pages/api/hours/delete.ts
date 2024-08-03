import { NextApiRequest, NextApiResponse } from 'next';
import Hours from '@/models/hour';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "L'ID est requis" });
        }

        try {
            const hour = await Hours.findByPk(id);
            if (!hour) {
                return res.status(404).json({ success: false, message: "Horaire non trouvé" });
            }

            await hour.destroy();
            return res.status(200).json({ success: true, message: "Horaire supprimé avec succès" });
        } catch (error) {
            console.error("Erreur lors de la suppression de l'horaire:", error);
            return res.status(500).json({ success: false, message: "Erreur serveur", error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Méthode ${req.method} non autorisée`);
    }
}