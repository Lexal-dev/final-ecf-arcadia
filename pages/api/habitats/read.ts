import { NextApiRequest, NextApiResponse } from 'next';
import { redirectIfNeeded } from '@/lib/security/redirectApi';
import Habitat from '@/models/habitat';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const additionalParam = req.query.additionalParam;

    if (additionalParam !== 'habitats') {
        if (redirectIfNeeded(req, res, '/api/habitats/read', '/habitats')) {
            return;
        }
    }

    if (req.method === 'GET') {
        try {
            const habitats = await Habitat.findAll();
            if (!habitats) {
                res.status(404).json({ success: false, message: "La liste des habitats n'a pas été trouvée" });
            } else {
                res.status(200).json({ success: true, message: "Liste des habitats chargée", habitats });
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des habitats:", error);
            res.status(500).json({ success: false, message: "Échec de la synchronisation des habitats.", error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Méthode ${req.method} non utilisée`);
    }
}