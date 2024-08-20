import { useState, useEffect } from 'react';

// Hook personnalisé pour vérifier si l'écran est mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1200); // 1200px
    };

    checkScreenSize(); // Vérifier initialement

    // Ajouter un écouteur d'événement pour surveiller les changements de taille d'écran
    window.addEventListener('resize', checkScreenSize);

    // Nettoyage de l'écouteur d'événement
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  return isMobile;
};

export default useIsMobile;