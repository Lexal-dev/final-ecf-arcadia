import { NextApiRequest, NextApiResponse } from 'next';
import { Op } from 'sequelize';
import User from '@/models/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const additionalParam = req.query.additionalParam;
    if (additionalParam !== 'users') {
        return res.status(404).json({ success: false, message: "Endpoint non trouvé" });
    }

    if (req.method === 'GET') {
        try {
            // Récupérer tous les utilisateurs sauf ceux avec le rôle "ADMIN"
            const users = await User.findAll({
                where: {
                    role: {
                        [Op.ne]: 'ADMIN'
                    }
                },
                order: [['id', 'ASC']]
            });

            if (!users || users.length === 0) {
                return res.status(404).json({ success: false, message: "Aucun utilisateur trouvé" });
            }

            res.status(200).json({ success: true, message: "Liste d'utilisateur chargée", users });
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs:", error);
            res.status(500).json({ success: false, message: "Erreur serveur lors de la récupération des utilisateurs" });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
    }
}