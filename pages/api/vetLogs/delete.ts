import { NextApiRequest, NextApiResponse } from 'next';
import VetLog from '@/models/vetLogs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        const { id } = req.query as { id: string };

        try {
            
            const vetLog = await VetLog.findByPk(id);

            if (!vetLog) {
                return res.status(404).json({ success: false, message: 'Report not found.' });
            }

            // Delete vetLog
            await vetLog.destroy();

            return res.status(200).json({ success: true, message: 'Report deleted successfully.' });
        } catch (error) {
            console.error('Error deleting report:', error);
            return res.status(500).json({ success: false, message: 'Server error. Please try again later.', error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).end(`Method ${req.method} not allowed`);
    }
}