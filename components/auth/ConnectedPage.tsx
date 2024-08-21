"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { decodeToken } from '@/lib/security/decode';

interface User {
  userEmail: string;
  userRole: string;
}

const ConnectedPage: React.FC = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setTimeout(() => {
      router.push('/login');
  }, 1000);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const decoded = decodeToken(storedToken);
      if (decoded) {
        setCurrentUser({
          userEmail: decoded.userEmail,
          userRole: decoded.userRole,
        });
      } else {
        console.error('Token invalide');
        localStorage.removeItem('token');
        router.push('/login');
      }
    }
  }, [router]);

  if (!currentUser) {
    return <p className='w-full flex justify-center items-center text-center min-h-[500px]'>Chargement des données...</p>;
  }

  return (
    <main className='flex flex-col items-center pt-6 pb-12 px-4'>
      <h1 className='text-4xl font-bold mb-6'>Bienvenue sur votre espace dédiés!</h1>

      <div className='flex flex-col md:flex-row w-full justify-around items-center bg-muted rounded-md py-12'>

          <div className='w-full md:w-1/2 mb-12 md:mb-0'>
            <div className='flex gap-2 mb-6'>
              <p className='text-xl font-bold'>Email:</p>
              <p className='text-lg'>{currentUser.userEmail}</p>
            </div>
            <div className='flex gap-2'>
              <p className='text-xl font-bold'>Role:</p>
              <p className='text-lg'>{currentUser.userRole}</p>
            </div>
          </div>

          <button className="w-[100px] h-[100px] rounded-full border-4 border-red-400 hover:border-red-600 text-xl font-bold text-red-400 hover:text-red-600 " onClick={handleLogout}>
              <p>Logout</p>
          </button>
          
      </div>
    </main>
  );
};

export default ConnectedPage;