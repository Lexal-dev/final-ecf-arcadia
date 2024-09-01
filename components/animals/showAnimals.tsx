"use client";
import React, { useCallback, useEffect, useState } from 'react';
import Loading from '@/components/Loading';
import Habitat from '@/models/habitat';
import { MdClose } from 'react-icons/md';
import Animal from '@/models/animal';

import { db } from '@/lib/db/firebaseConfig.mjs';
import { doc, updateDoc, increment, setDoc, getDoc } from 'firebase/firestore';
import Image from 'next/image';

export default function ShowAnimals() {
  const [habitats, setHabitats] = useState<Habitat[]>([]);
  const [selectedHabitat, setSelectedHabitat] = useState<Habitat | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [modal, setModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHabitats = useCallback(async (additionalParam: string) => {
    try {
      const cachedHabitats = sessionStorage.getItem('habitats');
      if (cachedHabitats) {
        setHabitats(JSON.parse(cachedHabitats));
        setLoading(false);
      } else {
        const response = await fetch(`/api/habitats/read?additionalParam=${encodeURIComponent(additionalParam)}`);
        const data = await response.json();

        if (response.ok) {
          if (data.habitats) {
            setHabitats(data.habitats);
            sessionStorage.setItem('habitats', JSON.stringify(data.habitats));
          } else {
            console.error('Failed to fetch data: habitats not found');
          }
        } else {
          console.error('Failed to fetch data:', data.error);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, []);

  const fetchAnimals = useCallback(async (additionalParam: string) => {
    try {
      const cachedAnimals = sessionStorage.getItem('animals');
      if (cachedAnimals) {
        setAnimals(JSON.parse(cachedAnimals));
        setLoading(false);
      } else {
        const response = await fetch(`/api/animals/read?additionalParam=${encodeURIComponent(additionalParam)}`);
        const data = await response.json();

        if (response.ok) {
          if (data.animals) {
            setAnimals(data.animals);
            sessionStorage.setItem('animals', JSON.stringify(data.animals));
          } else {
            console.error('Failed to fetch data: animals not found');
          }
        } else {
          console.error('Failed to fetch data:', data.error);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabitats("habitats");
    fetchAnimals("animals");
  }, [fetchHabitats, fetchAnimals]);

  const openModal = (habitat: Habitat) => {
    setSelectedHabitat(habitat);
    setModal(true);
  };

  const selectAnimal = (animal: Animal) => {
    setSelectedAnimal(animal);
    addOrUpdateConsultation(animal);
  };

  const getBackgroundImageUrl = (habitat: Habitat) => {
    let imageUrl = '/images/Pasdimage.jpg';

    if (typeof habitat.imageUrl === 'string') {
      try {
        const parsedImageUrl = JSON.parse(habitat.imageUrl);
        if (Array.isArray(parsedImageUrl) && parsedImageUrl.length > 0) {
          imageUrl = parsedImageUrl[0];
        }
      } catch (e) {
        console.error('Error parsing imageUrl:', e);
      }
    } else if (Array.isArray(habitat.imageUrl) && habitat.imageUrl.length > 0) {
      imageUrl = habitat.imageUrl[0];
    }
    return imageUrl;
  };

  const filteredAnimals = selectedHabitat ? animals.filter(animal => (animal.habitatId).toString() === selectedHabitat.name) : [];

  const addOrUpdateConsultation = async (animal: Animal) => {
    const animalDocRef = doc(db, 'animals', animal.id.toString());

    try {
      const animalDocSnapshot = await getDoc(animalDocRef);

      if (animalDocSnapshot.exists()) {
        await updateDoc(animalDocRef, {
          consultations: increment(1),
        });
      } else {
        await setDoc(animalDocRef, {
          animalName: animal.name,
          consultations: 1,
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour ou de l'ajout de la consultation :", error);
    }
  };

  return (
    <div className='min-h-[250px] w-full flex flex-col items-center'>
      <Loading loading={loading}>
        <h1 className='text-3xl font-bold font-caption mb-12 text-center'>Nos Habitats</h1>
        <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-2'>
        {habitats.map((habitat, index) => (
            <div
              key={index}
              className='flex flex-col justify-between h-[200px] lg:h-[250px] border-2 border-muted rounded-md p-2 cursor-pointer relative'
              onClick={() => openModal(habitat)}
            >
              <Image
                src={getBackgroundImageUrl(habitat)}
                alt={`Habitat ${index}`}
                layout='fill'
                objectFit='cover'
                className='absolute inset-0'
              />
              <h2 className='text-2xl font-bold text-center text-white bg-black bg-opacity-35 p-2 rounded-b z-10'>{habitat.name}</h2>
            </div>
          ))}
        </div>

        {modal && selectedHabitat && (
          <div className='fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 px-1'>
            <div className='bg-foreground p-6 rounded shadow-md w-full md:w-1/2 text-secondary'>
              <div className='flex w-full justify-between'>
                <h1 className='w-3/4 text-2xl sm:text-3xl font-bold'>{selectedHabitat.name}</h1>
                <button onClick={() => setModal(false)} className="w-1/4 flex justify-end text-red-500 hover:text-red-700">
                  <MdClose size={36} />
                </button>
              </div>
              <div className='flex mb-6'>
                <p className='px-2'>Description:</p> <p>{selectedHabitat.description}</p>
              </div>
              <div>
                <ul>
                  {filteredAnimals.map((animal) => (
                    <li 
                      key={animal.id}
                      onClick={() => selectAnimal(animal)}
                      className='cursor-pointer hover:text-blue-500 mb-5 border-b-4 border-muted pb-3'
                    >
                      <p className='sm:text-xl text-md'>{animal.name} : {animal.specieId}</p>
                      {selectedAnimal && selectedAnimal.id === animal.id &&
                        <div>
                          <p className='text-sm ps-5'>{animal.etat}</p>
                        </div>
                      }
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </Loading>
    </div>
  );
}