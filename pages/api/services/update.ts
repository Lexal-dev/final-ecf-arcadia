import { NextApiRequest, NextApiResponse } from 'next';
import Service from '@/models/service';
import { ValidationError } from 'sequelize';

interface UpdateBody {
  name: string;
  description: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
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
    
      if (name.length < 3 || name.length > 30) {
        return res.status(400).json({ success: false, message: 'Name must be between 3 and 30 characters.' });
      }

      if (description.length < 3 || description.length > 150) {
        return res.status(400).json({ success: false, message: 'Description must be between 3 and 150 characters.' });
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