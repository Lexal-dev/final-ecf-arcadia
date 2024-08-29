import { NextApiRequest, NextApiResponse } from 'next';
import VetLog from '@/models/vetLogs';
import { validateRoleAccess } from '@/lib/security/validateUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
    // extract Authorization
    const token = req.headers.authorization?.split(' ')[1];

    // role verification
    if (!token || (!validateRoleAccess('ADMIN', token) && !validateRoleAccess('VETERINARIAN', token))) {
        return res.status(403).json({ success: false, message: 'Access denied. Admins and employees only.' });
    }      
      const { animalId, animalState, foodOffered, foodWeight } = req.body;

      if (!animalId || !animalState || !foodOffered || !foodWeight) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
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