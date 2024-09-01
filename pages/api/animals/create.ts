import { NextApiRequest, NextApiResponse } from 'next';
import Animal from '@/models/animal';
import Specie from '@/models/specie';
import Habitat from '@/models/habitat';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import { isValidString, validateRoleAccess } from '@/lib/security/validateUtils';
import { checkRateLimit } from '@/lib/security/rateLimiter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method === 'POST') {
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
              
        try {
            const { name, specieName, habitatName } = req.body;

            if (!name || !specieName || !habitatName) {
                res.status(400).json({ success: false, message: 'Name, species name, habitat name, and state are required.' });
                return;
            }
            if (!isValidString(name, 3, 30)) {
                return res.status(400).json({ success: false, message: 'Le nom doit être compris entre 3 et 30 caractére.' });
              } 

            // Find the species and habitat IDs based on their names
            const specie = await Specie.findOne({ where: { id: specieName } });
            const habitat = await Habitat.findOne({ where: { id: habitatName } });
            const etat = "En bonne santé"
            if (!specie) {
                res.status(404).json({ success: false, message: `Species with name ${specieName} not found.` });
                return;
            }

            if (!habitat) {
                res.status(404).json({ success: false, message: `Habitat with name ${habitatName} not found.` });
                return;
            }

            // Create a new animal with the received data
            const animal = await Animal.create({
                name,
                specieId: specie.id,
                habitatId: habitat.id,
                etat
            });

            res.status(201).json({ success: true, message: 'Animal created successfully.', animal });
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                res.status(409).json({ success: false, message: 'Animal name already exists.' });
            } else if (error instanceof ValidationError) {
                const errorMessages = error.errors.map((err) => err.message);
                res.status(400).json({ success: false, message: errorMessages.join(', ') });
            } else {
                res.status(500).json({ success: false, message: 'Error creating the animal.', error: String(error) });
            }
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ success: false, message: `Method ${req.method} not allowed.` });
    }
}