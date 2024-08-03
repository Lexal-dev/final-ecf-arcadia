import { NextApiRequest, NextApiResponse } from 'next';
import Specie from '@/models/specie';
import { redirectIfNeeded } from '@/lib/security/redirectApi';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    const additionalParam = req.query.additionalParam;
    if (additionalParam !== 'species') {
        if (redirectIfNeeded(req, res, '/api/species/read', '/')) {
            return;
        }
    }
    if (req.method === 'GET') {
        try {
            const species = await Specie.findAll();
            if (!species) {
                res.status(404).json({ success: false, message: "La liste des espèces d'animaux n'a pas été trouvée" });
            } else {
                res.status(200).json({ success: true, message: "Liste des espèces d'animaux chargée", species });
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des espèces d'animaux:", error);
            res.status(500).json({ success: false, message: "Échec de la récupération des espèces d'animaux.", error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Méthode ${req.method} non autorisée`);
    }
}