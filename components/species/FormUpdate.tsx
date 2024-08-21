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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex flex-col items-center bg-foreground pb-6 w-full md:w-1/2 rounded-lg">
        <button onClick={onClose} className="w-full flex justify-end text-red-500 hover:text-red-700">
          <MdClose size={36} />
        </button>
        <p className='text-2xl font-bold text-center text-black'>Modification</p>
        <form onSubmit={handleUpdateHabitat} className="flex flex-col w-2/3 text-secondary">
          <div className="mb-4">
            <label className="block font-bold mb-2">Nom</label>
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