
import Presentation from '@/components/home/Presentation';
import Activity from '@/components/home/Activity';
import AvisList from '@/components/home/Avis';
import FormCreate from '@/components/avis/FormCreate';


const HomePage = () => {
  return (

      <main className='flex flex-col items-center py-12'>
        <Presentation />
        <div className='my-12'></div>
        <Activity />
        <div className='my-12'></div>
        <AvisList/>
        <div className='my-12'></div>
        <FormCreate />
      </main>

  );
};

export default HomePage;
