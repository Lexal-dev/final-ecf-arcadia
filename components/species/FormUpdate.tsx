"use client"
import Specie from '@/models/specie';
import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';

interface FormUpdateProps {
  specie: Specie;
  onUpdateSuccess: () => void; 
  onClose: () => void;
}

const FormUpdate: React.FC<FormUpdateProps> = ({ specie, onUpdateSuccess, onClose }) => {

  const [formData, setFormData] = useState({
    name: specie.name,
  });

  const handleUpdateHabitat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/species/update?id=${specie.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
        }),
      });

      const data = await response.json();
      if (data.success) {
        onUpdateSuccess();
      } else {
        console.error('Error updating espèce:', data.message);
      }
    } catch (error) {
      console.error('Error updating espèce:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-1">
      <div className="bg-foreground p-6 rounded shadow-md md:w-1/2 text-secondary">
        <div className='flex w-full justify-between mb-6'>
          <h1 className='w-3/4 text-3xl font-bold'>Mise à jour de l&apos;espèce</h1>
          <button onClick={onClose} className="text-red-500 hover:text-red-700"><MdClose size={36} /></button>
        </div>

        <form onSubmit={handleUpdateHabitat} className="text-secondary">
          <div className="mb-4">
            <label className="block">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-muted hover:bg-background py-2 text-white"
          >
            Mettre à Jour
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormUpdate;