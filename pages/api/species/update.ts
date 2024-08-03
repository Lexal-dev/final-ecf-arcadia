
import { NextApiRequest, NextApiResponse } from 'next';
import Specie from '@/models/specie';
import { ValidationError } from 'sequelize';

export default async function updateSpecie(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'PUT') {
        const { id } = req.query as { id: string };
        const { name } = req.body;

        try {
            if (!/^\d+$/.test(id)) {
                return res.status(400).json({ success: false, message: "L'ID de l'espèce n'est pas valide." });
            }

            const specie = await Specie.findByPk(parseInt(id, 10));

            if (!specie) {
                return res.status(404).json({ success: false, message: "Espèce non trouvée." });
            }

            if (!name) {
                return res.status(400).json({ success: false, message: "Le nom de l'espèce est requis." });
            }

            specie.name = name;
            await specie.save();

            return res.status(200).json({ success: true, message: "Espèce mise à jour avec succès.", specie });
        } catch (error) {
            if (error instanceof ValidationError) {
                const errorMessages = error.errors.map((err) => err.message);
                return res.status(400).json({ success: false, message: errorMessages.join(', ') });
            } else {
                console.error("Erreur lors de la mise à jour de l'espèce:", error);
                return res.status(500).json({ success: false, message: "Erreur serveur. Veuillez réessayer plus tard.", error: String(error) });
            }
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        return res.status(405).end(`Méthode ${req.method} non autorisée`);
    }
}