"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { ref, deleteObject } from 'firebase/storage';
import { storage } from "@/lib/db/firebaseConfig.mjs";


import FormCreate from '@/components/habitats/FormCreate';
import FormUpdate from '@/components/habitats/FormUpdate';
import { MdDelete, MdEdit } from 'react-icons/md';
import Loading from '@/components/Loading';
import { toast } from 'react-toastify';

interface Habitat {
    id: number;
    name: string;
    description: string;
    comment: string;
    imageUrl: string[] ; 
}

const HabitatsManager: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [habitats, setHabitats] = useState<Habitat[]>([]);
    const [selectedHabitat, setSelectedHabitat] = useState<Habitat | null>(null)
    const [modalCreate, setModalCreate] = useState<boolean>(false)
    const [modalUpdate, setModalUpdate] = useState<boolean>(false)
    const router = useRouter();

    // Function to fetch habitats data from API
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

    // Initial fetch of habitats data
    const initFetch = async () => {
        fetchHabitats('habitats');
    };
        
    // Function to handle deletion of a habitat
    const handleDelete = async (habitat: Habitat) => {
        const habitatId = Number(habitat.id);
        let habitatUrls: string[] = [];
      
        // Check imageUrl type and convert to array if necessary
        if (typeof habitat.imageUrl === 'string') {
          try {
            habitatUrls = JSON.parse(habitat.imageUrl);
          } catch (error) {
            console.error('Error parsing imageUrl:', error);
            habitatUrls = [];
          }
        } else if (Array.isArray(habitat.imageUrl)) {
          habitatUrls = [...habitat.imageUrl];
        }
      
        // Delete habitat from database via Next.js API
        try {
          console.log(habitatId);
          const response = await fetch(`/api/habitats/delete?id=${habitatId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          });
      
          if (response.ok || response.status === 404) {
            console.log('Habitat deleted successfully or not found');
      
            // Delete images from Firebase storage
            for (const url of habitatUrls) {
              const storageRef = ref(storage, url);
              try {
                await deleteObject(storageRef);
                console.log(`Image deleted successfully: ${url}`);
              } catch (error) {
                console.error(`Error deleting image ${url}:`, error);
              }
            }
            toast.success('Habitat effacé avec succés')
            setLoading(true); // Refresh habitat list after deletion
            
            await initFetch();
            router.push('/login/auth/admin/habitatsManager');
          } else {
            throw new Error('Failed to delete habitat');
          }
        } catch (error) {
          console.error('Error deleting habitat:', error);
      
          // Delete images from Firebase storage even if habitat deletion fails
          for (const url of habitatUrls) {
            const storageRef = ref(storage, url);
            try {
              await deleteObject(storageRef);
              console.log(`Image deleted successfully: ${url}`);
            } catch (error) {
              console.error(`Error deleting image ${url}:`, error);
            }
          }
        }
      };

    // Function to handle creation success of habitat
    const onCreateSuccess = async () => {
        setLoading(true);
        await initFetch();
        onClose();
        toast.success("Habitat enregistré avec succés")
    };

    // Function to handle update success of habitat
    const onUpdateSuccess = async () => {
        console.log('Habitat updated');
        setLoading(true);
        onClose();
        toast.success("Habitat modifié avec succés")
    };

    // Function to open update modal and set selected habitat
    const handleUpdateModalOpen = (habitat: Habitat) => {
        setModalUpdate(true);
        setSelectedHabitat(habitat)
    }

    // Function to close modals and reset selected habitat
    const onClose = () => {
        setModalCreate(false)
        setModalUpdate(false)
        setSelectedHabitat(null)
    };

    useEffect(() => {
        initFetch().finally(() => {
            setLoading(false);
        });
    }, [loading]);

    // Effect to ensure only one modal is open at a time
    useEffect(() => {
        if(modalCreate === true)
        {
            setModalUpdate(false)
        }

        if(modalUpdate === true)
        {
            setModalCreate(false)
        }
    }, [modalCreate, modalUpdate])

    return (
        <main className='flex flex-col items-center py-12 min-h-[200x] '>
                <Loading loading={loading}>
                <h1 className='text-3xl mb-4 font-bold'>Gestionnaire des habitats</h1>
                <button onClick={()=> {setModalCreate(true)}} className='bg-foreground hover:bg-muted-foreground hover:text-white text-secondary py-1 px-3 rounded-md mb-6'>Ajouter un habitat</button>
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
                                    <td className="w-1/3 border border-background px-4 py-2">
                                        <div className='flex items-center justify-center md:gap-5'>
                                            <button onClick={() => handleDelete(habitat)} className='text-red-500 hover:text-red-600'>
                                              <MdDelete size={28}/>
                                            </button>
                                            <button onClick={() => handleUpdateModalOpen(habitat)} className='text-yellow-500 hover:text-yellow-600'>
                                              <MdEdit size={28}/>
                                            </button>
                                        </div>
                                    </td>      
                                </tr>
                                
                            ))}
                        </tbody>
                    </table>                      
                    
                </div>

            {modalCreate &&  <FormCreate onCreateSuccess={onCreateSuccess} onClose={onClose} />}
            {modalUpdate && selectedHabitat &&  <FormUpdate habitat={selectedHabitat} onUpdateSuccess={onUpdateSuccess} onClose={onClose} />}
           </Loading>
        </main>
    );
};

export default HabitatsManager;