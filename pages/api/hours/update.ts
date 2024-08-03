import { NextApiRequest, NextApiResponse } from 'next';
import Hours from '@/models/hour';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'PUT') {
        const { id, days, open, close } = req.body;

        // Verify types of data
        if (
            typeof id !== 'number' || id <= 0 ||
            typeof days !== 'string' ||
            typeof open !== 'string' ||
            typeof close !== 'string'
        ) {
            return res.status(400).json({ success: false, message: "Tous les champs doivent avoir des types valides" });
        }

        // Verify format : (HH:mm)
        const timeFormat = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
        if (!timeFormat.test(open) || !timeFormat.test(close)) {
            return res.status(400).json({ success: false, message: "Les champs 'open' et 'close' doivent être au format HH:mm" });
        }

        try {
            const hour = await Hours.findByPk(id);
            if (!hour) {
                return res.status(404).json({ success: false, message: "Horaire non trouvé" });
            }

            hour.days = days;
            hour.open = open;
            hour.close = close;
            await hour.save();

            return res.status(200).json({ success: true, message: "Horaire mis à jour avec succès", hour });
        } catch (error) {
            console.error("Erreur lors de la mise à jour des horaires:", error);
            return res.status(500).json({ success: false, message: "Erreur serveur", error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Méthode ${req.method} non autorisée`);
    }
}