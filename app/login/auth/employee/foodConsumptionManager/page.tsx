"use client";
import React, { useEffect, useState } from 'react';
import Animal from '@/models/animal';
import Habitat from '@/models/habitat';
import { MdClose, MdEdit } from 'react-icons/md';
import Loading from '@/components/Loading';
import { toast } from 'react-toastify';

export default function FoodConsumptionManager() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [habitats, setHabitats] = useState<Habitat[]>([]);
  const [selectedHabitatName, setSelectedHabitatName] = useState<string | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [food, setFood] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // State for error messages

  const fetchAnimals = async (additionalParam: string | number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/animals/read?additionalParam=${encodeURIComponent(additionalParam.toString())}`);
      const data = await response.json();
      if (data.success) {
        setAnimals(data.animals);
        setHabitats(data.habitats);
      } else {
        console.error('Failed to fetch animals:', data.message);
      }
    } catch (error) {
      console.error('Error fetching animals:', error);
    } finally {
      setLoading(false);
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
    setError(null); // Reset error when closing the modal
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset error before making the request

    if (!selectedAnimal) {
      setError('Aucun animal sélectionné.');
      return;
    }

    const createdAt = new Date().toISOString();

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('/api/report/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
        toast.success('Consommation de nourriture bien ajoutée');
      } else {
        setError(data.message || 'Erreur lors de l\'ajout de la consommation de nourriture.');
      }
    } catch (error: any) {
      setError('Erreur lors de l\'ajout de la consommation de nourriture.');
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
    <main className='w-full flex flex-col justify-center items-center py-6'>
      <Loading loading={loading}>
        <h1 className='sm:text-3xl text-2xl mb-4 font-caption font-bold'>Rapport de nourriture par animal</h1>

        <select onChange={handleHabitatChange} className='bg-foreground hover:bg-muted-foreground hover:text-white text-secondary py-1 px-3 rounded-md mb-6'>
          <option value="">Tous les habitats</option>
          {habitats.map(habitat => (
            <option key={habitat.id} value={habitat.name}>
              {habitat.name}
            </option>
          ))}
        </select>

        <div className='overflow-x-auto w-full flex flex-col items-center'>
          <table className='w-full md:w-2/3'>
            <thead className="bg-muted-foreground">
              <tr>
                <th className='border border-background px-4 py-2 text-left'>Nom</th>
                <th className='border border-background px-4 py-2 text-left'>Race</th>
                <th className='border border-background px-4 py-2 text-left'>Habitat</th>
                <th className='border border-background px-4 py-2 text-center'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnimals.map(animal => (
                <tr key={animal.id} className='w-full border border-background bg-foreground hover:bg-opacity-50 text-secondary hover:bg-muted hover:text-white'>
                  <td className='w-1/3 border border-background px-4 py-2 text-sm'>{animal.name}</td>
                  <td className='w-1/3 border border-background px-4 py-2 text-sm'>{animal.specieId}</td>
                  <td className='w-1/3 border border-background px-4 py-2 text-sm'>{animal.habitatId}</td>
                  <td className='w-1/3 border border-background px-4 py-2 text-sm text-center'>
                    <button
                      onClick={() => openModal(animal)}
                      className='text-green-600 hover:text-green-700'
                    >
                      <MdEdit size={28} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && selectedAnimal && (
          <div className='fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50'>
            <div className='bg-foreground p-6 rounded shadow-md md:w-1/2 text-secondary'>
              <div className='flex w-full justify-between mb-6'>
                <h1 className='w-full sm:text-3xl text-2xl font-bold'>Ajouter un rapport</h1>
                <button onClick={closeModal} className="text-red-500 hover:text-red-700"><MdClose size={36} /></button>
              </div>
              <form onSubmit={handleSubmit} className='text-secondary'>
                {error && <p className="text-red-500 mb-4">{error}</p>}

                <input
                  type="text"
                  value={food}
                  onChange={(e) => setFood(e.target.value)}
                  className="w-full p-2 border rounded bg-muted hover:bg-background text-white placeholder-slate-200 mb-4"
                  placeholder='Entrez le nom de la nourriture donnée'
                  minLength={3}
                  maxLength={50}
                  required
                />

                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full p-2 border rounded bg-muted hover:bg-background text-white placeholder-slate-200 mb-4"
                  placeholder='Quantité en gramme ..'
                  min="0"
                  step="INTEGER"
                  required
                />
                <div>
                  <button type="submit" className="w-full bg-muted hover:bg-background text-white p-2 rounded mt-6 mb-4">
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