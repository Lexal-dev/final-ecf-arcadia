import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';
import { toast } from 'react-toastify';

interface FormUpdateProps {
  service: Service;
  onUpdateSuccess: () => void;
  onClose: () => void;
}

interface Service {
  id: number;
  name: string;
  description: string;
}

const FormUpdate: React.FC<FormUpdateProps> = ({ service, onUpdateSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    name: service.name,
    description: service.description,
  });

  const [serverError, setServerError] = useState<string | null>(null);

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null); 

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`/api/services/update?id=${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      });

      const data = await response.json();
      if (data.success) {
        onUpdateSuccess();
        toast.success(`Le service ${formData.name} a été modifié avec succès`);
      } else {
        setServerError(data.message);
      }
    } catch (error) {
      console.error('Error updating service:', error);
      setServerError('Une erreur est survenue lors de la mise à jour du service.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="w-full sm:w-1/2 bg-foreground p-6 rounded shadow-md text-secondary">
        <div className='flex w-full justify-between mb-6'>
          <h1 className='w-full sm:text-3xl text-2xl font-bold'>Modifier un service</h1>
          <button onClick={onClose} className="text-red-500 hover:text-red-700"><MdClose size={36} /></button>                
        </div>
        <form onSubmit={handleUpdateService} className="text-secondary">
          {serverError && (
            <p className='text-red-500 mb-4'>{serverError}</p>
          )}

          <div className='mb-4'>
            <label className="block">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
              placeholder='Entrez le nom du service ..'
              required
            />             
          </div>

          <div className='mb-4'>
            <label className="block">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
              placeholder='Entrez la description du service ..'
              required
            />              
          </div>

          <button
            type="submit"
            className="w-full bg-muted hover:bg-background text-white p-2 rounded mt-6"
          >
            Mettre à Jour
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormUpdate;