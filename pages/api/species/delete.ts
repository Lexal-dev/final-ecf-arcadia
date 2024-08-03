
import { NextApiRequest, NextApiResponse } from 'next';
import Specie from '@/models/specie';

export default async function deleteSpecie(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        const { id } = req.query as { id: string };

        try {
            if (!/^\d+$/.test(id)) {
                return res.status(400).json({ success: false, message: "L'ID de l'espèce n'est pas valide." });
            }

            const specie = await Specie.findByPk(parseInt(id, 10));

            if (!specie) {
                return res.status(404).json({ success: false, message: "Espèce non trouvée." });
            }

            await specie.destroy();

            return res.status(200).json({ success: true, message: "Espèce supprimée avec succès." });
        } catch (error) {
            console.error("Erreur lors de la suppression de l'espèce:", error);
            return res.status(500).json({ success: false, message: "Erreur serveur. Veuillez réessayer plus tard.", error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).end(`Méthode ${req.method} non autorisée`);
    }
}