import { NextApiRequest, NextApiResponse } from 'next';
import VetLog from '@/models/vetLogs';
import { isValidPositiveNumber, isValidString, validateRoleAccess } from '@/lib/security/validateUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // extract Authorization
  const token = req.headers.authorization?.split(' ')[1];
  // role verification
  if (!token || (!validateRoleAccess('ADMIN', token) && !validateRoleAccess('VETERINARIAN', token))) {
      return res.status(403).json({ success: false, message: 'Access denied. Admins and employees only.' });
  }       
  if (req.method === 'POST') {
    try {
 
      const { animalId, animalState, foodOffered, foodWeight } = req.body;

      if (!animalId || !animalState || !foodOffered || !foodWeight) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
      }

      if (!isValidString(animalState, 3, 100)) {
        return res.status(400).json({ success: false, message: "le status de l'animal doit être compris entre 3 et 100 caractére." });
      }
      if (!isValidString(foodOffered, 3, 50)) {
        return res.status(400).json({ success: false, message: "le nom de la nourriture doit être compris entre 3 et 50 caractére." });
      }

      if (!isValidPositiveNumber(foodWeight)) {
        return res.status(400).json({ success: false, message: "Le nombre doit être au-dessus de 0 et être un nombre entier" });
      }
      // Create new vetLog
      const newVetLog = await VetLog.create({
        animalId,
        animalState,
        foodOffered,
        foodWeight,
        createdAt: new Date(),
      });

      res.status(201).json({ success: true, message: 'VetLog created successfully.', vetLog: newVetLog });
    } catch (error) {
      console.error('Error creating vetLog:', error);
      res.status(500).json({ success: false, message: 'Failed to create vetLog.', error: String(error) });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} not allowed`);
  }
}