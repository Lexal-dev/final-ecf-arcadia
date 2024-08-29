"use client";
import React, { useState } from 'react';
import { toast } from 'react-toastify';
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

  const [error, setError] = useState<string | null>(null);

  const handleUpdateHabitat = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Réinitialiser les erreurs avant la validation

    // Validation des contraintes
    if (formData.comment.length < 3) {
      setError('Le commentaire doit comporter au moins 3 caractères.');
      return;
    }
    if (formData.comment.length > 200) {
      setError('Le commentaire ne peut pas dépasser 200 caractères.');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`/api/habitats/update?id=${habitat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
        toast.success(`Commentaire sur l'habitat ${formData.name} modifié avec succès`);
      } else {
        setError(data.message || 'Une erreur est survenue lors de la mise à jour.');
      }
    } catch (error) {
      setError('Une erreur est survenue lors de la mise à jour.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-1">
      <div className="w-full sm:w-1/2 bg-foreground p-6 rounded shadow-md text-secondary">
        <div className='flex w-full justify-between mb-6'>
          <h1 className='w-full sm:text-3xl text-2xl font-bold'>Ajouter un commentaire</h1>
          <button onClick={onClose} className="text-red-500 hover:text-red-700"><MdClose size={36} /></button>
        </div>

        <form onSubmit={handleUpdateHabitat} className="flex flex-col justify-between h-full">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="mb-4 w-full">
            <div className="w-full bg-muted hover:bg-background text-white p-2 border rounded mb-4">{formData.name}</div>
          </div>
          <div className="mb-4 w-full">
            <div className="w-full bg-muted hover:bg-background text-white p-2 border rounded mb-4">{formData.description}</div>
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