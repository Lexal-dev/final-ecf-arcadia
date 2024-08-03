import { NextApiRequest, NextApiResponse } from 'next';
import VetLog from '@/models/vetLogs';

interface UpdateBody {
  animalState: string;
  foodOffered: string;
  foodWeight: number;
  createdAt: Date;
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'PUT') {
      const { id } = req.query as { id: string };
      const { animalState, foodOffered, foodWeight, createdAt } = req.body as UpdateBody;
  
      try {
        const vetLog = await VetLog.findByPk(id);
  
        if (!vetLog) {
          return res.status(404).json({ success: false, message: 'VetLog non trouvé.' });
        }
  
        // Update vetLogs
        vetLog.animalState = animalState;
        vetLog.foodOffered = foodOffered;
        vetLog.foodWeight = foodWeight;
        vetLog.createdAt = createdAt;
  
        await vetLog.save(); // Save modification
  
        return res.status(200).json({ success: true, message: 'VetLog mis à jour avec succès.', vetLog });
      } catch (error) {
        console.error('Erreur lors de la mise à jour du VetLog :', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur. Veuillez réessayer plus tard.', error: String(error) });
      }
    } else {
      res.setHeader('Allow', ['PUT']);
      return res.status(405).end(`Méthode ${req.method} non autorisée`);
    }
  }