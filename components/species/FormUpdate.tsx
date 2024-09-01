"use client"
import Specie from '@/models/specie';
import React, { useEffect, useState } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  
  const handleUpdateHabitat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token')
      const response = await fetch(`/api/species/update?id=${specie.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
          <h1 className='w-full sm:text-3xl text-2xl font-bold'>Mise à jour de l&apos;espèce</h1>
          <button onClick={onClose} className="text-red-500 hover:text-red-700"><MdClose size={36} /></button>
        </div>

        <form onSubmit={handleUpdateHabitat} className="text-secondary">
        {error && (<div className="w-full text-center text-red-500"> {error}</div>)}
          <div className="mb-4">
            <label className="block">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
              minLength={3}
              maxLength={30}
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