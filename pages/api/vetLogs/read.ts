import { NextApiRequest, NextApiResponse } from 'next';
import VetLog from '@/models/vetLogs';
import { redirectIfNeeded, validateRoleAccess } from '@/lib/security/validateUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const additionalParam = req.query.additionalParam;
    // extract Authorization
    const token = req.headers.authorization?.split(' ')[1];

    // role verification
    if (!token || (!validateRoleAccess('ADMIN', token) && !validateRoleAccess('VETERINARIAN', token))) {
        return res.status(403).json({ success: false, message: 'Access denied. Admins and employees only.' });
    }
    if (additionalParam !== 'vetLogs') {
        if (redirectIfNeeded(req, res, '/api/vetLogs/read', '/')) {
            return;
        }
    }
    
    if (req.method === 'GET') {
        try {
            const vetLogs = await VetLog.findAll();
            if (!vetLogs || vetLogs.length === 0) {
                res.status(404).json({ success: false, message: "The list of reports" });
            } else {
                res.status(200).json({ success: true, message: "List of reports loaded", vetLogs });
            }
        } catch (error) {
            console.error("Error retrieving reports", error);
            res.status(500).json({ success: false, message: "Failed to synchronize reports", error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} not allowed`);
    }
}