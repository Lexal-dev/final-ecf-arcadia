import { NextApiRequest, NextApiResponse } from 'next';
import Hours from '@/models/hour';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { days, open, close } = req.body;

        // Verify type of data
        if (
            typeof days !== 'string' ||
            typeof open !== 'string' ||
            typeof close !== 'string'
        ) {
            return res.status(400).json({ success: false, message: "Tous les champs doivent avoir des types valides" });
        }

        // Verify format (HH:mm)
        const timeFormat = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
        if (!timeFormat.test(open) || !timeFormat.test(close)) {
            return res.status(400).json({ success: false, message: "Les champs 'open' et 'close' doivent être au format HH:mm" });
        }

        if (!days || !open || !close) {
            return res.status(400).json({ success: false, message: "Tous les champs sont requis" });
        }

        try {
            // Verify number of table count
            const count = await Hours.count();
            if (count >= 7) {
                return res.status(400).json({ success: false, message: "Vous ne pouvez pas ajouter plus de 7 horaires." });
            }

            const newHour = await Hours.create({ days, open, close });
            return res.status(201).json({ success: true, message: "Horaire créé avec succès", hour: newHour });
        } catch (error) {
            console.error("Erreur lors de la création de l'horaire:", error);
            return res.status(500).json({ success: false, message: "Erreur serveur", error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Méthode ${req.method} non autorisée`);
    }
}