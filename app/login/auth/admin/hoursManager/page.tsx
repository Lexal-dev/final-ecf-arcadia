"use client";
import React, { useEffect, useState } from 'react';
import Hour from '@/models/hour';
import FormUpdate from '@/components/hours/FormUpdate'; 
// import FormCreate from '@/components/hours/FormCreate'; 
import { MdEdit } from 'react-icons/md';

import Loading from '@/components/Loading'; 

export default function HoursManager() {
    const [hours, setHours] = useState<Hour[]>([]);
    const [selectedHour, setSelectedHour] = useState<Hour | null>(null);
//    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [loading, setLoading] = useState(true)

    const fetchHours = async (additionalParam: string | number) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/hours/read?additionalParam=${encodeURIComponent(additionalParam.toString())}`, {
                method: 'GET',
            });

            const data = await response.json();
            if (data.success) {
                setHours(data.hours);
            } else {
                console.error('Échec de la récupération des heures :', data.message);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des heures :', error);
        }
    };

    useEffect(() => {
        const cachedHour = sessionStorage.getItem('hours')
        if(cachedHour)
        {
            setHours(JSON.parse(cachedHour))
        } else {
            fetchHours('hours');   
        }
        
        setLoading(false)
    }, []);

    const handleUpdate = (updatedHour: Hour) => {
        setSelectedHour(updatedHour);
        setHours(hours.map(hour => hour.id === updatedHour.id ? updatedHour : hour));
        sessionStorage.setItem('hours', JSON.stringify(hours.map(hour => hour.id === updatedHour.id ? updatedHour : hour)))
    };

    const handleClose = () => {
        setSelectedHour(null);
    };

    return (
        <main className="flex flex-col py-12 items-center px-2">
            <Loading loading={loading}>
                <h1 className='sm:text-3xl text-2xl mb-4 font-caption font-bold'>Gestion des horraires</h1>
                <div className="overflow-x-auto w-full flex flex-col items-center">
                    <table className="w-full md:w-2/3">
                        <thead className="bg-muted-foreground">
                            <tr>
                                <th className="border border-background px-4 py-2 text-left">Jours</th>
                                <th className="border border-background px-4 py-2 text-center">Ouverture</th>
                                <th className="border border-background px-4 py-2 text-center">Fermeture</th>
                                <th className="border border-background px-4 py-2 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hours.map(hour => (
                                <tr key={hour.id} className="w-full border border-background bg-foreground hover:bg-opacity-50 text-secondary hover:bg-muted hover:text-white">
                                    <td className="w-1/3 border border-background px-4 py-2 text-sm">{hour.days}</td>
                                    <td className="w-1/3 border border-background px-4 py-2 text-sm text-center">{hour.open}</td>
                                    <td className="w-1/3 border border-background px-4 py-2 text-sm text-center">{hour.close}</td>
                                    <td className="w-1/3 border border-background px-4 py-2 text-sm">
                                        <div className='flex items-center justify-center'>
                                            <button onClick={() => handleUpdate(hour)} className='text-yellow-500 hover:text-yellow-600'>
                                                <MdEdit size={28}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {selectedHour && (
                    <FormUpdate
                        hour={selectedHour}
                        onClose={handleClose}
                        onUpdate={handleUpdate}
                    />
                )}
            </Loading>
        </main>
    );
}