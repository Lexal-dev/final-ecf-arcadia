

"use client";
import React from 'react';
import Avis from '@/models/avis';
interface AvisListProps {
  avisList: Avis[];
}

const AvisList: React.FC<AvisListProps> = ({ avisList }) => {
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
      <h3 className='text-4xl font-caption text-center mb-6'>Les commentaires laissés par nos visiteurs</h3>
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