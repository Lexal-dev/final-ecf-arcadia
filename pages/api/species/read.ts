import { NextApiRequest, NextApiResponse } from 'next';
import Specie from '@/models/specie';
import { redirectIfNeeded } from '@/lib/security/redirectApi';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    const additionalParam = req.query.additionalParam;
    if (additionalParam !== 'species') {
        if (redirectIfNeeded(req, res, '/api/species/read', '/')) {
            return;
        }
    }
    if (req.method === 'GET') {
        try {
            const species = await Specie.findAll();
            if (!species) {
                res.status(404).json({ success: false, message: "The list of animal species was not found." });
            } else {
                res.status(200).json({ success: true, message: "List of animal species loaded.", species });
            }
        } catch (error) {
            console.error("Error retrieving animal species:", error);
            res.status(500).json({ success: false, message: "Failed to retrieve animal species.", error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} not allowed`);
    }
}