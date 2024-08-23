"use client";
import React, { useEffect, useState } from 'react';
import Hour from '@/models/hour';
import FormUpdate from '@/components/hours/FormUpdate'; 
import FormCreate from '@/components/hours/FormCreate'; 
import { MdDelete, MdEdit } from 'react-icons/md';
import { toast } from 'react-toastify';
import Loading from '@/components/Loading'; 

export default function HoursManager() {
    const [hours, setHours] = useState<Hour[]>([]);
    const [selectedHour, setSelectedHour] = useState<Hour | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
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
        fetchHours('hours');
        setLoading(false)
    }, []);

    const handleUpdate = (updatedHour: Hour) => {
        setSelectedHour(updatedHour);
        setHours(hours.map(hour => hour.id === updatedHour.id ? updatedHour : hour));
    };

    const handleCreateClick = () => {
        setIsCreateOpen(true);
    };

    const handleCreate = (newHour: Hour) => {
        setHours([...hours, newHour]);
    };

    const handleClose = () => {
        setSelectedHour(null);
        setIsCreateOpen(false);
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch('/api/hours/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            const data = await response.json();
            if (data.success) {
                setHours(hours.filter(hour => hour.id !== id));
                toast.success('Vous avez supprimé une heure');
            } else {
                toast.error("Échec de la suppression d'une heure", data.message);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'heure :', error);
        }
    };

    return (
        <main className="flex flex-col py-12 items-center">
            <Loading loading={loading}>
                <h1 className='text-3xl mb-4 font-bold'>Gestionnaire des horraires</h1>
                <button
                    onClick={handleCreateClick}
                    className="bg-foreground hover:bg-muted-foreground hover:text-white text-secondary py-1 px-3 rounded-md mb-6"
                >
                    Ajouter une heure
                </button>
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
                                        <div className='flex items-center justify-center md:gap-5'>
                                            <button onClick={() => handleDelete(hour.id)} className='text-red-500 hover:text-red-600'>
                                                <MdDelete size={28}/>
                                            </button>
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
                {isCreateOpen && (
                    <FormCreate
                        onClose={handleClose}
                        onCreate={handleCreate}
                    />
                )}
            </Loading>
        </main>
    );
}