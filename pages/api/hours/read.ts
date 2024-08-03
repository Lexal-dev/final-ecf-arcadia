import { NextApiRequest, NextApiResponse } from 'next';
import Hours from '@/models/hour';
import { redirectIfNeeded } from '@/lib/security/redirectApi';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    
  const additionalParam = req.query.additionalParam;

  if (additionalParam !== 'hours') {
    if (redirectIfNeeded(req, res, '/api/hours/read', '/')) {
      return;
    }
  }
    if (req.method === 'GET') {
        try {
            const hours = await Hours.findAll({
                order: [['id', 'ASC']],
            });
            if (!hours || hours.length === 0) {
                return res.status(404).json({ success: false, message: "Aucun horaire trouvé." });
            }
            return res.status(200).json({ success: true, message: "Liste des horaires chargée", hours });
        } catch (error) {
            console.error("Erreur lors de la récupération des horaires:", error);
            return res.status(500).json({ success: false, message: "Échec de la synchronisation des horaires", error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Méthode ${req.method} non autorisée`);
    }
}