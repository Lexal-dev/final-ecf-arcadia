"use client"
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


    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const response = await fetch('/api/services/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, description }),
        });

        const data = await response.json();
        if (data.success) {
            onCreateSuccess();
            toast.success(`Le service ${name} à été créer avec succès`)
        } else {
            toast.error(`Le service n'a pas pu etre ajouté. erreur :`, data.message)
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 px-1">
            <div className="bg-foreground p-6 rounded shadow-md md:w-1/2 text-secondary">
                <div className='flex w-full justify-between mb-6'>
                    <h1 className='w-3/4 text-3xl font-bold'>Ajouter un service</h1>
                    <button onClick={onClose} className="text-red-500 hover:text-red-700"><MdClose size={36} /></button>                
                </div>

                <form onSubmit={handleSubmit} className="text-secondary">

                    <div className='mb-4'>
                        <label className='block'>Nom</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200"
                            placeholder='Entrez le nom du service ..'
                            required
                        />                    
                    </div>

                    <div className='mb-4'>
                        <label className='block'>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200"
                            placeholder='Entrez la description du service ..'
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