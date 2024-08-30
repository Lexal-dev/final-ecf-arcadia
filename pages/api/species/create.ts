import { NextApiRequest, NextApiResponse } from 'next';
import Specie from '@/models/specie';
import { ValidationError } from 'sequelize';
import { isValidString, validateRoleAccess } from '@/lib/security/validateUtils';
import { checkRateLimit } from '@/lib/security/rateLimiter';

export default async function createSpecie(req: NextApiRequest, res: NextApiResponse) {

    if (req.method === 'POST') {

        // extract Authorization
        const token = req.headers.authorization?.split(' ')[1]
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
      
        try {
            await Specie.sync({ alter: true });

            const { name } = req.body;

            if (!name) {
                res.status(400).json({ success: false, message: "The species name is required." });
                return;
            }
            if (!isValidString(name, 3, 30)) {
                return res.status(400).json({ success: false, message: "le nom de l'espèce doit être compris entre 3 et 50 caractére." });
            }

            const newSpecie = await Specie.create({ name });

            res.status(200).json({ success: true, message: "Species successfully created.", specie: newSpecie });
        } catch (error) {
            if (error instanceof ValidationError) {
                const errorMessages = error.errors.map((err) => err.message);
                res.status(400).json({ success: false, message: errorMessages.join(', ') });
            } else {
                console.error("Error creating species:", error);
                res.status(500).json({ success: false, message: "Failed to create species.", error: String(error) });
            }
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} not allowed`);
    }
}