import { NextApiRequest, NextApiResponse } from 'next';
import Animal from '@/models/animal';

interface UpdateUrlBody {
    imageUrl: string[];

}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
      const { id } = req.query as { id: string };
      const { imageUrl } = req.body as UpdateUrlBody;

      try {
          const animal = await Animal.findByPk(Number(id));
          if (!animal) {
              return res.status(404).json({ success: false, message: 'Animal non trouvé.' });
          }
          animal.imageUrl = imageUrl;
         
          await animal.save();

          return res.status(200).json({ success: true, message: 'URLs de l\'animal mis à jour avec succès.', animal });
      } catch (error) {
          console.error('Erreur lors de la mise à jour des URLs de l\'animal :', error);
          return res.status(500).json({ success: false, message: 'Erreur serveur. Veuillez réessayer plus tard.', error: String(error) });
      }
  } else {
      res.setHeader('Allow', ['PUT']);
      return res.status(405).end(`Méthode ${req.method} non autorisée`);
  }
}