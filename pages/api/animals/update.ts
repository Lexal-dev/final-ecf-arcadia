import { NextApiRequest, NextApiResponse } from 'next';
import Animal from '@/models/animal';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import Specie from '@/models/specie';
import Habitat from '@/models/habitat';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = typeof req.query.id === 'string' ? req.query.id : undefined;

  if (!id) {
    res.status(400).json({ success: false, message: 'Un paramètre id est requis.' });
    return;
  }

  if (req.method === 'PUT') {
    try {
      const { name, habitatId, specieId, etat } = req.body;

      if (!name || !habitatId || !specieId || !etat) {
        res.status(400).json({ success: false, message: 'Le nom, specieId, habitatId et l\'état sont requis.' });
        return;
      }

      // Check if the specieId and habitatId exist
      const specieExists = await Specie.findByPk(specieId);
      if (!specieExists) {
        res.status(404).json({ success: false, message: `L'espèce avec l'ID ${specieId} n'existe pas.` });
        return;
      }

      const habitatExists = await Habitat.findByPk(habitatId);
      if (!habitatExists) {
        res.status(404).json({ success: false, message: `L'habitat avec l'ID ${habitatId} n'existe pas.` });
        return;
      }

      // Find the animal by its ID
      const animal = await Animal.findByPk(parseInt(id, 10));
      if (!animal) {
        res.status(404).json({ success: false, message: 'Animal non trouvé.' });
        return;
      }

      // Update the animal's attributes with the specie and habitat IDs
      animal.name = name;
      animal.specieId = specieId;
      animal.habitatId = habitatId;
      animal.etat = etat;
      await animal.save();

      res.status(200).json({ success: true, message: 'Animal mis à jour avec succès.', animal });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        res.status(409).json({ success: false, message: 'Le nom de l\'animal existe déjà.' });
      } else if (error instanceof ValidationError) {
        const errorMessages = error.errors.map((err) => err.message);
        res.status(400).json({ success: false, message: errorMessages.join(', ') });
      } else if (error instanceof Error) {
        res.status(500).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de l\'animal.' });
      }
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).json({ success: false, message: `Méthode ${req.method} non autorisée.` });
  }
}