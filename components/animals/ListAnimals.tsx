"use client"
import React, { useEffect, useState } from 'react';
import Animal from '@/models/animal';
import Habitat from '@/models/habitat';
import Report from '@/models/report';
import { MdClose } from 'react-icons/md';

export default function ListAnimals() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [habitats, setHabitats] = useState<Habitat[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedHabitatName, setSelectedHabitatName] = useState<string | null>(null);
  const [selectedAnimalId, setSelectedAnimalId] = useState<number | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [choiceHabitat, setChoiceHabitat] = useState<boolean>(true);
  const [modal, setModal] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const fetchAnimals = async (additionalParam: string | number) => {
    fetch(`/api/animals/read?additionalParam=${encodeURIComponent(additionalParam.toString())}`)
    .then(response => response.json())
    .then(data => {
        if (data && data.success) {
          setAnimals(data.animals);
          setHabitats(data.habitats);
          setReports(data.reports);
        } else {
          console.error('Failed to fetch data:', data.message);
        }
      })
      .catch(error => console.error('Error fetching data:', error));
  }

  useEffect(() => {fetchAnimals('animals')}, []);

  const handleHabitatChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const habitatName = event.target.value;
    setSelectedHabitatName(habitatName !== "" ? habitatName : null);
  };

  const handleAnimalId = (animalId: number) => {
    const selected = animals.find(animal => animal.id === animalId);
    if (selected) {
      setSelectedAnimal(selected);
      setSelectedAnimalId(animalId);
      setModal(true);
    }
  };

  const filteredAnimals = selectedHabitatName
    ? animals.filter(animal => animal.habitatId.toString() === selectedHabitatName)
    : animals;

  const filteredReport = selectedAnimalId
    ? reports.filter(report => {
        const reportDate = new Date(report.createdAt);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (start && reportDate < start) return false;
        if (end && reportDate > end) return false;
        return report.animalId === selectedAnimalId;
      })
    : [];

  function formatDateTime(dateTime: Date | string | undefined): string {
    if (!dateTime) return '';
    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} à ${hours}:${minutes}`;
  }

  useEffect(() => {
    if (selectedHabitatName === "" || selectedHabitatName === null) {
      setChoiceHabitat(true)
    } else {
      setChoiceHabitat(false)
    }
  }, [selectedHabitatName])

  useEffect(() => {
    if (modal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [modal]);

  return (
    <>
     <h1 className='sm:text-3xl text-2xl mb-4 font-caption font-bold'>Rapports des employés</h1>
      <select onChange={handleHabitatChange} className='bg-foreground hover:bg-muted-foreground hover:text-white text-secondary py-1 px-3 rounded-md mb-6'>
        <option value="">Sélectionnez un habitat</option>
        {habitats.map(habitat => (
          <option key={habitat.id} value={habitat.name}>
            {habitat.name}
          </option>
        ))}
      </select>


        <div className='flex items-center gap-3'>
          <h2 className='sm:text-xl text-lg font-bold mb-4'>Liste des animaux</h2> 
          {choiceHabitat ? (
            <p className='sm:text-xl text-lg font-bold mb-4'> [Complète]:</p>
          ) : (
            <p className='sm:text-xl text-lg font-bold mb-4'> [{selectedHabitatName}]:</p>
          )}                   
        </div>

        <div className='overflow-x-auto w-full flex flex-col items-center'>
          <table className='w-full md:w-2/3'>
            <thead className='bg-muted-foreground'>
              <tr >
                <th className='border border-background px-4 py-2 text-left'>Nom</th>
                <th className='border border-background px-4 py-2 text-left'>Race</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnimals.map(animal => (
                <tr key={animal.id} onClick={() => handleAnimalId(animal.id)} className='cursor-pointer w-full border border-background bg-foreground hover:bg-opacity-50 text-secondary hover:bg-muted hover:text-white'>
                  <td className='w-1/3 border border-background px-4 py-2 text-sm'>{animal.name}</td>
                  <td className='w-1/3 border border-background px-4 py-2 text-sm'>{animal.specieId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      {modal && (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50'>
          <div className='bg-foreground rounded-lg p-4 max-w-xl w-full text-secondary overflow-y-auto'>
            <div className='flex justify-between items-center'>
              <h1 className='w-full sm:text-3xl text-2xl font-bold'>Détails du rapport pour {selectedAnimal?.name}</h1>
              <button onClick={() => setModal(false)} className='text-red-600 hover:text-red-700 text-xl hover:text-2xl'><MdClose size={36} /></button>
            </div>


            <div className='mb-4'>
              <label className='block text-gray-700'>Date de début :</label>
              <input 
                type='date' 
                value={startDate || ''} 
                onChange={(e) => setStartDate(e.target.value)} 
                className='w-full bg-background hover:bg-muted-foreground text-white p-2 border rounded'
              />
            </div>
            <div className='mb-4'>
              <label className='block text-gray-700'>Date de fin :</label>
              <input 
                type='date' 
                value={endDate || ''} 
                onChange={(e) => setEndDate(e.target.value)} 
                className='w-full bg-background hover:bg-muted-foreground text-white p-2 border rounded'
              />
            </div>

            {filteredReport.length === 0 ? (
              <p className='text-center'>Aucun rapport disponible</p>
            ) : (
              <ul>
                {filteredReport.map(report => (
                  <li key={report.id} className='mb-2 border-b-2 pb-2'>
                    <p>Nourriture donnée : {report.food}</p>
                    <p>Quantité donnée : {report.quantity}g</p>
                    <p>Date : {formatDateTime(report.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}