"use client";
import React, { useEffect, useState } from 'react';
import { TbHandFinger } from "react-icons/tb";
import Loading from '@/components/Loading';


interface Animal {
  id: number;
  name: string;
  etat: string;
  specieId: number; 
  habitatId: number;
  imageUrl?: string[] | null;
}

interface Habitat {
  id: number;
  name: string;
  description: string;
  comment: string;
  imageUrl?: string[] | null;
}

interface VetLog {
  id: number;
  animalId: number;
  animalState: string;
  foodOffered: string;
  foodWeight: number;
  createdAt: string;
}

export default function VetLogsAdminList() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [habitats, setHabitats] = useState<Habitat[]>([]);
  const [vetLogs, setVetLogs] = useState<VetLog[]>([]);
  const [selectedHabitatName, setSelectedHabitatName] = useState<string | null>(null);
  const [selectedAnimalId, setSelectedAnimalId] = useState<number | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // State for loading indicator

  const fetchAnimals = async (additionalParam: string | number) => {
    try {
      const response = await fetch(`/api/animals/read?additionalParam=${encodeURIComponent(additionalParam.toString())}`);
      const data = await response.json();
      if (data && data.success) {
        setAnimals(data.animals);
        setHabitats(data.habitats);
        setVetLogs(data.vetLogs);
      } else {
        console.error('Failed to fetch data:', data.message);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  }

  useEffect(() => {
    // Simulate a 1-second loading delay
    const timer = setTimeout(() => {
      fetchAnimals('animals');
    }, 1000);

    // Clear timeout if component unmounts or effect is re-run
    return () => clearTimeout(timer);
  }, []);

  const handleHabitatChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const habitatName = event.target.value;
    setSelectedHabitatName(habitatName ? habitatName : null);
    setSelectedAnimalId(null);
    setSelectedAnimal(null);
  };

  const handleAnimalClick = (animalId: number) => {
    const selected = animals.find(animal => animal.id === animalId);
    if (selected) {
      setSelectedAnimal(selected);
      setSelectedAnimalId(animalId);
    }
  };

  const formatDateTime = (dateTime: Date | string | undefined): string => {
    if (!dateTime) return '';

    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} à ${hours}:${minutes}`;
  };

  const handleDateFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateFilter = event.target.value;
    setSelectedDateFilter(dateFilter);
  };

  const filteredAnimals = selectedHabitatName
    ? animals.filter(animal => animal.habitatId.toString() === selectedHabitatName)
    : animals;

  useEffect(() => {
    console.log("filteredAnimals:", filteredAnimals);
    console.log("selectedHabitatName:", selectedHabitatName);
  }, [filteredAnimals, selectedHabitatName]);

  const filteredVetLogs = (vetLogs || [])
    .filter(vetLog => !selectedAnimalId || vetLog.animalId === selectedAnimalId)
    .filter(vetLog => !selectedDateFilter || new Date(vetLog.createdAt) >= new Date(selectedDateFilter))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getAnimalNameById = (id: number) => {
    const animal = animals.find(animal => animal.id === id);
    return animal ? animal.name : null;
  };

  return (
    <div>
      <Loading loading={loading}>
        <h1 className="sm:text-3xl text-2xl font-caption font-bold mb-12 text-center">Rapports vétérinaires</h1>
        <div className="w-full flex flex-col md:flex-row gap-x-6">
          <div className="w-full flex flex-col items-center md:items-start mb-6 md:mb-0 items-start md:w-1/4">
            <div className="flex flex-col items-start">
              <h2 className="sm:text-xl text-lg font-bold mb-2">Listes des animaux</h2>
              <select
                onChange={handleHabitatChange}
                className='bg-foreground hover:bg-muted-foreground hover:text-white text-secondary py-1 px-3 rounded-md mb-2'>
                <option value="">Selectionnez un habitat</option>
                {habitats.map(habitat => (
                  <option key={habitat.id} value={habitat.name}>
                    {habitat.name}
                  </option>
                ))}
              </select>
            </div> 

            <ul className='w-full'>
              {filteredAnimals.map(animal => (
                <li
                  key={animal.id}
                  onClick={() => handleAnimalClick(animal.id)}
                  className="w-full cursor-pointer p-2 rounded-md">
                  <div className='w-full flex justify-between gap-2 border-b-2 border-muted pb-3 hover:text-green-200'>
                    <p>
                      {animal.name} - {animal.specieId} 
                    </p>
                    <TbHandFinger size={20} className='hover:text-green-400'/>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full md:w-3/4">
            <div className="flex flex-col items-center">
              <input
                type="date"
                className="p-2 border rounded-md bg-gray-100 shadow-md mb-2 text-secondary"
                onChange={handleDateFilterChange}
              />
            </div>
            <div className="overflow-y-auto max-h-96 bg-foreground text-secondary rounded-md p-4 shadow-md">
              {filteredVetLogs.length === 0 ? (
                <p>No consultations found.</p>
              ) : (
                <ul>
                  {filteredVetLogs.map(vetLog => (
                    <li key={vetLog.id} className="py-2">
                      <p className="text-lg font-bold mb-1">{selectedAnimal ? selectedAnimal?.name : getAnimalNameById(vetLog.animalId)}</p>
                      <p>Health: {vetLog.animalState}</p>
                      <p>Food offered: {vetLog.foodOffered}</p>
                      <p>Quantity: {vetLog.foodWeight}g</p>
                      <p>Date: {formatDateTime(vetLog.createdAt)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </Loading>
    </div>
  );
}