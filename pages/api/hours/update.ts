import { NextApiRequest, NextApiResponse } from 'next';
import Hours from '@/models/hour';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'PUT') {
        const { id, days, open, close } = req.body;

        // Validate the types of data
        if (
            typeof id !== 'number' || id <= 0 ||
            typeof days !== 'string' ||
            typeof open !== 'string' ||
            typeof close !== 'string'
        ) {
            return res.status(400).json({ success: false, message: "All fields must have valid types." });
        }

        // Validate time format (HH:mm)
        const timeFormat = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
        if (!timeFormat.test(open) || !timeFormat.test(close)) {
            return res.status(400).json({ success: false, message: "The 'open' and 'close' fields must be in HH:mm format." });
        }

        try {
            // Find the record by primary key
            const hour = await Hours.findByPk(id);
            if (!hour) {
                return res.status(404).json({ success: false, message: "Hour not found." });
            }

            // Update the record
            hour.days = days;
            hour.open = open;
            hour.close = close;
            await hour.save();

            return res.status(200).json({ success: true, message: "Hour updated successfully.", hour });
        } catch (error) {
            console.error("Error updating hour:", error);
            return res.status(500).json({ success: false, message: "Server error.", error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        return res.status(405).end(`Method ${req.method} Not Allowed.`);
    }
}