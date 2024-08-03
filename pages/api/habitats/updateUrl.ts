import { NextApiRequest, NextApiResponse } from 'next';
import Habitat from '@/models/habitat';

interface UpdateUrlBody {
  imageUrl: string[]; 
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id } = req.query as { id: string };
    const { imageUrl } = req.body as UpdateUrlBody;

    try {
      const habitat = await Habitat.findByPk(Number(id));

      if (!habitat) {
        return res.status(404).json({ success: false, message: 'Habitat non trouvé.' });
      }

      // Update URLs habitat
      habitat.imageUrl = imageUrl;

      await habitat.save();

      return res.status(200).json({ success: true, message: 'URLs de l\'habitat mis à jour avec succès.', habitat });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des URLs de l\'habitat :', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur. Veuillez réessayer plus tard.', error: String(error) });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Méthode ${req.method} non autorisée`);
  }
}