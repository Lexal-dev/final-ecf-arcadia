import { NextApiRequest, NextApiResponse } from 'next';
import Habitat from '@/models/habitat';
import { ValidationError } from 'sequelize';

export default async function createHabitat(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            await Habitat.sync({ alter: true }); // Synchronize the model with the database if needed

            const { name, description, comment } = req.body;

            // Validate the presence of required fields
            if (!name || !description) {
                return res.status(400).json({ success: false, message: 'Name and description are required.' });
            }

            // Create a new instance of Habitat with the specified properties
            const newHabitat = await Habitat.create({ name, description, comment });

            return res.status(200).json({ success: true, message: 'Habitat created successfully.', habitat: newHabitat });
        } catch (error) {
            if (error instanceof ValidationError) {
                const errorMessages = error.errors.map((err) => err.message);
                return res.status(400).json({ success: false, message: errorMessages.join(', ') });
            } else {
                console.error('Error creating habitat:', error);
                return res.status(500).json({ success: false, message: 'Failed to create habitat.', error: String(error) });
            }
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed.`);
    }
}