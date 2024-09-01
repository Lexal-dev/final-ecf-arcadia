"use client"
import React, { useEffect, useState } from 'react';
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
  setError(null); 

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
    } else {
      setError(data.message || 'Erreur lors de la mise à jour de l\'habitat.');
    }
  } catch (error:any) {
    setError('Erreur de connexion à la base de données: ' + error.message);
  }
};

useEffect(() => {
  document.body.style.overflow = 'hidden';

  return () => {
    document.body.style.overflow = 'auto';
  };
}, []);


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="md:w-1/2 w-full bg-foreground p-6 rounded shadow-md text-secondary">
        <div className='w-full text-xl flex items-center justify-between md:px-4 mb-6'>
          <h1 className='w-full md:text-3xl text-2xl font-bold'>Modifier un habitat</h1>
          <button onClick={onClose} className="text-red-500 hover:text-red-700"><MdClose size={36} /></button>                
        </div>
        <form onSubmit={handleUpdateHabitat} className="text-secondary">
        {error && <p className="text-red-500 mb-4">{error}</p>}
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
          <div className="mb-4">
            <label className="block">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
              required
            />
          </div>
          <div className="mb-12">
            <label className="block">Commentaire</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-muted hover:bg-background text-white py-2 px-4 rounded"
          >
            Mettre à Jour
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormUpdate;