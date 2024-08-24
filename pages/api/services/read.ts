import { NextApiRequest, NextApiResponse } from 'next';
import Service from '@/models/service';
import { redirectIfNeeded } from '@/lib/security/redirectApi';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const additionalParam = req.query.additionalParam;
    if (additionalParam !== 'services') {
        if (redirectIfNeeded(req, res, '/api/services/read', '/services')) {
            return;
        }
    }

    if (req.method === 'GET') {
        try {
            const services = await Service.findAll({ order: [['id', 'ASC']] });
            if (!services || services.length === 0) {
                res.status(404).json({ success: false, message: "Services list not found" });
            } else {
                res.status(200).json({ success: true, message: "Services list loaded", services });
            }
        } catch (error) {
            console.error("Error retrieving services:", error);
            res.status(500).json({ success: false, message: "Failed to synchronize services", error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} not allowed`);
    }
}