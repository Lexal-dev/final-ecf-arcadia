"use client"
import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';

interface FormCreateProps {
    onCreateSuccess: () => Promise<void>;
    onClose: () => void;
}

const FormCreate: React.FC<FormCreateProps> = ({ onCreateSuccess, onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [comment, setComment] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/habitats/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, description, comment }),
            });

            const data = await response.json();
            if (data.success) {
                await onCreateSuccess();
                setName('');
                setDescription('');
                setComment('');
            } else {
                setError(data.message || 'Failed to create habitat');
                console.error('Error creating habitat:', data.message);
            }
        } catch (error) {
            console.error('Error creating habitat:', error);
            setError('An error occurred while creating habitat');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex flex-col items-center bg-foreground py-12 w-full md:w-1/2 rounded-lg">
                <div className='w-full text-xl flex items-center justify-between md:px-4 mb-6'>
                    <p className='w-full text-secondary font-bold '>Formulaire de création d&apos;habitat</p>
                    <button onClick={onClose} className="flex justify-end text-red-500 hover:text-red-700"><MdClose size={36} /></button>                
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col w-2/3 text-secondary">
                    {error && <p className="text-red-500 mb-2">{error}</p>}
                    <div className="mb-4">
                        <label className="font-bold mb-2">Nom</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="font-bold mb-2">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="font-bold mb-2">Comment</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-muted hover:bg-background text-white py-2"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Ajouter un Habitat'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default FormCreate;