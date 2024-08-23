"use client"
import React, { useState } from 'react';
import Hour from '@/models/hour';
import { MdClose } from 'react-icons/md';
import { toast } from 'react-toastify';

interface FormCreateProps {
    onClose: () => void;
    onCreate: (newHour: Hour) => void;
}

const FormCreate: React.FC<FormCreateProps> = ({ onClose, onCreate }) => {
    const [days, setDays] = useState('');
    const [open, setOpen] = useState('');
    const [close, setClose] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const response = await fetch('/api/hours/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ days, open, close }),
        });

        const data = await response.json();
        if (data.success) {
            onCreate(data.hour);
            toast.success('Vous avez ajouté une horraire')
            onClose();
        } else {
            toast.error("Echec de l'ajout d'une horraire", data.message)
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 px-1">
            <div className="bg-foreground p-6 rounded shadow-md md:w-1/2 text-secondary">
                <div className='flex w-full justify-between mb-6'>
                    <h1 className='w-3/4 text-3xl font-bold'>Ajouter une heure</h1>
                    <button onClick={onClose} className="text-red-500 hover:text-red-700"><MdClose size={36} /></button>
                </div>
                <form onSubmit={handleSubmit} className='text-secondary'>
                    <div className="mb-4">
                        <label className="font-bold mb-2" htmlFor="days">
                            Jours
                        </label>
                        <input
                            type="text"
                            id="days"
                            value={days}
                            onChange={(e) => setDays(e.target.value)}
                            className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block font-bold mb-2" htmlFor="open">
                            Ouverture
                        </label>
                        <input
                            type="time"
                            id="open"
                            placeholder="Heure d'ouverture : exemple - 09:00"
                            value={open}
                            onChange={(e) => setOpen(e.target.value)}
                            className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block font-bold mb-2" htmlFor="close">
                            Fermeture
                        </label>
                        <input
                            type="time"
                            placeholder="Heure d'ouverture : exemple - 09:00"
                            id="close"
                            value={close}
                            onChange={(e) => setClose(e.target.value)}
                            className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
                            required
                        />
                    </div>
                    <div className="flex w-full justify-center  text-white">
                        <button type="submit" className="w-full bg-muted hover:bg-background text-white py-2 px-4 rounded">
                            Créer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormCreate;