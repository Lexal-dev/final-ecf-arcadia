import { NextApiRequest, NextApiResponse } from 'next';
import { decodeToken } from './decode';

export const redirectIfNeeded = (req: NextApiRequest, res: NextApiResponse, currentUrl: string, redirectUrl: string): boolean => {
    if (req.url === currentUrl) {
        res.writeHead(302, { Location: redirectUrl });
        res.end();
        return true;
    }
    return false;
};

export const isValidString = (value: string, minLength: number, maxLength: number): boolean => {
    return typeof value === 'string' && value.length >= minLength && value.length <= maxLength;
};

// Vérifie si le rôle de l'utilisateur est valide
export const validateRoleAccess = (requiredRole: string, token:any): boolean => {

    if (token) {
        const decoded = decodeToken(token);
        if (decoded && decoded.userRole === requiredRole) {
            console.log("valide token")
            return true;
        }
    }
    console.log("invalide token")
    return false;
};

