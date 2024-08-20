import React from 'react';
import Presentation from '@/components/home/Presentation';
import Activity from '@/components/home/Activity';
 
const HomePage = () => {
  return (
    <main className='flex flex-col items-center py-12'>
      <Presentation />
      <div className='my-12'></div>
      <Activity />
      <div className='my-12'></div>
    </main>
  );
};

export default HomePage;
