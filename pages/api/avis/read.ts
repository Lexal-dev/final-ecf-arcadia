import { NextApiRequest, NextApiResponse } from 'next';
import Avis from '@/models/avis';
import { redirectIfNeeded } from '@/lib/security/redirectApi';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const additionalParam = req.query.additionalParam;

  if (additionalParam !== 'avis') {
    if (redirectIfNeeded(req, res, '/api/avis/read', '/')) {
      return;
    }
  }

  if (req.method === 'GET') {
    try {
      const avis = await Avis.findAll();
      if (!avis) {
        res.status(404).json({ success: false, message: "La liste des avis clients n'a pas été trouvée" });
      } else {
        res.status(200).json({ success: true, message: "Liste des avis clients chargée", avis });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des avis clients:", error);
      res.status(500).json({ success: false, message: "Échec de la synchronisation des avis clients.", error: String(error) });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Méthode ${req.method} non utilisée`);
  }
}