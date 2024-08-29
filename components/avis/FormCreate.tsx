"use client"
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function FormCreate() {
  const [pseudo, setPseudo] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch('/api/avis/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pseudo, comment }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Avis envoyé avec succès !');
        setPseudo('');
        setComment('');
      } else {
        setError(data.message || 'Une erreur est survenue lors de l\'envoi de l\'avis.');
      }
    } catch (error) {
      setError('Erreur lors de la création de l\'avis. Veuillez réessayer plus tard.');
      console.error('Erreur lors de la création de l\'avis:', error);
    }
    
  };

  return (
    <div className='flex flex-col w-full md:w-2/3 px-2'>
      <h1 className='text-4xl font-caption text-center mb-6'>Votre avis</h1>
      <form onSubmit={handleSubmit} className='flex flex-col min-w-[300px] border-2 border-slate-300 rounded-md p-6 gap-6 bg-foreground text-secondary'>
      {error && (<div className="w-full text-center text-red-500"> {error}</div>)}
        <div className='flex flex-col gap-6'>
          <div className='w-full flex-col'> 
            <input
              type="text"
              value={pseudo}
              required
              minLength={3}
              maxLength={30}
              className='w-full text-white p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200'
              placeholder='Votre pseudonyme'
            />

          </div>
          <div className='w-full flex-col'>
            <textarea
              value={comment}
              required
              minLength={3}
              maxLength={150}
              className='w-full text-white p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200'
              placeholder='Votre avis sur le parc ...'
            />
          </div>
          <div className='w-full flex justify-center mt-6'>
            <button type="submit" className='w-1/2 bg-muted hover:bg-background py-2 text-white'>Ajouter un avis</button>
          </div>
        </div>
      </form>
    </div>
  );
}