import { NextApiRequest, NextApiResponse } from 'next';
import Service from '@/models/service';
import { ValidationError } from 'sequelize';
import { isValidString, validateRoleAccess } from '@/lib/security/validateUtils';
import { checkRateLimit } from '@/lib/security/rateLimiter';

interface UpdateBody {
  name: string;
  description: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'PUT') {
  // extract Authorization
  const token = req.headers.authorization?.split(' ')[1]
  // role verification
  if (!token || (!validateRoleAccess('ADMIN', token) && !validateRoleAccess('EMPLOYEE', token))) {
      return res.status(403).json({ success: false, message: 'Access denied. Admins and employees only.' });
  }

  // Extract ip of the request
  const ip = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '';
  // Vérify limit rate
  if (!checkRateLimit(ip, 15)) {
    return res.status(429).json({ success: false, message: 'Trop de requêtes. Veuillez réessayer après 15 minutes.' });
  }

  const { id } = req.query as { id: string };
  const { name, description } = req.body as UpdateBody;
    try {
      if (!/^\d+$/.test(id)) {
        return res.status(400).json({ success: false, message: "Service ID is not valid." });
      }

      const service = await Service.findByPk(parseInt(id, 10));
      if (!service) {
        return res.status(404).json({ success: false, message: 'Service not found.' });
      }
    
      if (!isValidString(name, 3, 30)) {
        return res.status(400).json({ success: false, message: 'Le nom de la nourriture doit être compris entre 3 et 50 caractére.' });
      }
      if (!isValidString(description, 3, 150)) {
        return res.status(400).json({ success: false, message: 'La desicrption doit être compris entre 3 et 50 caractére.' });
      }

      // Update service
      service.name = name;
      service.description = description;

      // Validate and save update
      await service.validate();
      await service.save();

      return res.status(200).json({ success: true, message: 'Service updated successfully.', service });
    } catch (error) {
      if (error instanceof ValidationError) {
        const errorMessages = error.errors.map((err) => err.message);
        return res.status(400).json({ success: false, message: errorMessages.join(', ') });
      } else {
        console.error('Error updating service:', error);
        return res.status(500).json({ success: false, message: 'Server error. Please try again later.', error: String(error) });
      }
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} not allowed`);
  }
}