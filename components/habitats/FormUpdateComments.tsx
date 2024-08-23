"use client"
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { MdClose } from 'react-icons/md';
interface FormUpdateProps {
  habitat: Habitat; // Habitat à mettre à jour
  onUpdateSuccess: () => void; // Callback après la mise à jour réussie
  onClose: () => void; // Callback pour fermer le formulaire
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
        onUpdateSuccess(); // Appeler la fonction de callback après la mise à jour réussie
        toast.success(`Commentaire sur l'habitat ${formData.name} modifié avec succés`)
      } else {
        console.error('Error updating habitat:', data.message);
      }
    } catch (error) {
      console.error('Error updating habitat:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-1">
      <div className="bg-foreground p-6 rounded shadow-md md:w-1/2 text-secondary">
        <div className='flex w-full justify-between mb-6'>
          <h1 className='w-3/4 text-3xl font-bold'>Commentaire pour l&apos;habitat {formData.name}</h1>
          <button onClick={onClose} className="text-red-500 hover:text-red-700"><MdClose size={36} /></button>
        </div>


        <form onSubmit={handleUpdateHabitat} className="flex flex-col justify-between h-full">
          <div className="mb-4 w-full">
            <div defaultValue={formData.name} className="w-full bg-muted hover:bg-background text-white p-2 border rounded mb-4">{formData.name}</div>
          </div>
          <div className="mb-4 w-full">
            <div defaultValue={formData.description} className="w-full bg-muted hover:bg-background text-white p-2 border rounded mb-4">{formData.description}</div>
          </div>

          <div className="mb-4">
            <label className="block text-sm">Commentaire</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full bg-background hover:bg-muted-foreground text-white p-2 border border-2 rounded"
              minLength={3}
              maxLength={200}
            />
          </div>
          <button
            type="submit"
            className="bg-muted hover:bg-muted-foreground text-white px-4 py-2 mt-4 rounded-md"
          >
            Mettre à Jour
          </button>
        </form>
        
      </div>
    </div>
  );
};

export default FormUpdate;