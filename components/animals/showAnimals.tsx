"use client";
import React, { useEffect, useState } from 'react';
import { doc, updateDoc, increment, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/db/firebaseConfig.mjs';
import Animal from '@/models/animal';
import { TbHandFinger } from 'react-icons/tb';
import Loading from '@/components/Loading';

export default function ShowAnimals() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedHabitatId, setSelectedHabitatId] = useState<string | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [modal, setModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cachedAnimals =  sessionStorage.getItem('animals')

        if(cachedAnimals)
        {
          setAnimals(JSON.parse(cachedAnimals))
        } else {
          const response = await fetch(`/api/animals/read?additionalParam=${encodeURIComponent('animals')}`);
          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }
          const data = await response.json();
          if (data.success) {
            setAnimals(data.animals);
            sessionStorage.setItem('animals', JSON.stringify(data.animals));
          } else {
            console.error('Failed to fetch data:', data.message);
          }          
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
    const habitatId = event.target.value;
    setSelectedHabitatId(habitatId !== '' ? habitatId : null);
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

  // Extract unique habitatIds
  const habitatIds = Array.from(new Set(animals.map((animal) => animal.habitatId.toString())));

  const filteredAnimals = selectedHabitatId
    ? animals.filter((animal) => animal.habitatId.toString() === selectedHabitatId)
    : animals;

  const defaultImageUrl = '/images/Pasdimage.jpg';

  return (
    <div className='min-h-[250px] w-full flex flex-col items-center'>
      <Loading loading={loading}>
        <h2 className='text-3xl font-bold font-caption mb-6 text-center'>Liste des animaux</h2>
        <select onChange={handleHabitatChange} className='bg-foreground hover:bg-muted-foreground hover:text-white text-secondary py-1 px-3 rounded-md mb-6'>
          <option value=''>Sélectionnez un habitat</option>
          {habitatIds.map((habitatId) => (
            <option key={habitatId} value={habitatId}>
              {habitatId}
            </option>
          ))}
        </select>
        <div className='flex flex-col sm:w-auto min-w-[400px]  items-start text-secondary bg-foreground rounded-md py-6'>
          <div className='flex flex-col w-full mb-4'>
            {selectedHabitatId ? (
              <p className='text-2xl font-bold mb-4 w-full text-center'>[{selectedHabitatId}]</p>
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