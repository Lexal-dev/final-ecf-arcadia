import { NextApiRequest, NextApiResponse } from 'next';
import Report from '@/models/report';
import { redirectIfNeeded } from '@/lib/security/validateUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const additionalParam = req.query.additionalParam;

    if (additionalParam !== 'reports') {
        if (redirectIfNeeded(req, res, '/api/reports/read', '/reports')) {
            return;
        }
    }

    if (req.method === 'GET') {
        try {
            const reports = await Report.findAll();

            if (!reports || reports.length === 0) {
                res.status(404).json({ success: false, message: "No reports found." });
            } else {
                res.status(200).json({ success: true, message: "Reports list loaded.", reports });
            }
        } catch (error) {
            console.error("Error retrieving reports:", error);
            res.status(500).json({ success: false, message: "Failed to retrieve reports.", error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} not allowed`);
    }
}