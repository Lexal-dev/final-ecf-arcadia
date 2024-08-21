"use client"
import React, { useState } from 'react';
import Hour from '@/models/hour';
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex flex-col items-center bg-foreground py-12 w-full md:w-1/2 rounded-lg">
                <form onSubmit={handleSubmit} className='flex flex-col w-2/3 text-secondary'>
                    <div className="mb-4 w-full">
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
                    <div className="mb-12">
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
                        
                        <button type="submit" className="w-1/2 bg-muted hover:bg-background py-2">
                            Créer
                        </button>
                        <button type="button" onClick={onClose} className="w-1/2 bg-red-500 hover:bg-red-700 py-2">
                            Annuler
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormCreate;