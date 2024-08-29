"use client";
import React, { useState, useEffect } from 'react';
import Hour from '@/models/hour';
import { MdClose } from 'react-icons/md';
import { toast } from 'react-toastify';

interface FormUpdateProps {
  hour: Hour;
  onClose: () => void;
  onUpdate: (updatedHour: Hour) => void;
}

const FormUpdate: React.FC<FormUpdateProps> = ({ hour, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    id: hour.id,
    days: hour.days,
    open: hour.open,
    close: hour.close,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData({
      id: hour.id,
      days: hour.days,
      open: hour.open,
      close: hour.close,
    });
  }, [hour]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`/api/hours/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Horaire mis à jour avec succès !');
        onUpdate(data.hour);
        onClose();
      } else {
        toast.error(`Erreur lors de la mise à jour de l'horaire: ${data.message}`);
      }
    } catch (error: any) {
      toast.error(`Erreur lors de la mise à jour de l'horaire: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 px-1">
      <div className="w-full sm:w-1/2 bg-foreground p-6 rounded shadow-md text-secondary">
        <div className='flex w-full justify-between mb-6'>
          <h1 className='w-full sm:text-3xl text-2xl font-bold'>Ajouter une heure</h1>
          <button onClick={onClose} className="text-red-500 hover:text-red-700"><MdClose size={36} /></button>
        </div>
        <form className="text-secondary" onSubmit={handleSubmit}>
        
          <input
            type="text"
            name="days"
            placeholder="Jours : exemple - Lundi, Mardi..."
            className="w-full p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200 mb-4 text-white"
            value={formData.days}
            onChange={handleChange}
            required
          />

          <input
            type="time"
            name="open"
            placeholder="Heure d'ouverture : exemple - 09:00"
            className="w-full p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200 mb-4 text-white"
            value={formData.open}
            onChange={handleChange}
            required
          />

          <input
            type="time"
            name="close"
            placeholder="Heure de fermeture : exemple - 18:00"
            className="w-full p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200 mb-4 text-white"
            value={formData.close}
            onChange={handleChange}
            required
          />

          <div className="flex w-full justify-center text-white">
            <button
              type="submit"
              className="w-full bg-muted hover:bg-background text-white py-2 px-4 rounded"
              disabled={isLoading}
            >
              {isLoading ? 'Mise à jour en cours...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormUpdate;