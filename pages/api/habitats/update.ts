import { NextApiRequest, NextApiResponse } from 'next';
import Habitat from '@/models/habitat';

interface UpdateBody {
  name: string;
  description: string;
  comment: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id } = req.query as { id: string };
    const { name, description, comment } = req.body as UpdateBody;

    try {
      const habitat = await Habitat.findByPk(Number(id));

      if (!habitat) {
        return res.status(404).json({ success: false, message: 'Habitat non trouvé.' });
      }

      habitat.name = name;
      habitat.description = description;
      habitat.comment = comment;

      await habitat.save();

      return res.status(200).json({ success: true, message: 'Habitat mis à jour avec succès.', habitat });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'habitat :', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur. Veuillez réessayer plus tard.', error: String(error) });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Méthode ${req.method} non autorisée`);
  }
}