"use client";
import React, { useState, useEffect } from 'react';
import Avis from '@/models/avis';

const AvisList: React.FC = () => {
  const [avisList, setAvisList] = useState<Avis[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAvis = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/avis/read?additionalParam=avis');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setAvisList(data.avis);
      } catch (error) {
        console.error('Error fetching avis:', error);
        setError('Échec de la récupération des commentaires. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
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
    <div className='sm:w-3/4 w-full px-1'>
      <h3 className='text-4xl font-caption text-center mb-6'>Les commentaires laissés par nos visiteurs</h3>
      <div className="flex min-w-full max-h-[600px] border-2 rounded-md p-6 bg-muted overflow-y-auto">
        {loading ? (
          <p className='w-full text-center'>Chargement des commentaires...</p>
        ) : error ? (
          <p className='w-full text-center'>Erreur : {error}</p>
        ) : avisList.length > 0 ? (
          <ul className='flex flex-wrap gap-4 justify-around w-full'>
            {generateRandomIndexes(avisList.length, 20).map((index) => (
              <li key={avisList[index].id} className="w-full min-h-[150px] min-w-[250px] sm:w-1/2 md:w-1/3 lg:w-1/4 h-auto bg-background border border-foreground rounded-md p-4 shadow-lg">
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