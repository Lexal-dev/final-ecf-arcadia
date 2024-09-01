"use client";
import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';
import { toast } from 'react-toastify';

interface FormCreateProps {
    onCreateSuccess: () => Promise<void>;
    onClose: () => void;
}

export default function FormCreate({ onCreateSuccess, onClose }: FormCreateProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [serverError, setServerError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setServerError(null); // Réinitialise les erreurs avant de soumettre
        const token = sessionStorage.getItem('token');

        try {
            const response = await fetch('/api/services/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ name, description }),
            });

            const data = await response.json();
            if (data.success) {
                onCreateSuccess();
                toast.success(`Le service ${name} a été créé avec succès`);
            } else {
                setServerError(data.message); // Affiche le message d'erreur côté client
            }
        } catch (error) {
            console.error('Erreur lors de la création du service:', error);
            setServerError('Une erreur est survenue lors de la création du service.');
        }
    };
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="w-full sm:w-1/2 bg-foreground p-6 rounded shadow-md text-secondary">
                <div className='flex w-full justify-between mb-6'>
                    <h1 className='w-full sm:text-3xl text-2xl font-bold'>Ajouter un service</h1>
                    <button onClick={onClose} className="text-red-500 hover:text-red-700"><MdClose size={36} /></button>                
                </div>

                <form onSubmit={handleSubmit} className="text-secondary">
                {serverError && (<p className='text-red-500 mb-4'>{serverError}</p>)}
                    <div className='mb-4'>
                        <label className='block'>Nom</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200 text-white"
                            placeholder='Entrez le nom du service ..'
                            minLength={3}
                            maxLength={30}
                            required
                        />                    
                    </div>

                    <div className='mb-4'>
                        <label className='block'>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200 text-white"
                            placeholder='Entrez la description du service ..'
                            minLength={3}
                            maxLength={150}
                            required
                        />                        
                    </div>

                    <button type="submit" className="w-full bg-muted hover:bg-background text-white p-2 rounded mt-6">
                        Créer
                    </button>
                </form>
            </div>
        </div>
    );
}