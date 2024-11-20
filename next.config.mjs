/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Active le mode strict de React pour aider à détecter certains problèmes
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        aggregateTimeout: 300, // Temps d'attente avant de relancer
        poll: 1000, // Polling toutes les 1 seconde pour vérifier les changements
      };
    }
    return config;
  },
};

export default nextConfig;
