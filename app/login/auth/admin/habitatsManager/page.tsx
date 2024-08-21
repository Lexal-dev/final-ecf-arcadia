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
        
    useEffect(() => {
        initFetch().finally(() => {
            setLoading(false);
        });
    }, [loading]);

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
      
            setLoading(true); // Refresh habitat list after deletion
            toast.success('Habitat deleted successfully')
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
        toast.success("Habitat successfully saved")
    };

    // Function to handle update success of habitat
    const onUpdateSuccess = async () => {
        console.log('Habitat updated');
        setLoading(true);
        onClose();
        toast.success("Habitat successfully updated")
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

    // Effect to ensure only one modal is open at a time
    useEffect(() => {
      console.log("ARRIVER PREMS")
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
        <main className='w-full flex flex-col items-center px-1 py-12 '>
                <Loading loading={loading}> 
                <button onClick={()=> {setModalCreate(true)}} className='bg-foreground hover:bg-muted-foreground hover:text-white text-secondary py-1 px-3 rounded-md mb-6'>Add a habitat</button>
                <div className='flex w-full justify-center overflow-x-auto'>
                   
                    <table className="w-full md:w-2/3">
                        <thead>
                            <tr className="bg-muted-foreground text-white uppercase text-sm">
                                <th className="py-3 px-6">Name</th>
                                <th className="py-3 px-6">Description</th>
                                <th className="py-3 px-6">Comment</th>
                                <th className="py-3 px-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 font-light">
                            {habitats.map((habitat) => (
                                <tr key={habitat.id} className="bg-foreground border-b border-gray-200 hover:bg-muted text-secondary text-primary hover:text-white">
                                    <td className="py-2 px-2">{habitat.name}</td>
                                    <td className="py-2 px-2 ">{habitat.description}</td>
                                    <td className="py-2 px-2">{habitat.comment}</td>
                                    <td className="flex justify-center gap-2 py-3 px-6">
                                        <div className='flex  justify-center gap-2'>
                                            <button onClick={() => handleDelete(habitat)} className='text-white text-lg bg-red-500 hover:bg-red-600 p-2 rounded-md'>
                                              <MdDelete />
                                            </button>
                                            <button onClick={() => handleUpdateModalOpen(habitat)} className='text-white text-lg bg-yellow-500 hover:bg-yellow-600 rounded p-2 '>
                                              <MdEdit />
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