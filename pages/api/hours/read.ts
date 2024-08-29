import { NextApiRequest, NextApiResponse } from 'next';
import Hours from '@/models/hour';
import { redirectIfNeeded } from '@/lib/security/validateUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  const additionalParam = req.query.additionalParam;

  // Redirect if the additionalParam is not 'hours'
  if (additionalParam !== 'hours') {
    if (redirectIfNeeded(req, res, '/api/hours/read', '/')) {
      return;
    }
  }

  if (req.method === 'GET') {
    try {
      const hours = await Hours.findAll({
        order: [['id', 'ASC']], // Order the results by id in ascending order
      });
      
      if (!hours || hours.length === 0) {
        return res.status(404).json({ success: false, message: "No hours found." });
      }
      
      return res.status(200).json({ success: true, message: "Hours list successfully loaded.", hours });
    } catch (error) {
      console.error("Error retrieving hours:", error);
      return res.status(500).json({ success: false, message: "Failed to retrieve hours.", error: String(error) });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed.`);
  }
}