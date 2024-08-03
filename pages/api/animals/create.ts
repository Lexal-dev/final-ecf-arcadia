import { NextApiRequest, NextApiResponse } from 'next';
import Animal from '@/models/animal';
import Specie from '@/models/specie';
import Habitat from '@/models/habitat';
import { UniqueConstraintError, ValidationError } from 'sequelize';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { name, specieName, habitatName } = req.body;

            if (!name || !specieName || !habitatName) {
                res.status(400).json({ success: false, message: 'Le nom, le nom de l\'espèce, le nom de l\'habitat et l\'état sont requis.' });
                return;
            }

            // Find the species and habitat IDs based on their names
            const specie = await Specie.findOne({ where: { id: specieName } });
            const habitat = await Habitat.findOne({ where: { id: habitatName } });
            const etat = "Bonne santé"
            if (!specie) {
                res.status(404).json({ success: false, message: `L'espèce avec le nom ${specieName} n'a pas été trouvée.` });
                return;
            }

            if (!habitat) {
                res.status(404).json({ success: false, message: `L'habitat avec le nom ${habitatName} n'a pas été trouvé.` });
                return;
            }

            // Create a new animal with the received data
            const animal = await Animal.create({
                name,
                specieId: specie.id,
                habitatId: habitat.id,
                etat
            });

            res.status(201).json({ success: true, message: 'Animal créé avec succès.', animal });
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                res.status(409).json({ success: false, message: 'Le nom de l\'animal existe déjà.' });
            } else if (error instanceof ValidationError) {
                const errorMessages = error.errors.map((err) => err.message);
                res.status(400).json({ success: false, message: errorMessages.join(', ') });
            } else {
                res.status(500).json({ success: false, message: 'Erreur lors de la création de l\'animal.', error: String(error) });
            }
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ success: false, message: `Méthode ${req.method} non autorisée.` });
    }
}