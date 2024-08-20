import FormContact from '@/components/contact/FormContact';
import React from 'react';

export default function ContactPage() {
  return (
    <main className='flex flex-col items-center py-12 px-2 gap-6 md:p-12 '>
      <div className='flex flex-col text-center md:w-2/3 '>
        <p className='text-lg'>Ci-dessous, Notre formulaire de contact :</p>
        <FormContact />        
      </div>
    </main>
  );
}