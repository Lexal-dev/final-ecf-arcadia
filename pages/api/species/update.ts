import { NextApiRequest, NextApiResponse } from 'next';
import Specie from '@/models/specie';
import { ValidationError } from 'sequelize';
import { isValidString, validateRoleAccess } from '@/lib/security/validateUtils';

export default async function updateSpecie(req: NextApiRequest, res: NextApiResponse) {
    // extract Authorization
    const token = req.headers.authorization?.split(' ')[1];
    // role verification
    if (!token || !validateRoleAccess('ADMIN', token)) {
        return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }    
    if (req.method === 'PUT') {
        const { id } = req.query as { id: string };
        const { name } = req.body;

        try {
            if (!/^\d+$/.test(id)) {
                return res.status(400).json({ success: false, message: "The species ID is not valid." });
            }

            const specie = await Specie.findByPk(parseInt(id, 10));

            if (!specie) {
                return res.status(404).json({ success: false, message: "Species not found." });
            }

            if (!name) {
                return res.status(400).json({ success: false, message: "The species name is required." });
            }

            if (!isValidString(name, 3, 30)) {
                return res.status(400).json({ success: false, message: "le nom de l'espèce doit être compris entre 3 et 50 caractére." });
            }

            specie.name = name;
            await specie.save();

            return res.status(200).json({ success: true, message: "Species updated successfully.", specie });
        } catch (error) {
            if (error instanceof ValidationError) {
                const errorMessages = error.errors.map((err) => err.message);
                return res.status(400).json({ success: false, message: errorMessages.join(', ') });
            } else {
                console.error("Error updating species:", error);
                return res.status(500).json({ success: false, message: "Server error. Please try again later.", error: String(error) });
            }
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        return res.status(405).end(`Method ${req.method} not allowed`);
    }
}