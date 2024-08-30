const rateLimitStore: Record<string, { count: number; timestamp: number }> = {};
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Vérifie la limite de taux pour une adresse IP donnée.
 *
 * @param ip - L'adresse IP de l'utilisateur.
 * @param maxRequests - Le nombre maximal de requêtes autorisées dans la fenêtre de temps.
 * @returns true si la requête est autorisée, false si la limite de taux est dépassée.
 */

export const checkRateLimit = (ip: string, maxRequests: number): boolean => {
    const currentTime = Date.now();
    if (!rateLimitStore[ip]) {
        rateLimitStore[ip] = { count: 1, timestamp: currentTime };
        return true;
    }

    const { count, timestamp } = rateLimitStore[ip];
    if (currentTime - timestamp > RATE_LIMIT_WINDOW_MS) {
        // Réinitialiser le compteur et le timestamp
        rateLimitStore[ip] = { count: 1, timestamp: currentTime };
        return true;
    }

    if (count >= maxRequests) {
        return false; // Limite de taux dépassée
    }

    // Incrémenter le compteur
    rateLimitStore[ip].count += 1;
    return true;
};