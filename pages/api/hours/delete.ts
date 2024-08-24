import { NextApiRequest, NextApiResponse } from 'next';
import Hours from '@/models/hour';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "ID is required." });
        }

        try {
            const hour = await Hours.findByPk(id);
            if (!hour) {
                return res.status(404).json({ success: false, message: "Hour not found." });
            }

            await hour.destroy();
            return res.status(200).json({ success: true, message: "Hour successfully deleted." });
        } catch (error) {
            console.error("Error deleting hour:", error);
            return res.status(500).json({ success: false, message: "Server error.", error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed.`);
    }
}