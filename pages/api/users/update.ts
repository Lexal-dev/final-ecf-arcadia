import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/user'; 
import { validateRoleAccess } from '@/lib/security/validateUtils';
import { checkRateLimit } from '@/lib/security/rateLimiter';

interface UpdateBody {
  email: string;
  role: string;
  password?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'PUT') {

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
    const { id } = req.query as { id: string }; // ensure id is a string
    const { email, role, password } = req.body as UpdateBody; // ensure req.body matches UpdateBody type

    try {
      // Check if user exists
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      // Update user attributes
      user.email = email;
      user.role = role;

      if (password) {
        await user.setPassword(password); // use setPassword to hash the password
      }
      
      // Save changes
      await user.save();

      return res.status(200).json({ success: true, message: 'User updated successfully.', user });
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ success: false, message: 'Server error. Please try again later.', error: String(error) });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} not allowed`);
  }
}