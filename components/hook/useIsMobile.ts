import { useState, useEffect } from 'react';

// Custom hook to check if the screen is mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1200); // 1200px
    };

    checkScreenSize(); // Check initially

    // Add an event listener to monitor screen size changes
    window.addEventListener('resize', checkScreenSize);

    // Cleanup the event listener
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  return isMobile;
};

export default useIsMobile;