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

  const [serverError, setServerError] = useState<string>('');

  const MAX_NAME_LENGTH = 30;
  const MAX_DESCRIPTION_LENGTH = 150;

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate client
    if (formData.name.length < 3 || formData.name.length > MAX_NAME_LENGTH) {
      return;
    }

    if (formData.description.length < 3 || formData.description.length > MAX_DESCRIPTION_LENGTH) {
      return;
    }

    try {
      const response = await fetch(`/api/services/update?id=${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      });

      const data = await response.json();
      if (data.success) {
        onUpdateSuccess();
        toast.success(`${formData.name} a bien été modifié`)
      } else {
        setServerError(data.message);
      }
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  return (
  <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-1'>
    <div className='bg-foreground p-6 rounded shadow-md md:w-1/2 text-secondary'>
      <div className='flex w-full justify-between mb-6'>
        <h1 className='w-3/4 text-3xl font-bold'>Modification Service</h1>
        <button onClick={onClose} className="text-red-500 hover:text-red-700"><MdClose size={36} /></button>                
      </div>
        <form onSubmit={handleUpdateService}>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded bg-muted hover:bg-background text-white placeholder-slate-200 mb-4"
            placeholder='Entrez le nom du service ..'
            maxLength={MAX_NAME_LENGTH}
            required
          />
          <small className="text-red-500">
            {formData.name.length < 3 && 'Le nom doit avoir au moins 3 caractères.'}
            {formData.name.length > MAX_NAME_LENGTH && `Le nom ne doit pas dépasser ${MAX_NAME_LENGTH} caractères.`}
          </small>

          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border rounded bg-muted hover:bg-background text-white placeholder-slate-200 mb-4"
            placeholder='Entrez le nom du service ..'
            maxLength={MAX_DESCRIPTION_LENGTH}
            required
          />
          <small className="text-red-500">
            {formData.description.length < 3 && 'La description doit avoir au moins 3 caractères.'}
            {formData.description.length > MAX_DESCRIPTION_LENGTH && `La description ne doit pas dépasser ${MAX_DESCRIPTION_LENGTH} caractères.`}
          </small>

          <button type="submit" className="w-full bg-muted hover:bg-background text-white py-2 px-4 rounded">
            Mettre à jour
          </button>         
          {serverError && (
            <div className="text-red-500 mb-4" dangerouslySetInnerHTML={{ __html: serverError }} />
          )}
      </form>
    </div>
  </div>
  );
};

export default FormUpdate;