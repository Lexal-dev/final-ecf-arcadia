"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';

const CheckPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/home');
  }, [router]);

  return (
    <main className='w-full flex justify-center items-center text-center min-h-[500px]'>
      <p className='text-xl font-bold font-caption'>Chargement des données</p>
      <FaSpinner className='animate-spin mr-2' size={36}/>
    </main>

  );
};

export default CheckPage;