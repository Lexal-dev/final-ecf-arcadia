"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { ref, deleteObject } from 'firebase/storage';
import { storage } from "@/lib/db/firebaseConfig.mjs";

import FormCreate from '@/components/animals/FormCreate';
import FormUpdate from '@/components/animals/FormUpdate';
import { MdDelete, MdEdit } from 'react-icons/md';

import Loading from '@/components/Loading';

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
      console.log(animalId);
      const response = await fetch(`/api/animals/delete?id=${animalId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (response.ok || response.status === 404) {
        console.log('Animal supprimé avec succès ou non trouvé');
  
        // Delete images from Firebase storage
        for (const url of animalUrls) {
          const imageRef = ref(storage, url);
          try {
            await deleteObject(imageRef);
            console.log(`Image supprimée avec succès: ${url}`);
          } catch (error) {
            console.error(`Erreur lors de la suppression de l'image ${url}:`, error);
          }
        }
  
        setLoading(true); // Refresh the animal list after deletion
        await initFetch();
        router.push('/login/auth/admin/animalsManager');
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
          console.log(`Image supprimée avec succès: ${url}`);
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
    <Loading loading={loading}>
      <main className='w-full  px-1 py-12'>
        <div className='flex flex-col items-center'>
          <button onClick={() => setModalCreate(true)} className='bg-foreground hover:bg-muted-foreground hover:text-white text-secondary py-1 px-3 rounded-md mb-6'>
            Ajouter un animal
          </button>
          <div className='flex w-full justify-center overflow-x-auto'>
            <table className="w-full md:w-2/3">
              <thead>
                <tr className="bg-muted-foreground text-white uppercase text-sm">
                  <th className="py-3 px-6">Habitat</th>
                  <th className="py-3 px-6">Nom</th>
                  <th className="py-3 px-6">Espèce</th>
                  <th className="py-3 px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 font-light">
                {animals.length > 0 ? (
                  animals.map((animal) => (
                    <tr key={animal.id} className="bg-foreground border-b border-gray-200 hover:bg-muted text-secondary text-primary hover:text-white">
                      <td className="py-3 px-6">{animal.habitatId}</td>
                      <td className="py-3 px-6">{animal.name}</td>
                      <td className="py-3 px-6">{animal.specieId}</td>
                      <td className="py-3 px-6">
                        <div className='flex justify-center gap-2'>
                          <button onClick={() => handleDelete(animal)} className='text-white text-lg bg-red-500 hover:bg-red-600 p-2 rounded-md'>
                            <MdDelete />
                          </button>
                          <button onClick={() => handleUpdateModalOpen(animal)} className='text-white text-lg bg-yellow-500 hover:bg-yellow-600 rounded p-2 '>
                            <MdEdit />
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
        </div>
        {modalCreate && <FormCreate onCreateSuccess={onCreateSuccess} onClose={onClose} />}
        {modalUpdate && selectedAnimal && <FormUpdate animal={selectedAnimal} onUpdateSuccess={onUpdateSuccess} onClose={onClose} />}
      </main>
    </Loading>
  );
};

export default AnimalsManager;