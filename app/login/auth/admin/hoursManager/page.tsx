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
            <Loading loading={loading}> {/* Utilisation du composant Loading */}
                <button
                    onClick={handleCreateClick}
                    className="bg-foreground hover:bg-muted-foreground hover:text-white text-secondary py-1 px-3 rounded-md mb-6"
                >
                    Ajouter une heure
                </button>
                <div className="overflow-x-auto w-full flex flex-col items-center">
                    <table className="w-full md:w-2/3 shadow-md">
                        <thead className="bg-muted-foreground">
                            <tr>
                                <th className="py-3 px-2 text-left">Jours</th>
                                <th className="py-3 px-2 text-left">Ouverture</th>
                                <th className="py-3 px-2 text-left">Fermeture</th>
                                <th className="py-3 px-2 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hours.map(hour => (
                                <tr key={hour.id} className="bg-foreground text-secondary hover:bg-muted">
                                    <td className="py-3 px-2 border-b-2 border-background">{hour.days}</td>
                                    <td className="py-3 px-2 border-b-2 border-background">{hour.open}</td>
                                    <td className="py-3 px-2 border-b-2 border-background">{hour.close}</td>
                                    <td className="py-3 px-2 border-b-2 border-background">
                                        <div className='flex justify-center gap-2'>
                                            <button onClick={() => handleDelete(hour.id)} className='text-white text-lg bg-red-500 hover:bg-red-600 p-2 rounded-md'>
                                                <MdDelete />
                                            </button>
                                            <button onClick={() => handleUpdate(hour)} className='text-white text-lg bg-yellow-500 hover:bg-yellow-600 rounded p-2 '>
                                                <MdEdit />
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