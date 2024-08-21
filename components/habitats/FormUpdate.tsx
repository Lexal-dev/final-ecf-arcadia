"use client"
import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';

interface FormUpdateProps {
  habitat: Habitat; 
  onUpdateSuccess: () => void; 
  onClose: () => void; 
}

interface Habitat {
  id: number;
  name: string;
  description: string;
  comment: string;
}

const FormUpdate: React.FC<FormUpdateProps> = ({ habitat, onUpdateSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    name: habitat.name,
    description: habitat.description,
    comment: habitat.comment,
  });

  const handleUpdateHabitat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/habitats/update?id=${habitat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          comment: formData.comment,
        }),
      });

      const data = await response.json();
      if (data.success) {
        onUpdateSuccess();
      } else {
        console.error('Error updating habitat:', data.message);
      }
    } catch (error) {
      console.error('Error updating habitat:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex flex-col items-center bg-foreground py-12 w-full md:w-1/2 rounded-lg">
        <div className='w-full text-xl flex items-center justify-between md:px-4 mb-6'>
            <p className='w-full text-secondary font-bold'>Formulaire de modification d&apos;habitats</p>
            <button onClick={onClose} className="flex justify-end text-red-500 hover:text-red-700"><MdClose size={36} /></button>                
        </div>
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
          <div className="mb-4">
            <label className="block font-bold mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
              required
            />
          </div>
          <div className="mb-12">
            <label className="block font-bold mb-2">Commentaire</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
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