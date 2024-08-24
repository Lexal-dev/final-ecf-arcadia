import { NextApiRequest, NextApiResponse } from 'next';
import Specie from '@/models/specie';
import { ValidationError } from 'sequelize';

export default async function createSpecie(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            await Specie.sync({ alter: true });

            const { name } = req.body;

            if (!name) {
                res.status(400).json({ success: false, message: "The species name is required." });
                return;
            }

            const newSpecie = await Specie.create({ name });

            res.status(200).json({ success: true, message: "Species successfully created.", specie: newSpecie });
        } catch (error) {
            if (error instanceof ValidationError) {
                const errorMessages = error.errors.map((err) => err.message);
                res.status(400).json({ success: false, message: errorMessages.join(', ') });
            } else {
                console.error("Error creating species:", error);
                res.status(500).json({ success: false, message: "Failed to create species.", error: String(error) });
            }
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} not allowed`);
    }
}