import { NextApiRequest, NextApiResponse } from 'next';
import Service from '@/models/service'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        const { id } = req.query as { id: string }; 
        try {
            const service = await Service.findByPk(id);

            if (!service) {
                return res.status(404).json({ success: false, message: 'Service not found.' });
            }

            // Delete service
            await service.destroy();

            return res.status(200).json({ success: true, message: 'Service deleted successfully.' });
        } catch (error) {
            console.error('Error deleting service:', error);
            return res.status(500).json({ success: false, message: 'Server error. Please try again later.', error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).end(`Method ${req.method} not allowed.`);
    }
}