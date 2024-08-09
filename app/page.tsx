"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CheckPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /home as soon as the component is mounted
    router.push('/home');
  }, [router]);

  return (
    <main className='flex flex-col items-center py-12 text-center'>
      <p>Welcome...</p>
    </main>
  );
};

export default CheckPage;