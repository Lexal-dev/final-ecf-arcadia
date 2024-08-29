"use client";
import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';
import { toast } from 'react-toastify';

interface Service {
  id: number;
  name: string;
  description: string;
}

interface ServiceUpdateFormProps {
  service: Service;
  onUpdateSuccess: () => void;
  onClose: () => void;
}

const FormUpdate: React.FC<ServiceUpdateFormProps> = ({ service, onUpdateSuccess, onClose }) => {
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
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        onUpdateSuccess();
        toast.success(`${formData.name} a bien été modifié`);
      } else {
        setServerError(data.message);
      }
    } catch (error) {
      console.error('Error updating service:', error);
      setServerError('Une erreur est survenue lors de la mise à jour.');
    }
  };

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-1'>
      <div className='bg-foreground p-6 rounded shadow-md md:w-1/2 text-secondary'>
        <div className='flex w-full justify-between mb-6'>
          <h1 className='w-full sm:text-3xl text-2xl font-bold'>Modification Service</h1>
          <button onClick={onClose} className="text-red-500 hover:text-red-700"><MdClose size={36} /></button>
        </div>
        <form onSubmit={handleUpdateService}>
          {serverError && (
            <p className='text-red-500 mb-4'>{serverError}</p>
          )}

          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded bg-muted hover:bg-background text-white placeholder-slate-200 mb-4"
            placeholder='Entrez le nom du service ..'
            minLength={3}
            maxLength={30}
            required
          />

          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border rounded bg-muted hover:bg-background text-white placeholder-slate-200 mb-4"
            placeholder='Entrez la description du service ..'
            minLength={3}
            maxLength={150}
            required
          />
          
          <button type="submit" className="w-full bg-muted hover:bg-background text-white py-2 px-4 rounded">
            Mettre à jour
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormUpdate;