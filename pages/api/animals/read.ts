import { NextApiRequest, NextApiResponse } from 'next';
import Animal from '@/models/animal';
import Specie from '@/models/specie';
import Report from '@/models/report';
import Habitat from '@/models/habitat';
import VetLog from '@/models/vetLogs';
import { redirectIfNeeded } from '@/lib/security/redirectApi';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const additionalParam = req.query.additionalParam;
    if (typeof additionalParam !== 'string' || additionalParam !== 'animals') {
        if (redirectIfNeeded(req, res, '/api/animals/read', '/habitats')) {
            return;
        }
    }

    if (req.method === 'GET') {
        try {
            const animals = await Animal.findAll({});
            const species = await Specie.findAll({});
            const habitats = await Habitat.findAll({});
            const reports = await Report.findAll({});
            const vetLogs = await VetLog.findAll({});
            
            if (!animals || !species || !habitats) {
                res.status(404).json({ success: false, message: "The list of animals, species, reports, or habitats was not found" });
            } else {
                const animalsWithDetails = animals.map(animal => {
                    const specie = species.find(specie => specie.id === animal.specieId);
                    const habitat = habitats.find(habitat => habitat.id === animal.habitatId);
                    
                    return {
                        ...animal.toJSON(),
                        specieId: specie ? specie.name : 'N/A',
                        habitatId: habitat ? habitat.name : 'N/A',  
                    };
                });

                res.status(200).json({ success: true, message: "Animals list loaded", animals: animalsWithDetails, species, habitats, reports, vetLogs });
            }

        } catch (error) {
            console.error('Error retrieving animals:', error);
            res.status(500).json({ success: false, message: 'Failed to retrieve animals.', error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} not allowed`);
    }
}