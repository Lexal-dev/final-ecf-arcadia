import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        const { id } = req.query as { id: string }; // make sure id = string

        try {
            // user is existing?
            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
            }

            // delete user on db
            await user.destroy();

            return res.status(200).json({ success: true, message: 'Utilisateur supprimé avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'utilisateur :', error);
            return res.status(500).json({ success: false, message: 'Erreur serveur. Veuillez réessayer plus tard.', error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).end(`Méthode ${req.method} non autorisée`);
    }
}