import { NextApiRequest, NextApiResponse } from 'next';
import Service from '@/models/service'; 
import { validateRoleAccess } from '@/lib/security/validateUtils';
import { checkRateLimit } from '@/lib/security/rateLimiter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method === 'DELETE') {
    // extract Authorization
    const token = req.headers.authorization?.split(' ')[1];
    // role verification
    if (!token || (!validateRoleAccess('ADMIN', token))) {
        return res.status(403).json({ success: false, message: 'Access denied. Admins and employees only.' });
    }

    // Extract ip of the request
    const ip = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '';
    // Vérify limit rate
    if (!checkRateLimit(ip, 15)) {
      return res.status(429).json({ success: false, message: 'Trop de requêtes. Veuillez réessayer après 15 minutes.' });
    }

    const { id } = req.query as { id: string }; 
    try {
        const service = await Service.findByPk(id);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found.' });
        }
        // Delete service
        await service.destroy();
        return res.status(200).json({ success: true, message: 'Service deleted successfully.' });
    } catch (error) {
        console.error('Error deleting service:', error);
        return res.status(500).json({ success: false, message: 'Server error. Please try again later.', error: String(error) });
    }
    } else {
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).end(`Method ${req.method} not allowed.`);
    }
}