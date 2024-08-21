import jwt, { JwtPayload } from 'jsonwebtoken';

interface DecodedToken extends JwtPayload {
    userId: string;
    userRole: string;
    userEmail: string;
}

export const decodeToken = (token: string): DecodedToken | null => {
    try {
        const decoded = jwt.decode(token) as DecodedToken;
        if (decoded) {
            return decoded;
        } else {
            throw new Error('Token décodé est null');
        }
    } catch (error) {
        console.error('Erreur lors du décodage du token JWT :', error);
        return null;
    }
};