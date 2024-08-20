"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CheckPage = () => {
  const router = useRouter();

  useEffect(() => {
    console.log('Redirection vers /home');
    router.replace('/home');
  }, [router]);

  return (
    <main className='flex flex-col items-center py-12'>
      <p>Redirection en cours...</p>
      <p>Probleme de redirection click <Link href="/home" className="hover:text-red-200">ICI</Link></p>
    </main>
  );
};

export default CheckPage;