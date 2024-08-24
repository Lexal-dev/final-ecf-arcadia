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
        return res.status(404).json({ success: false, message: 'Habitat not found.' });
      }

      habitat.name = name;
      habitat.description = description;
      habitat.comment = comment;

      await habitat.save();

      return res.status(200).json({ success: true, message: 'Habitat updated successfully.', habitat });
    } catch (error) {
      console.error('Error updating habitat:', error);
      return res.status(500).json({ success: false, message: 'Server error. Please try again later.', error: String(error) });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed.`);
  }
}