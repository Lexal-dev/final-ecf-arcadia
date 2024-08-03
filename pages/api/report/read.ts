import { NextApiRequest, NextApiResponse } from 'next';
import Report from '@/models/report';
import { redirectIfNeeded } from '@/lib/security/redirectApi';

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
                res.status(404).json({ success: false, message: "Aucun rapport trouvé." });
            } else {
                res.status(200).json({ success: true, message: "Liste des rapports chargée.", reports });
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des rapports:", error);
            res.status(500).json({ success: false, message: "Échec de la récupération des rapports.", error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Méthode ${req.method} non autorisée`);
    }
}