import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/user';
import { validateRoleAccess } from '@/lib/security/validateUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // extract Authorization
    const token = req.headers.authorization?.split(' ')[1];
    // role verification
    if (!token || !validateRoleAccess('ADMIN', token)) {
        return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }    
    if (req.method === 'DELETE') {

        const { id } = req.query as { id: string }; // make sure id = string

        try {
            // Is the user existing?
            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found.' });
            }

            // Delete user from the database
            await user.destroy();

            return res.status(200).json({ success: true, message: 'User successfully deleted.' });
        } catch (error) {
            console.error('Error deleting user:', error);
            return res.status(500).json({ success: false, message: 'Server error. Please try again later.', error: String(error) });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).end(`Method ${req.method} not allowed`);
    }
}