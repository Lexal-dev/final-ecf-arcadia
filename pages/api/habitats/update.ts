import { NextApiRequest, NextApiResponse } from 'next';
import Habitat from '@/models/habitat';
import { isValidString, validateRoleAccess } from '@/lib/security/validateUtils';
import { checkRateLimit } from '@/lib/security/rateLimiter';

interface UpdateBody {
  name: string;
  description: string;
  comment: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'PUT') {

    // extract Authorization
    const token = req.headers.authorization?.split(' ')[1];
    // role verification
    if (!token || (!validateRoleAccess('ADMIN', token) && !validateRoleAccess('VETERINARIAN', token))) {
        return res.status(403).json({ success: false, message: 'Access denied. Admins and VETERINARIAN only.' });
    }
    // Extract ip of the request
    const ip = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '';
    // Vérify limit rate
    if (!checkRateLimit(ip, 15)) {
      return res.status(429).json({ success: false, message: 'Trop de requêtes. Veuillez réessayer après 15 minutes.' });
    } 
    
    const { id } = req.query as { id: string };
    const { name, description, comment } = req.body as UpdateBody;

    try {
      const habitat = await Habitat.findByPk(Number(id));

      if (!habitat) {
        return res.status(404).json({ success: false, message: 'Habitat not found.' });
      }
      if (!isValidString(name, 3, 30)) {
        return res.status(400).json({ success: false, message: 'Le nom doit être compris entre 3 et 30 caractére.' });
      } 
      if (!isValidString(description, 3, 200)) {
          return res.status(400).json({ success: false, message: 'Le description doit être compris entre 3 et 200 caractére.' });
      }
      if (!isValidString(comment, 3, 100)) {
        return res.status(400).json({ success: false, message: 'Le commentaire doit être compris entre 3 et 100 caractére.' });
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