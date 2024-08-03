import { NextApiRequest, NextApiResponse } from 'next';
import VetLog from '@/models/vetLogs';
import { redirectIfNeeded } from '@/lib/security/redirectApi';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const additionalParam = req.query.additionalParam;

    if (additionalParam !== 'vetLogs') {
        if (redirectIfNeeded(req, res, '/api/vetLogs/read', '/')) {
            return;
        }
    }
    
    if (req.method === 'GET') {
        try {
            const vetLogs = await VetLog.findAll();
            if (!vetLogs || vetLogs.length === 0) {
                res.status(404).json({ success: false, message: "La liste des rapports" });
            } else {
                res.status(200).json({ success: true, message: "Liste des rapports chargé", vetLogs });
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des raports", error);
            res.status(500).json({ success: false, message: "Échec de la synchronisation des rapports", error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Méthode ${req.method} non autorisée`);
    }
}