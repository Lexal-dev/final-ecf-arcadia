"use client";
import React, { useState, useEffect } from 'react';
import FormUpdate from '@/components/habitats/FormUpdateComments';
import Loading from '@/components/Loading';
import { toast } from 'react-toastify';
import { MdEdit } from 'react-icons/md';

interface Habitat {
    id: number;
    name: string;
    description: string;
    comment: string;
}

const HabitatsCommentsManager: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [habitats, setHabitats] = useState<Habitat[]>([]);
    const [selectedHabitat, setSelectedHabitat] = useState<Habitat | null>(null);
    const [modalUpdate, setModalUpdate] = useState<boolean>(false);


    // Fetch habitats data from API
    const fetchHabitats = async (additionalParam: string) => {
      try {
          const response = await fetch(`/api/habitats/read?additionalParam=${encodeURIComponent(additionalParam.toString())}`);
          const data = await response.json();

          if (response.ok) {
              if (data.habitats) {
                  setHabitats(data.habitats);
              } else {
                  console.error('Failed to fetch data: habitats not found');
              }
          } else {
              console.error('Failed to fetch data:', data.error);
          }
      } catch (error) {
          console.error('Error fetching data:', error);
      }
  };

    // Initialize fetch
    useEffect(() => {
        fetchHabitats('habitats').finally(() => {
            setLoading(false);
        });
    }, []);

    // Handle update success
    const onUpdateSuccess = async () => {
        await fetchHabitats('habitats');
        setModalUpdate(false);
        toast.success("Commentaire modifié avec succès");
    };

    // Open update modal
    const handleUpdateModalOpen = (habitat: Habitat) => {
        setModalUpdate(true);
        setSelectedHabitat(habitat);
    };

    // Close modals
    const onClose = () => {
        setModalUpdate(false);
        setSelectedHabitat(null);
    };

    return (
        <main className='flex flex-col items-center py-12 min-h-[200px]'>
            <Loading loading={loading}>
                <h1 className='text-center text-3xl mb-4 font-caption font-bold'>Gestion des commentaires habitats</h1>
                <div className='overflow-x-auto w-full flex flex-col items-center'>
                    <table className="w-full md:w-2/3">
                        <thead className='bg-muted-foreground'>
                            <tr>
                                <th className="border border-background px-4 py-2 text-left">Nom</th>
                                <th className="border border-background px-4 py-2 text-left">Description</th>
                                <th className="border border-background px-4 py-2 text-left">Commentaire</th>
                                <th className="border border-background px-4 py-2 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {habitats.map((habitat) => (
                                <tr key={habitat.id} className="w-full border border-background bg-foreground hover:bg-opacity-50 text-secondary hover:bg-muted hover:text-white">
                                    <td className="w-1/3 border border-background px-4 py-2 text-sm">{habitat.name}</td>
                                    <td className="w-1/3 border border-background px-4 py-2 text-sm">{habitat.description}</td>
                                    <td className="w-1/3 border border-background px-4 py-2 text-sm">{habitat.comment}</td>
                                    <td className="w-1/3 border border-background px-4 py-2 text-center">
                                        <button onClick={() => handleUpdateModalOpen(habitat)} className='text-yellow-500 hover:text-yellow-600'>
                                          <MdEdit size={28}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}                     
                        </tbody>
                    </table>
                </div>

                {modalUpdate && selectedHabitat && (
                    <FormUpdate
                        habitat={selectedHabitat}
                        onUpdateSuccess={onUpdateSuccess}
                        onClose={onClose}
                    />
                )}
            </Loading>
        </main>
    );
};

export default HabitatsCommentsManager;