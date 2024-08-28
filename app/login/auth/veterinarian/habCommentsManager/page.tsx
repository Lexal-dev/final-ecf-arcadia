"use client"
import React, { useState, useEffect } from 'react';
import FormUpdate from '@/components/habitats/FormUpdateComments';
import Habitat from '@/models/habitat';
import { MdEdit } from 'react-icons/md';
import Loading from '@/components/Loading';

const HabitatsComments: React.FC = () => {
    const [habitats, setHabitats] = useState<Habitat[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedHabitat, setSelectedHabitat] = useState<Habitat | null>(null); 

    const fetchHabitats = async (additionalParam: string | number) => {
        setLoading(true)
        try {
            const response = await fetch(`/api/habitats/read?additionalParam=${encodeURIComponent(additionalParam.toString())}`);
            const data = await response.json();
            if (data.success) {
                setHabitats(data.habitats);
            } else {
                console.error(data.message || 'Failed to fetch habitats');
            }
        } catch (error) {
            console.error('Error fetching habitats:', error);

        } finally {
            setLoading(false);
        }
    };

    const openUpdateForm = (habitat: Habitat) => {
        setSelectedHabitat(habitat);
    };

    const closeUpdateForm = () => {
        setSelectedHabitat(null);
    };

    useEffect(() => {
        fetchHabitats('habitats');
    }, []);

    return (
        <main className='flex flex-col items-center py-12 min-h-[200x] px-2'>
            <Loading loading={loading}>
            <h1 className='sm:text-3xl text-2xl mb-4 font-bold'>Gestionnaire commentaire habitats</h1>
            <div className="overflow-x-auto w-full flex flex-col items-center">
                <table className='w-full md:w-2/3'>
                    <thead className='bg-muted-foreground'>
                        <tr >
                            <th className='border border-background px-4 py-2 text-left'>nom</th>
                            <th className='border border-background px-4 py-2 text-left'>Description</th>
                            <th className='border border-background px-4 py-2 text-left'>Commentaire</th>
                            <th className='border border-background px-4 py-2 text-center'>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {habitats.map((habitat) => (
                            <tr key={habitat.id} className='w-full border border-background bg-foreground hover:bg-opacity-50 text-secondary hover:bg-muted hover:text-white'>
                                <td className='w-1/3 border border-background px-4 py-2 text-sm'>{habitat.name}</td>
                                <td className='w-1/3 border border-background px-4 py-2 text-sm'>{habitat.description}</td>
                                <td className='w-1/3 border border-background px-4 py-2 text-sm'>{habitat.comment}</td>
                                <td className='w-1/3 border border-background px-4 py-2 text-center'>
                                    <button
                                        className='text-yellow-500 hover:text-yellow-600'
                                        onClick={() => openUpdateForm(habitat)}
                                    >
                                        <MdEdit size={28} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedHabitat && (
                <FormUpdate
                    habitat={selectedHabitat}
                    onUpdateSuccess={() => {
                        fetchHabitats('defaultParam');
                        closeUpdateForm(); 
                    }}
                    onClose={closeUpdateForm}
                />
            )}
        </Loading>
        </main>
    );
}

export default HabitatsComments;