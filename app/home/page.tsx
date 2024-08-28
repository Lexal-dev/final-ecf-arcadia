"use client";

import React, { useEffect, useState } from 'react';
import Presentation from '@/components/home/Presentation';
import Activity from '@/components/home/Activity';
import AvisList from '@/components/home/Avis';
import FormCreate from '@/components/avis/FormCreate';
import { Animal } from '@/lib/types/types'; 
import Avis from '@/models/avis';
import Loading from '@/components/Loading';

const HomePage = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [avisList, setAvisList] = useState<Avis[]>([]);
  const [error, setError] = useState<string>('');
  const [loadingImage, setLoadingImage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    
    const fetchAnimalsAndAvis = async () => {
      setLoading(true);
      setLoadingImage(true);
      setError('');

      // Fetch animals
      try {
        const cachedAnimals = sessionStorage.getItem('animals');
        if (cachedAnimals) {
          setAnimals(JSON.parse(cachedAnimals));
        } else {
          const response = await fetch('/api/animals/read?additionalParam=animals');
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          setAnimals(data.animals);
          sessionStorage.setItem('animals', JSON.stringify(data.animals));
        }
      } catch (error) {
        console.error('Error fetching animals:', error);
        setError('Échec de la récupération des animaux. Veuillez réessayer plus tard.');
      }

      // Fetch avis
      try {
        const cachedAvis = sessionStorage.getItem('avis');
        if (cachedAvis) {
          setAvisList(JSON.parse(cachedAvis));
        } else {
          const response = await fetch('/api/avis/read?additionalParam=avis');
          if (!response.ok) throw new Error('Failed to fetch avis');
          const data = await response.json();
          if (data.success) {
            const avis = data.avis.filter((avis: Avis) => avis.isValid === true);
            setAvisList(avis);
            sessionStorage.setItem('avis', JSON.stringify(avis));
          } else {
            throw new Error(data.message || 'Failed to fetch avis');
          }
        }
      } catch (error) {
        console.error('Error fetching avis:', error);
        setError('Échec de la récupération des avis. Veuillez réessayer plus tard.');
      } finally {
        setLoadingImage(false); // Hide loading spinner after fetching is complete
        setLoading(false)
      }
    };

    fetchAnimalsAndAvis();

  }, []);

  return (
    <Loading loading={loading}>
      <main className='flex flex-col items-center py-12'>
        <Presentation animals={animals} error={error} loadingImage={loadingImage} />
        <div className='my-12'></div>
        <Activity />
        <div className='my-12'></div>
        <AvisList avisList={avisList} />
        <div className='my-12'></div>
        <FormCreate />
      </main>
    </Loading>
  );
};

export default HomePage;
