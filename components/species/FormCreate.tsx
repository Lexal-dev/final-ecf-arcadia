"use client"
import React, { useState } from 'react';
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

        const response = await fetch('/api/species/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name }),
        });

        const data = await response.json();
        if (data.success) {
            onCreateSuccess();
        } else {
            setError(data.message || 'Failed to create service');
            console.error('Error creating service:', data.message);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-1">
            <div className="bg-foreground p-6 rounded shadow-md md:w-1/2 text-secondary">
                <div className='flex w-full justify-between mb-6'>
                    <h1 className='w-3/4 text-3xl font-bold'>Ajoutez une espèce</h1>
                    <button onClick={onClose} className="text-red-500 hover:text-red-700"><MdClose size={36} /></button>
                </div>

                <form onSubmit={handleSubmit} className="text-seconday">
                    <div className="mb-4">
                        <label className="block">Nom</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
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