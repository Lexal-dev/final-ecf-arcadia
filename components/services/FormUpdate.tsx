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

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
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
        toast.success(`Le service ${formData.name} à été modifié avec succès`)
      } else {
        console.error('Error updating service:', data.message);
        toast.error(`Le service n'a pas pu etre modifié. erreur :`, data.message)
      }
    } catch (error) {
      console.error('Error updating service:', error)
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
    <div className="w-full md:w-2/3 bg-foreground p-4">
        <div className='text-xl flex items-center justify-between mb-6'>
            <p className='w-2/3 text-secondary font-bold '>Formulaire de création de service</p>
            <button onClick={onClose} className="w-1/3 flex justify-end text-red-500 hover:text-red-700"><MdClose size={36} /></button>                
        </div>
        <form onSubmit={handleUpdateService} className="text-seconday flex flex-col gap-6">
         
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200 text-white"
              required
            />
         

            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200 text-white"
              placeholder='Entrez la description du service ..'
              required
            />
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