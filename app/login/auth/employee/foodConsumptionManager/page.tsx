"use client";
import React, { useEffect, useState } from 'react';
import Animal from '@/models/animal';
import Habitat from '@/models/habitat';
import { MdClose, MdEdit } from 'react-icons/md';
import Loading from '@/components/Loading';
import { toast } from 'react-toastify';


export default function  FoodConsumptionManager(){
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [habitats, setHabitats] = useState<Habitat[]>([]);
  const [selectedHabitatName, setSelectedHabitatName] = useState<string | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false); // State for modal visibility
  const [food, setFood] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true)
  
  const fetchAnimals = async (additionalParam: string | number) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/animals/read?additionalParam=${encodeURIComponent(additionalParam.toString())}`);
      const data = await response.json();
      if (data.success) {
        setAnimals(data.animals);
        setHabitats(data.habitats);
      } else {
        console.error('Failed to fetch animals:', data.message);
      }
    } catch(error) {
      console.error('Error fetching animals:', error);
    } finally {
      setLoading(false)
    }
  };

  const handleHabitatChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const habitatName = event.target.value;
    setSelectedHabitatName(habitatName !== "" ? habitatName : null);
  };


  const openModal = (animal: Animal) => {
    setSelectedAnimal(animal);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFood('');
    setQuantity(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAnimal) {
      return;
    }

    const createdAt = new Date().toISOString();

    try {
      const response = await fetch('/api/report/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          food,
          quantity,
          createdAt,
          animalId: selectedAnimal.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        closeModal();
        toast.success('Consommation de nourriture bien ajouté')
      } else {
        console.error('Error adding food consumption:', data.message);
      }
    } catch (error:any) {
      console.error('Error adding food consumption:', error);
    }
  };


  useEffect(() => {
    fetchAnimals('animals');
  }, []);
  const filteredAnimals = selectedHabitatName
    ? animals.filter(animal => animal.habitatId.toString() === selectedHabitatName)
    : animals;


  return (
    <main className='w-full flex flex-col justify-center px-2 items-center py-6'>
      <Loading loading={loading}>
      <div className='mb-4 text-secondary'>
        <select onChange={handleHabitatChange} className='my-4 border border-gray-300 rounded p-2'>
          <option value="">Tous les habitats</option>
          {habitats.map(habitat => (
            <option key={habitat.id} value={habitat.name}>
              {habitat.name}
            </option>
          ))}
        </select>
      </div>

      <div className='w-full md:w-2/3 overflow-x-auto'>
        <table className='w-full table-auto bg-white shadow-md md:rounded-lg'>
          <thead>
            <tr className="bg-muted-foreground">
              <th className='py-3 px-6 border-b text-left'>Nom</th>
              <th className='py-3 px-6 border-b text-left'>Race</th>
              <th className='py-3 px-6 border-b text-left'>Habitat</th>
              <th className='px-4 py-2 text-center'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAnimals.map(animal => (
              <tr key={animal.id} className='border-t bg-foreground text-secondary hover:bg-muted hover:text-white'>
                <td className='px-4 py-2'>{animal.name}</td>
                <td className='px-4 py-2'>{animal.specieId}</td>
                <td className='px-4 py-2'>{animal.habitatId}</td>
                <td className='px-4 py-2 flex justify-center items-center space-x-4'>
                  <button
                    onClick={() => openModal(animal)}
                    className='text-green-600 hover:text-green-700'
                  >
                    <MdEdit size={24} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedAnimal && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-75'>

          <div className='flex flex-col items-between justify-around bg-foreground text-secondary p-6 rounded-lg shadow-lg md:w-[600px] md:h-[400px]'>
            <div className='text-xl flex items-center justify-between'>
              <h2 className='text-xl font-semibold'>Ajouter un rapport de consommation pour {selectedAnimal.name}</h2>
              <button onClick={closeModal} className=" justify-end text-red-500 hover:text-red-700"><MdClose size={36} /></button> 
            </div>

            <form onSubmit={handleSubmit} className='w-full flex flex-col justify-between items-between space-y-4'>

                <input
                  type="text"
                  value={food}
                  onChange={(e) => setFood(e.target.value)}
                  className="w-full text-white p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200"
                  placeholder='Entrez le nom de la nourriture donnée'
                  required
                />

                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full text-white p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200"
                  placeholder='Quantité en gramme ..'
                  required
                  min={1}
                />
            <div>
              <button type="submit" className="w-full bg-muted hover:bg-background text-white p-2 rounded mt-6">
                          Créer
              </button>              
            </div>

            </form>
          </div>
        </div>
      )}
      </Loading>
    </main>
  );
}
