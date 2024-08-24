"use client";
import React, { useEffect, useState } from 'react';
import { doc, updateDoc, increment, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/db/firebaseConfig.mjs';
import Animal from '@/models/animal';
import Habitat from '@/models/habitat';
import { TbHandFinger } from 'react-icons/tb';
import Loading from '@/components/Loading';
import Image from 'next/image';

export default function ShowAnimals() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [habitats, setHabitats] = useState<Habitat[]>([]);
  const [selectedHabitatName, setSelectedHabitatName] = useState<string | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [modal, setModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/animals/read?additionalParam=${encodeURIComponent('animals')}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        if (data.success) {
          setAnimals(data.animals);
          setHabitats(data.habitats);
        } else {
          console.error('Failed to fetch data:', data.message);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleHabitatChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const habitatName = event.target.value;
    setSelectedHabitatName(habitatName !== '' ? habitatName : null);
  };

  const handleAnimalId = async (animalId: number) => {
    const selected = animals.find((animal) => animal.id === animalId);
    if (selected) {
      setSelectedAnimal(selected);
      setModal(true);
      await addOrUpdateConsultation(selected);
    }
  };

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

  const filteredAnimals = selectedHabitatName
    ? animals.filter((animal) => animal.habitatId.toString() === selectedHabitatName)
    : animals;

  const selectedHabitat = habitats.find((habitat) => habitat.name === selectedHabitatName);

  const defaultImageUrl = '/images/Pasdimage.jpg';

  useEffect(() => {
    console.log(selectedAnimal?.imageUrl);
  }, [selectedAnimal?.imageUrl]);

  return (
    <div className='min-h-[250px] w-full flex flex-col items-center'>
      <Loading loading={loading}>
        <h2 className='text-3xl font-bold mb-6 text-center'>Liste des animaux</h2>
        <select onChange={handleHabitatChange} className='text-black p-1 rounded-md bg-foreground text-secondary mb-6'>
          <option value=''>Sélectionnez un habitat</option>
          {habitats.map((habitat) => (
            <option key={habitat.id} value={habitat.name}>
              {habitat.name}
            </option>
          ))}
        </select>
        {selectedHabitat && selectedHabitat.imageUrl && selectedHabitat.imageUrl.length > 0 && (
          <div className='w-full flex justify-center mb-4'>
            <Image
              src={selectedHabitat.imageUrl[0]}
              alt={selectedHabitat.name}
              className='w-[500px] h-auto rounded-md border-2 border-green-100'
            />
          </div>
        )}
        <div className='flex flex-col w-full md:w-2/3 items-start text-secondary bg-foreground rounded-md p-2'>
          <div className='flex flex-col w-full mb-4'>
            {selectedHabitatName ? (
              <p className='text-2xl font-bold mb-4 w-full text-center'>[{selectedHabitatName}]</p>
            ) : (
              <p className='text-2xl font-bold mb-4 w-full text-center'>[Complète]</p>
            )}
          </div>
          <div className='w-full overflow-y-auto'>
            <ul className='w-full flex flex-wrap items-center justify-center gap-2 max-h-[500px]'>
              {filteredAnimals.map((animal) => (
                <li
                  key={animal.id}
                  value={animal.id}
                  onClick={() => handleAnimalId(animal.id)}
                  className='flex justify-start items-start gap-x-4 w-2/3 text-lg cursor-pointer hover:text-green-500'
                >
                  <TbHandFinger /> {animal.name} : {animal.specieId}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {modal && selectedAnimal && (
          <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 px-1'>
            <div className='flex flex-col items-center bg-foreground text-secondary rounded-lg p-4 max-w-xl w-full text-black'>
              <div
                className='h-[250px] w-full rounded-lg'
                style={{
                  backgroundImage: `url(${Array.isArray(selectedAnimal.imageUrl) && selectedAnimal.imageUrl.length > 0 ? selectedAnimal.imageUrl[0] : defaultImageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              ></div>
              <h2 className='text-xl font-semibold mb-6 text-center w-full'>Détails sur {selectedAnimal.name}</h2>
              <div className='flex flex-col w-full w-2/3 items-start justify-center'>
                <p>Race: {selectedAnimal.specieId}</p>
                <p>État: {selectedAnimal.etat}</p>
                <p>Habitat: {selectedAnimal.habitatId}</p>
              </div>

              <button
                className='w-full bg-muted hover:bg-background text-white px-4 py-2 mt-4 rounded-md'
                onClick={() => setModal(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </Loading>
    </div>
  );
}