import { NextApiRequest, NextApiResponse } from 'next';
import Avis from '@/models/avis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        const { id } = req.query as { id: string };

        try {
            // Validate the ID
            if (!/^\d+$/.test(id)) {
                return res.status(400).json({ success: false, message: 'The review ID is not valid.' });
            }

            // Find the review by ID
            const avis = await Avis.findByPk(id);

            if (!avis) {
                return res.status(404).json({ success: false, message: 'Review not found.' });
            }

            // Delete the review
            await avis.destroy();

            return res.status(200).json({ success: true, message: 'Review deleted successfully.', avis });
        } catch (error) {
            console.error('Error deleting review:', error);
            return res.status(500).json({ success: false, message: 'Server error. Please try again later.', error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed.`);
    }
}