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
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="w-full md:w-2/3 bg-foreground p-4">
                <div className='text-xl flex items-center justify-between mb-6'>
                    <p className='w-2/3 text-secondary font-bold '>Formulaire de création de service</p>
                    <button onClick={onClose} className="w-1/3 flex justify-end text-red-500 hover:text-red-700"><MdClose size={36} /></button>                
                </div>

                <form onSubmit={handleSubmit} className="text-seconday flex flex-col gap-6">

                 
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200"
                            placeholder='Entrez le nom du service ..'
                            required
                        />
        


                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200"
                            placeholder='Entrez la description du service ..'
                            required
                        />

                    <button type="submit" className="w-full bg-muted hover:bg-background text-white p-2 rounded mt-6">
                        Créer
                    </button>
                </form>
            </div>
        </div>
    );
}