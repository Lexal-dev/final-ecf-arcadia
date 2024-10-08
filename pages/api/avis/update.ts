import { NextApiRequest, NextApiResponse } from 'next';
import Avis from '@/models/avis';
import { ValidationError } from 'sequelize';
import { validateRoleAccess } from '@/lib/security/validateUtils';
import { checkRateLimit } from '@/lib/security/rateLimiter';

interface UpdateBody {
    isValid: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

        if (req.method === 'PUT') {
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

            const { id } = req.query as { id: string };
            const { isValid } = req.body as UpdateBody;

        try {
            // Verify if id is an integer
            if (!/^\d+$/.test(id)) {
                return res.status(400).json({ success: false, message: 'The review ID is not valid.' });
            }

            // Verify if isValid is a boolean
            if (typeof isValid !== 'boolean') {
                return res.status(400).json({ success: false, message: 'The validation value is not valid.' });
            }

            const avis = await Avis.findByPk(id);

            if (!avis) {
                return res.status(404).json({ success: false, message: 'Review not found.' });
            }

            avis.isValid = isValid;
            await avis.save();

            return res.status(200).json({ success: true, message: 'Review updated successfully.', avis });
        } catch (error) {
            if (error instanceof ValidationError) {
                const errorMessages = error.errors.map((err) => err.message);
                return res.status(400).json({ success: false, message: errorMessages.join(', ') });
            } else {
                console.error('Error updating review:', error);
                return res.status(500).json({ success: false, message: 'Server error. Please try again later.', error: String(error) });
            }
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}