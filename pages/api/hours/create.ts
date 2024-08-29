import { NextApiRequest, NextApiResponse } from 'next';
import Hours from '@/models/hour';
import { validateRoleAccess } from '@/lib/security/validateUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        // extract Authorization
        const token = req.headers.authorization?.split(' ')[1]
        // role verification
        if (!token || !validateRoleAccess('ADMIN', token)) {
            return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
        }             
        const { days, open, close } = req.body;

        // Verify type of data
        if (
            typeof days !== 'string' ||
            typeof open !== 'string' ||
            typeof close !== 'string'
        ) {
            return res.status(400).json({ success: false, message: "All fields must have valid types." });
        }

        // Verify format (HH:mm)
        const timeFormat = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
        if (!timeFormat.test(open) || !timeFormat.test(close)) {
            return res.status(400).json({ success: false, message: "The 'open' and 'close' fields must be in HH:mm format." });
        }

        if (!days || !open || !close) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        try {
            // Verify number of table count
            const count = await Hours.count();
            if (count >= 7) {
                return res.status(400).json({ success: false, message: "You cannot add more than 7 hours." });
            }

            const newHour = await Hours.create({ days, open, close });
            return res.status(201).json({ success: true, message: "Hour created successfully.", hour: newHour });
        } catch (error) {
            console.error("Error creating hour:", error);
            return res.status(500).json({ success: false, message: "Server error.", error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed.`);
    }
}