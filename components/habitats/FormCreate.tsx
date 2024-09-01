"use client"
import React, { useEffect, useState } from 'react';
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
            const token = sessionStorage.getItem('token');
            const response = await fetch('/api/habitats/create', {
                method: 'POST',
                headers:  { 'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
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

    useEffect(() => {
        document.body.style.overflow = 'hidden';
    
        return () => {
          document.body.style.overflow = 'auto';
        };
      }, []);
      
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="md:w-1/2 w-full bg-foreground p-6 rounded shadow-md  text-secondary">
                <div className='w-full text-xl flex items-center justify-between md:px-4 mb-6'>
                    <h1 className='w-full md:text-3xl text-2xl font-bold'>Ajouter un habitat</h1>
                    <button onClick={onClose} className="text-red-500 hover:text-red-700"><MdClose size={36} /></button>                
                </div>
                <form onSubmit={handleSubmit} className="text-secondary">
                    {error && <p className="text-red-500 mb-2">{error}</p>}
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
                    <div className="mb-4">
                        <label className="block">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block">Comment</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-muted hover:bg-background text-white py-2 px-4 rounded"
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