import { NextApiRequest, NextApiResponse } from 'next';
import Specie from '@/models/specie';

export default async function deleteSpecie(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        const { id } = req.query as { id: string };

        try {
            if (!/^\d+$/.test(id)) {
                return res.status(400).json({ success: false, message: "The species ID is not valid." });
            }

            const specie = await Specie.findByPk(parseInt(id, 10));

            if (!specie) {
                return res.status(404).json({ success: false, message: "Species not found." });
            }

            await specie.destroy();

            return res.status(200).json({ success: true, message: "Species successfully deleted." });
        } catch (error) {
            console.error("Error deleting species:", error);
            return res.status(500).json({ success: false, message: "Server error. Please try again later.", error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).end(`Method ${req.method} not allowed`);
    }
}