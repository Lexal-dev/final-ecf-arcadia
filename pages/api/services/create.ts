import { NextApiRequest, NextApiResponse } from 'next';
import Service, { ServiceAttributes } from '@/models/service';
import { ValidationError } from 'sequelize';
import { validateRoleAccess } from '@/lib/security/validateUtils';

interface CreateBody {
  name: string;
  description: string;
}

export default async function createService(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
          // extract Authorization
          const token = req.headers.authorization?.split(' ')[1];
  
          // role verification
          if (!token || (!validateRoleAccess('ADMIN', token))) {
              return res.status(403).json({ success: false, message: 'Access denied. Admins and employees only.' });
          }
    try {
      await Service.sync({ alter: true }); 

      const { name, description } = req.body as CreateBody;

      // Data validation
      if (!name || !description) {
        return res.status(400).json({ success: false, message: 'Name and description are required.' });
      }

      if (name.length < 3 || name.length > 30) {
        return res.status(400).json({ success: false, message: 'Name must be between 3 and 30 characters.' });
      }

      if (description.length < 3 || description.length > 150) {
        return res.status(400).json({ success: false, message: 'Description must be between 3 and 150 characters.' });
      }

      // Create Service
      const newService = await Service.create({ name, description } as ServiceAttributes);

      return res.status(200).json({ success: true, message: 'Service created successfully.', service: newService });
    } catch (error) {
      if (error instanceof ValidationError) {
        const errorMessages = error.errors.map((err) => err.message);
        return res.status(400).json({ success: false, message: errorMessages.join(', ') });
      } else {
        console.error('Error creating service:', error);
        return res.status(500).json({ success: false, message: 'Failed to create service.', error: String(error) });
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} not allowed.`);
  }
}