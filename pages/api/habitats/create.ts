import { NextApiRequest, NextApiResponse } from 'next';
import Habitat from '@/models/habitat';
import { ValidationError } from 'sequelize';

export default async function createHabitat(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            await Habitat.sync({ alter: true }); // Synchronize the model with the database if needed

            const { name, description, comment } = req.body;

            if (!name || !description) {
                res.status(400).json({ success: false, message: 'Le nom et la description sont requis.' });
                return;
            }

            // Create a new instance of Habitat specifying the required properties
            const newHabitat = await Habitat.create({ name, description, comment });

            res.status(200).json({ success: true, message: 'Habitat créé avec succès.', habitat: newHabitat });
        } catch (error) {
            if (error instanceof ValidationError) {
                const errorMessages = error.errors.map((err) => err.message);
                res.status(400).json({ success: false, message: errorMessages.join(', ') });
            } else {
                console.error('Erreur lors de la création de l\'habitat', error);
                res.status(500).json({ success: false, message: 'Échec de la création de l\'habitat', error: String(error) });
            }
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Méthode ${req.method} non autorisée.`);
    }
}