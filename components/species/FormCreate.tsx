"use client"
import React, { useEffect, useState } from 'react';
import { MdClose } from 'react-icons/md';

interface FormCreateProps {
    onCreateSuccess: () => Promise<void>;
    onClose: () => void;
}

export default function FormCreate({ onCreateSuccess, onClose }: FormCreateProps) {
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const token = sessionStorage.getItem('token')
        const response = await fetch('/api/species/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ name }),
        });

        const data = await response.json();
        if (data.success) {
            onCreateSuccess();
        } else {
            setError(data.message || 'Une erreur est survenue lors de l\'envoi de l\'éspèce.');
            console.error('Error creating service:', data.message);
        }
    };
    
    useEffect(() => {
        document.body.style.overflow = 'hidden';
    
        return () => {
          document.body.style.overflow = 'auto';
        };
      }, []);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full md:w-1/2 bg-foreground p-6 rounded shadow-md  text-secondary">
                <div className='flex w-full justify-between mb-6'>
                    <h1 className='w-full sm:text-3xl text-2xl font-bold'>Ajoutez une espèce</h1>
                    <button onClick={onClose} className="text-red-500 hover:text-red-700"><MdClose size={36} /></button>
                </div>

                <form onSubmit={handleSubmit} className="text-seconday">
                    {error && (<div className="w-full text-center text-red-500"> {error}</div>)}
                    <div className="mb-4">
                        <label className="block">Nom</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
                            minLength={3}
                            maxLength={30}
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 mb-2 text-center">{error}</p>}
                    <button type="submit" className="w-full bg-muted hover:bg-background text-white p-2 rounded mt-6">
                        Créer
                    </button>
                </form>
            </div>
        </div>
    );
}