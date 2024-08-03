import { NextApiRequest, NextApiResponse } from 'next';
import Habitat from '@/models/habitat';
import Animal from '@/models/animal';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = typeof req.query.id === 'string' ? req.query.id : undefined;

  if (!id) {
    res.status(400).json({ success: false, message: 'Un paramètre id est requis' });
    return;
  }

  if (req.method === 'DELETE') {
    try {
      const habitat = await Habitat.findByPk(Number(id));
      if (!habitat) {
        res.status(404).json({ success: false, message: 'Habitat non trouvé' });
        return;
      }

      // Update animal records to set habitatId to null
      await Animal.update({ habitatId: null }, { where: { habitatId: Number(id) } });

      // delete habitat
      await habitat.destroy();

      res.status(200).json({ success: true, message: 'Habitat supprimé avec succès' });
    } catch (error) {
      console.error('Échec de la suppression de l\'habitat:', error);
      res.status(500).json({ success: false, message: 'Échec de la suppression de l\'habitat', error: String(error) });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Méthode ${req.method} non autorisée`);
  }
}