import { NextApiRequest, NextApiResponse } from 'next';
import Animal from '@/models/animal';
import { validateRoleAccess } from '@/lib/security/validateUtils';

interface UpdateUrlBody {
    imageUrl: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
        // extract Authorization
        const token = req.headers.authorization?.split(' ')[1];

        // role verification
        if (!token || !validateRoleAccess('ADMIN', token)) {
            return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
        }
  if (req.method === 'PUT') {
      const { id } = req.query as { id: string };
      const { imageUrl } = req.body as UpdateUrlBody;

      try {
          const animal = await Animal.findByPk(Number(id));
          if (!animal) {
              return res.status(404).json({ success: false, message: 'Animal not found.' });
          }
          animal.imageUrl = imageUrl;
         
          await animal.save();

          return res.status(200).json({ success: true, message: 'Animal URLs successfully updated.', animal });
      } catch (error) {
          console.error('Error updating animal URLs:', error);
          return res.status(500).json({ success: false, message: 'Server error. Please try again later.', error: String(error) });
      }
  } else {
      res.setHeader('Allow', ['PUT']);
      return res.status(405).end(`Method ${req.method} not allowed`);
  }
}