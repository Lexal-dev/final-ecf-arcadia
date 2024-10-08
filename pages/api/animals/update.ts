import { NextApiRequest, NextApiResponse } from 'next';
import Animal from '@/models/animal';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import Specie from '@/models/specie';
import Habitat from '@/models/habitat';
import { isValidString, validateRoleAccess } from '@/lib/security/validateUtils';
import { checkRateLimit } from '@/lib/security/rateLimiter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
   
  const id = typeof req.query.id === 'string' ? req.query.id : undefined;

  if (!id) {
    res.status(400).json({ success: false, message: 'An ID parameter is required.' });
    return;
  }

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
    try {
      const { name, habitatId, specieId, etat } = req.body;

      if (!name || !habitatId || !specieId || !etat) {
        res.status(400).json({ success: false, message: 'Name, specieId, habitatId, and state are required.' });
        return;
      }
      if (!isValidString(name, 3, 30)) {
        return res.status(400).json({ success: false, message: 'Le nom doit être compris entre 3 et 30 caractére.' });
      } 
      if (!isValidString(etat, 3, 100)) {
        return res.status(400).json({ success: false, message: "L'etat doit être compris entre 3 et 100 caractére." });
      } 
      // Check if the specieId and habitatId exist
      const specieExists = await Specie.findByPk(specieId);
      if (!specieExists) {
        res.status(404).json({ success: false, message: `Specie with ID ${specieId} does not exist.` });
        return;
      }

      const habitatExists = await Habitat.findByPk(habitatId);
      if (!habitatExists) {
        res.status(404).json({ success: false, message: `Habitat with ID ${habitatId} does not exist.` });
        return;
      }

      // Find the animal by its ID
      const animal = await Animal.findByPk(parseInt(id, 10));
      if (!animal) {
        res.status(404).json({ success: false, message: 'Animal not found.' });
        return;
      }

      // Update the animal's attributes with the specie and habitat IDs
      animal.name = name;
      animal.specieId = specieId;
      animal.habitatId = habitatId;
      animal.etat = etat;
      await animal.save();

      res.status(200).json({ success: true, message: 'Animal updated successfully.', animal });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        res.status(409).json({ success: false, message: 'Animal name already exists.' });
      } else if (error instanceof ValidationError) {
        const errorMessages = error.errors.map((err) => err.message);
        res.status(400).json({ success: false, message: errorMessages.join(', ') });
      } else if (error instanceof Error) {
        res.status(500).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Error updating animal.' });
      }
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).json({ success: false, message: `Method ${req.method} not allowed.` });
  }
}