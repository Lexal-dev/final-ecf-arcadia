"use client"
import React, { useEffect, useState } from 'react';
import Avis from '@/models/avis';

const AvisList: React.FC = () => {
  const [avisList, setAvisList] = useState<Avis[]>([]);

  useEffect(() => {
    const fetchAvis = async () => {
      try {
        const response = await fetch('/api/avis/read?additionalParam=avis');
        if (!response.ok) {
          throw new Error('Failed to fetch avis');
        }
        const data = await response.json();
        if (data.success) {
          const avis = data.avis.filter((avis: Avis) => avis.isValid === true);
          setAvisList(avis);
        } else {
          throw new Error(data.message || 'Failed to fetch avis');
        }
      } catch (error) {
        console.error('Error fetching avis:', error);
      }
    };

    fetchAvis();
  }, []);

  // Function to generate random indexes
  const generateRandomIndexes = (max: number, count: number): number[] => {
    const indexes: number[] = [];
    while (indexes.length < count && indexes.length < max) {
      const randomIndex = Math.floor(Math.random() * max);
      if (!indexes.includes(randomIndex)) {
        indexes.push(randomIndex);
      }
    }
    return indexes;
  };

  return (
<div className='w-full px-6'>
  <div className="flex justify-center items-center min-w-full max-h-[500px] border-2 p-3 rounded-md bg-muted overflow-auto">
    {avisList.length > 0 ? (
      <ul className='flex flex-wrap gap-4 justify-center w-full'>
        {generateRandomIndexes(avisList.length, 20).map((index) => (
          <li key={avisList[index].id} className="w-full min-h-[150px] sm:w-1/2 md:w-1/3 lg:w-1/4 h-auto bg-background border border-foreground rounded-md p-4 shadow-lg">
            <div className="mb-2">
              <p className="text-lg font-bold">{avisList[index].pseudo}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Commentaire:</p>
              <p className="text-sm">{avisList[index].comment}</p>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p className='w-full text-center'>Pas de commentaire trouvé.</p>
    )}
  </div>
</div>
  );
};

export default AvisList;