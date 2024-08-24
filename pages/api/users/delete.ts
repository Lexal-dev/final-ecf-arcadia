import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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