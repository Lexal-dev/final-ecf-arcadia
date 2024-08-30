import { NextApiRequest, NextApiResponse } from 'next';
import Avis from '@/models/avis';
import { validateRoleAccess } from '@/lib/security/validateUtils';
import { checkRateLimit } from '@/lib/security/rateLimiter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { id } = req.query as { id: string };

    if (req.method === 'DELETE') {
        // extract Authorization
        const token = req.headers.authorization?.split(' ')[1];
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
        try {
            // Validate the ID
            if (!/^\d+$/.test(id)) {
                return res.status(400).json({ success: false, message: 'The review ID is not valid.' });
            }
            
            // Find the review by ID
            const avis = await Avis.findByPk(id);

            if (!avis) {
                return res.status(404).json({ success: false, message: 'Review not found.' });
            }

            // Delete the review
            await avis.destroy();

            return res.status(200).json({ success: true, message: 'Review deleted successfully.', avis });
        } catch (error) {
            console.error('Error deleting review:', error);
            return res.status(500).json({ success: false, message: 'Server error. Please try again later.', error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed.`);
    }
}