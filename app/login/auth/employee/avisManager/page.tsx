"use client"
import Loading from '@/components/Loading';
import React, { useEffect, useState } from 'react';
import { MdEdit, MdDelete } from 'react-icons/md';
import { toast } from 'react-toastify';

interface Avis {
    id: number;
    pseudo: string;
    comment: string;
    isValid: boolean;
}

export default function AvisManager() {
    const [avisList, setAvisList] = useState<Avis[]>([]);
    const [filter, setFilter] = useState<'all' | 'valid' | 'invalid'>('all');
    const [loading, setLoading] = useState<boolean>(true)

    const fetchAvis = async (additionalParam: string | number) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/avis/read?additionalParam=${encodeURIComponent(additionalParam.toString())}`);
            if (!response.ok) {
                throw new Error('Failed to fetch avis');
            }
            const data = await response.json();
            if (data.success) {
                setAvisList(data.avis);
            } else {
                throw new Error(data.message || 'Failed to fetch avis');
            }
        } catch (error) {
            console.error('Error fetching avis:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchAvis('avis');
    }, []);

    const handleUpdateSuccess = () => {
        fetchAvis('avis');
    };

    const handleDeleteSuccess = (id: number) => {
        setAvisList(avisList.filter(a => a.id !== id));
    };

    const filteredAvis = avisList.filter(a => {
        if (filter === 'all') return true;
        return filter === 'valid' ? a.isValid : !a.isValid;
    });

    const toggleAvisValidity = async (avis: Avis) => {
        try {
            const response = await fetch(`/api/avis/update?id=${avis.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isValid: !avis.isValid }),
            });

            const data = await response.json();
            if (data.success) {
                handleUpdateSuccess();
                toast.success(`Status de l'avis : ${avis.isValid ? 'valide' : 'non-valide'} est devenu  ${avis.isValid ? 'non-valide' : 'valide'}`);
            } else {
                console.error('Error updating avis:', data.message);
            }
        } catch (error) {
            console.error('Error updating avis:', error);
        }
    };

    const deleteAvis = async (avis: Avis) => {
        setLoading(true)
        try {
            const response = await fetch(`/api/avis/delete?id=${avis.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                handleDeleteSuccess(avis.id);
                toast.success("L'avis a bien été supprimé")
            } else {

                toast.error("Erreur l'avis n'a pas pu être supprimé :", data.message)
            }
        } catch (error) {
            console.error('Error deleting avis:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
<main className="w-full flex-col flex py-6 px-1 items-center">
    <Loading loading={loading}>
        <div className="flex justify-between mb-1">
            <div>
                <button className={`px-4 py-2 text-black md:rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => setFilter('all')}>Tous</button>
                <button className={`px-4 py-2 ml-2 md:rounded text-black ${filter === 'valid' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => setFilter('valid')}>Valides</button>
                <button className={`px-4 py-2 ml-2 md:rounded text-black ${filter === 'invalid' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => setFilter('invalid')}>Invalides</button>
            </div>
        </div>
        <div className="w-full lg:w-2/3 overflow-x-auto bg-white shadow-md md:rounded-lg">
            {filteredAvis.length === 0 ? (
                <div className="p-4 text-center text-secondary">Aucun avis trouvé</div>
            ) : (
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-muted-foreground">
                            <th className="px-4 py-2 text-left">Pseudo</th>
                            <th className="px-4 py-2 text-left">Commentaire</th>
                            {filter === 'all' && <th className="px-4 py-2 text-left">Validité</th>}
                            <th className="px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAvis.map(a => (
                            <tr key={a.id} className="border-t bg-foreground text-secondary hover:bg-muted hover:text-white">
                                <td className="px-4 py-2">{a.pseudo}</td>
                                <td className="px-4 py-2">{a.comment}</td>
                                {filter === 'all' && <td className="px-4 py-2">{a.isValid ? 'Valide' : 'Invalide'}</td>}
                                <td className="px-4 py-2 flex justify-center items-center space-x-4">
                                    <button onClick={() => toggleAvisValidity(a)} className="text-yellow-500 hover:text-yellow-700">
                                        <MdEdit size={24} />
                                    </button>
                                    <button onClick={() => deleteAvis(a)} className="text-red-500 hover:text-red-600">
                                        <MdDelete size={24} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    </Loading>
</main>
    );
}