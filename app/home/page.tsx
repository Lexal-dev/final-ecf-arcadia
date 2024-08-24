import React from 'react';
import Presentation from '@/components/home/Presentation';
import Activity from '@/components/home/Activity';
import Avis from '@/components/home/Avis';
import FormCreate from '@/components/avis/FormCreate';
 
const HomePage = () => {
  return (
    <main className='flex flex-col items-center py-12'>
      <Presentation />
      <div className='my-12'></div>
      <Activity />
      <div className='my-12'></div>
      <h3 className='text-4xl font-caption text-center mb-6'>Les commentaires laissez par nos visiteurs</h3>
      <Avis />
      <div className='my-12'></div>
      <FormCreate />
    </main>
  );
};

export default HomePage;
