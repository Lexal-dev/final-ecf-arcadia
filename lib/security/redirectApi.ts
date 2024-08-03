import { NextApiRequest, NextApiResponse } from 'next';

export const redirectIfNeeded = (req: NextApiRequest, res: NextApiResponse, currentUrl: string, redirectUrl: string): boolean => {
    if (req.url === currentUrl) {
        res.writeHead(302, { Location: redirectUrl });
        res.end();
        return true;
    }
    return false;
};

