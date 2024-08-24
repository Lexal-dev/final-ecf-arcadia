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
        res.status(404).json({ success: false, message: 'The list of customer reviews was not found.' });
      } else {
        res.status(200).json({ success: true, message: 'Customer reviews list loaded successfully.', avis });
      }
    } catch (error) {
      console.error('Error retrieving customer reviews:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve customer reviews.', error: String(error) });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}