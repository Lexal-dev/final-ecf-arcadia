import { NextApiRequest, NextApiResponse } from 'next';
import Habitat from '@/models/habitat';
import Animal from '@/models/animal';
import { validateRoleAccess } from '@/lib/security/validateUtils';
import { checkRateLimit } from '@/lib/security/rateLimiter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const id = typeof req.query.id === 'string' ? req.query.id : undefined;

  if (!id) {
    return res.status(400).json({ success: false, message: 'An ID parameter is required.' });
  }

  if (req.method === 'DELETE') {
        // extract Authorization
        const token = req.headers.authorization?.split(' ')[1];
        // role verification
        if (!token || !validateRoleAccess('ADMIN', token)) {
            return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
        }    
        // Extract ip of the request
        const ip = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '';
        // Vérify limit rate
        if (!checkRateLimit(ip, 15)) {
        return res.status(429).json({ success: false, message: 'Trop de requêtes. Veuillez réessayer après 15 minutes.' });
        } 

    try {
      const habitat = await Habitat.findByPk(Number(id));
      if (!habitat) {
        return res.status(404).json({ success: false, message: 'Habitat not found.' });
      }

      // Update animal records to set habitatId to null
      await Animal.update({ habitatId: null }, { where: { habitatId: Number(id) } });

      // Delete habitat
      await habitat.destroy();

      return res.status(200).json({ success: true, message: 'Habitat successfully deleted.' });
    } catch (error) {
      console.error('Failed to delete habitat:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete habitat.', error: String(error) });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed.`);
  }
}