import { NextApiRequest, NextApiResponse } from 'next';
import Service, { ServiceAttributes } from '@/models/service';
import { ValidationError } from 'sequelize';

interface CreateBody {
  name: string;
  description: string;
}

export default async function createService(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      await Service.sync({ alter: true }); 

      const { name, description } = req.body as CreateBody;

      // data validation
      if (!name || !description) {
        return res.status(400).json({ success: false, message: 'Le nom et la description sont requis.' });
      }

      if (name.length < 3 || name.length > 30) {
        return res.status(400).json({ success: false, message: 'Le nom doit être compris entre 3 et 30 caractères.' });
      }

      if (description.length < 3 || description.length > 150) {
        return res.status(400).json({ success: false, message: 'La description doit être comprise entre 3 et 150 caractères.' });
      }

      // Create Service
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