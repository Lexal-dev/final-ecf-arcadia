"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { ref, deleteObject } from 'firebase/storage';
import { storage } from "@/lib/db/firebaseConfig.mjs";

import FormCreate from '@/components/animals/FormCreate';
import FormUpdate from '@/components/animals/FormUpdate';
import { MdDelete, MdEdit } from 'react-icons/md';

import Loading from '@/components/Loading';
import { toast } from 'react-toastify';

interface Animal {
  id: number;
  name: string;
  etat: string;
  specieId: string;
  habitatId: string;
  imageUrl: string[]; 
}

const AnimalsManager: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [modalCreate, setModalCreate] = useState<boolean>(false);
  const [modalUpdate, setModalUpdate] = useState<boolean>(false);
  const router = useRouter();

  const fetchAnimals = async (additionalParam: string) => {
    try {
      const response = await fetch(`/api/animals/read?additionalParam=${encodeURIComponent(additionalParam)}`);
      const data = await response.json();

      if (response.ok) {
        if (data.animals) {
          setAnimals(data.animals);
          sessionStorage.setItem('animals', JSON.stringify(data.animals))
        } else {
          console.error('Échec de la récupération des données des animaux');
          setAnimals([]);
        }
      } else {
        console.error('Échec de la récupération des données', data.error);
        setAnimals([]);
      }
    } catch (error) {
      console.error('Erreur de connexion à la base de données:', error);
      setAnimals([]);
    }
  };

  const initFetch = async () => {
    await fetchAnimals('animals');
  };

  useEffect(() => {
    initFetch().finally(() => setLoading(false));
  }, [loading]);

  const handleDelete = async (animal: Animal) => {
    const animalId = Number(animal.id);
    let animalUrls: string[] = [];
  
    // Check the type of imageUrl and convert it to an array if necessary
    if (typeof animal.imageUrl === 'string') {
      try {
        animalUrls = JSON.parse(animal.imageUrl);
      } catch (error) {
        console.error('Error parsing imageUrl:', error);
        animalUrls = [];
      }
    } else if (Array.isArray(animal.imageUrl)) {
      animalUrls = [...animal.imageUrl];
    }
  
    // Remove the animal from the database via the Next.js API
    try {
      const response = await fetch(`/api/animals/delete?id=${animalId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (response.ok || response.status === 404) {
        
        // Delete images from Firebase storage
        for (const url of animalUrls) {
          const imageRef = ref(storage, url);
          try {
            await deleteObject(imageRef);
          } catch (error) {
            console.error(`Erreur lors de la suppression de l'image ${url}:`, error);
          }
        }
        toast.success('Animal effacé avec succés')
        setLoading(true); // Refresh the animal list after deletion
        await initFetch();

      } else {
        throw new Error('Failed to delete animal');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'animal:', error);
  
      
      // Delete images from Firebase storage even if the animal deletion fails
      for (const url of animalUrls) {
        const imageRef = ref(storage, url);
        try {
          await deleteObject(imageRef);
        } catch (error) {
          console.error(`Erreur lors de la suppression de l'image ${url}:`, error);
        }
      }
    }
  };

  const onCreateSuccess = async () => {
    setLoading(true);
    onClose();
    await initFetch();
    router.push('/login/auth/admin/animalsManager');
  };

  const onUpdateSuccess = async () => {
    setLoading(true);
    onClose();
    await initFetch();
    router.push('/login/auth/admin/animalsManager');
  };

  const handleUpdateModalOpen = (animal: Animal) => {
    setModalUpdate(true);
    setSelectedAnimal(animal);
  };

  const onClose = () => {
    setModalCreate(false);
    setModalUpdate(false);
    setSelectedAnimal(null);
  };

  useEffect(() => {
    if (modalCreate) {
      setModalUpdate(false);
    }
    if (modalUpdate) {
      setModalCreate(false);
    }
  }, [modalCreate, modalUpdate]);

  return (
    
      <main className='flex flex-col items-center py-12 min-h-[200x] px-2'>
        <Loading loading={loading}>
        <h1 className=' sm:text-3xl text-2xl mb-4 font-bold'>Gestionnaire des animaux</h1>
          <button onClick={() => setModalCreate(true)} className='bg-foreground hover:bg-muted-foreground hover:text-white text-secondary py-1 px-3 rounded-md mb-6'>
            Ajouter un animal
          </button>
          <div className='overflow-x-auto w-full flex flex-col items-center'>
            <table className="w-full md:w-2/3">
              <thead className="bg-muted-foreground">
                <tr>
                  <th className="border border-background px-4 py-2 text-left">Habitat</th>
                  <th className="border border-background px-4 py-2 text-left">Nom</th>
                  <th className="border border-background px-4 py-2 text-left">Espèce</th>
                  <th className="border border-background px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {animals.length > 0 ? (
                  animals.map((animal) => (
                    <tr key={animal.id} className="w-full border border-background bg-foreground hover:bg-opacity-50 text-secondary hover:bg-muted hover:text-white">
                      <td className="w-1/3 border border-background px-4 py-2 text-sm">{animal.habitatId}</td>
                      <td className="w-1/3 border border-background px-4 py-2 text-sm">{animal.name}</td>
                      <td className="w-1/3 border border-background px-4 py-2 text-sm">{animal.specieId}</td>
                      <td className="w-1/3 border border-background px-4 py-2">
                        <div className='flex items-center justify-center md:gap-5'>
                          <button onClick={() => handleDelete(animal)} className='text-red-500 hover:text-red-600'>
                            <MdDelete size={28}/>
                          </button>
                          <button onClick={() => handleUpdateModalOpen(animal)} className='text-yellow-500 hover:text-yellow-600'>
                            <MdEdit size={28}/>
                          </button>
                        </div>

                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-3 px-6 text-center">No animals found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {modalCreate && <FormCreate onCreateSuccess={onCreateSuccess} onClose={onClose} />}
          {modalUpdate && selectedAnimal && <FormUpdate animal={selectedAnimal} onUpdateSuccess={onUpdateSuccess} onClose={onClose} />}
          </Loading>
      </main>
   
  );
};

export default AnimalsManager;