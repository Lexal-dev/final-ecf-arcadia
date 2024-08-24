import { NextApiRequest, NextApiResponse } from 'next';
import { redirectIfNeeded } from '@/lib/security/redirectApi';
import Habitat from '@/models/habitat';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const additionalParam = req.query.additionalParam;

    if (additionalParam !== 'habitats') {
        if (redirectIfNeeded(req, res, '/api/habitats/read', '/habitats')) {
            return;
        }
    }

    if (req.method === 'GET') {
        try {
            const habitats = await Habitat.findAll();
            if (!habitats) {
                res.status(404).json({ success: false, message: 'Habitat list not found.' });
            } else {
                res.status(200).json({ success: true, message: 'Habitats list loaded.', habitats });
            }
        } catch (error) {
            console.error('Error retrieving habitats:', error);
            res.status(500).json({ success: false, message: 'Failed to synchronize habitats.', error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed.`);
    }
}