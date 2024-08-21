"use client"
import React, { useState, useEffect } from 'react';
import  Hour  from '@/models/hour';
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
      const response = await fetch(`/api/hours/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
    <form className="flex flex-col w-full md:min-w-[500px] border-2 border-slate-300 bg-foreground rounded-md p-6 gap-6" onSubmit={handleSubmit}>
      <input
        type="text"
        name="days"
        placeholder="Jours : exemple - Lundi, Mardi..."
        className="w-full p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200"
        value={formData.days}
        onChange={handleChange}
        required
      />
      <input
        type="time"
        name="open"
        placeholder="Heure d'ouverture : exemple - 09:00"
        className="w-full p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200"
        value={formData.open}
        onChange={handleChange}
        required
      />
      <input
        type="time"
        name="close"
        placeholder="Heure de fermeture : exemple - 18:00"
        className="w-full p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200"
        value={formData.close}
        onChange={handleChange}
        required
      />
      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-muted hover:bg-background py-2"
          disabled={isLoading}
        >
          {isLoading ? 'Mise à jour en cours...' : 'Mettre à jour'}
        </button>
        <button
          type="button"
          className="bg-red-500 hover:bg-red-600 py-2 text-white"
          onClick={onClose}
        >
          Annuler
        </button>
      </div>
    </form>
  );
};

export default FormUpdate;