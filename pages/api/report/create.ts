import { NextApiRequest, NextApiResponse } from 'next';
import Report from '@/models/report';
import { isValidString, validateRoleAccess, isValidPositiveNumber } from '@/lib/security/validateUtils';
import { checkRateLimit } from '@/lib/security/rateLimiter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
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

        const { food, quantity, createdAt, animalId } = req.body;

        if (!food || !quantity || !createdAt || !animalId) {
            return res.status(400).json({ success: false, message: "All fields are required to create a report." });
        }
        if (!isValidString(food, 3, 50)) {
            return res.status(400).json({ success: false, message: 'Le nom de la nourriture doit être compris entre 3 et 50 caractére.' });
        }
        if (!isValidPositiveNumber(quantity)) {
            return res.status(400).json({ success: false, message: 'Le grammage doit être au dessus de 0 et un nombre entier' });
        } 

        try {
            // Create new report
            const newReport = await Report.create({
                food,
                quantity,
                createdAt,
                animalId,
            });

            return res.status(201).json({ success: true, message: "Report created successfully", report: newReport });
            
        } catch (error) {
            console.error("Error creating report:", error);
            return res.status(500).json({ success: false, message: "Server error while creating the report", error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} not allowed`);
    }
}