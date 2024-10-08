import { NextApiRequest, NextApiResponse } from 'next';
import Service, { ServiceAttributes } from '@/models/service';
import { ValidationError } from 'sequelize';
import { isValidString, validateRoleAccess } from '@/lib/security/validateUtils';
import { checkRateLimit } from '@/lib/security/rateLimiter';


interface CreateBody {
  name: string;
  description: string;
}

export default async function createService(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Extract ip of the request
    const ip = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '';

    // Vérify limit rate
    if (!checkRateLimit(ip, 15)) {
      return res.status(429).json({ success: false, message: 'Trop de requêtes. Veuillez réessayer après 15 minutes.' });
    }

    // Extraction de l'Authorization
    const token = req.headers.authorization?.split(' ')[1];
    // Vérification du rôle
    if (!token || (!validateRoleAccess('ADMIN', token))) {
      return res.status(403).json({ success: false, message: 'Accès refusé. Seuls les administrateurs et les employés sont autorisés.' });
    }

    try {
      await Service.sync({ alter: true });

      const { name, description } = req.body as CreateBody;

      // Validation des données
      if (!name || !description) {
        return res.status(400).json({ success: false, message: 'Le nom et la description sont obligatoires.' });
      }

      if (!isValidString(name, 3, 30)) {
        return res.status(400).json({ success: false, message: 'Le nom de la nourriture doit être compris entre 3 et 50 caractères.' });
      }
      if (!isValidString(description, 3, 150)) {
        return res.status(400).json({ success: false, message: 'La description doit être comprise entre 3 et 50 caractères.' });
      }

      // Création du service
      const newService = await Service.create({ name, description } as ServiceAttributes);

      return res.status(200).json({ success: true, message: 'Service créé avec succès.', service: newService });
    } catch (error) {
      if (error instanceof ValidationError) {
        const errorMessages = error.errors.map((err) => err.message);
        return res.status(400).json({ success: false, message: errorMessages.join(', ') });
      } else {
        console.error('Erreur lors de la création du service :', error);
        return res.status(500).json({ success: false, message: 'Échec de la création du service.', error: String(error) });
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Méthode ${req.method} non autorisée.`);
  }
}