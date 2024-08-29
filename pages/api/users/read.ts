import { NextApiRequest, NextApiResponse } from 'next';
import { Op } from 'sequelize';
import { redirectIfNeeded, validateRoleAccess } from '@/lib/security/validateUtils';
import User from '@/models/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const additionalParam = req.query.additionalParam;
    // extract Authorization
    const token = req.headers.authorization?.split(' ')[1];

    // role verification
    if (!token || !validateRoleAccess('ADMIN', token)) {
        return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }
    if (additionalParam !== 'users') {
        if (redirectIfNeeded(req, res, '/api/users/read', '/')) {
            return;
        }
    }

    if (req.method === 'GET') {
        try {
            // Get all users except ADMIN
            const users = await User.findAll({
                where: {
                    role: {
                        [Op.ne]: 'ADMIN'
                    }
                },
                order: [['id', 'ASC']]
            });

            if (!users || users.length === 0) {
                return res.status(404).json({ success: false, message: "No users found." });
            }

            res.status(200).json({ success: true, message: "User list loaded.", users });
        } catch (error) {
            console.error("Error retrieving users:", error);
            res.status(500).json({ success: false, message: "Server error while retrieving users." });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).json({ message: `Method ${req.method} not allowed.` });
    }
}