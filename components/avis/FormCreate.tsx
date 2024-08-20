"use client"
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function FormCreate() {
  const [pseudo, setPseudo] = useState('');
  const [comment, setComment] = useState('');
  const [pseudoError, setPseudoError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  const handlePseudoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPseudo(value);
    if (value.length < 3) {
      setPseudoError('Le pseudonyme doit contenir au moins 3 caractères.');
    } else {
      setPseudoError(null);
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setComment(value);
    if (value.length < 3) {
      setCommentError('Le commentaire doit contenir au moins 3 caractères.');
    } else {
      setCommentError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pseudo.length < 3) {
      setPseudoError('Le pseudonyme doit contenir au moins 3 caractères.');
      return;
    }

    if (comment.length < 3) {
      setCommentError('Le commentaire doit contenir au moins 3 caractères.');
      return;
    }

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
        toast.error(`Erreur lors de l'envoi de l'avis: ${data.message}`);
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'avis:', error);
      toast.error('Erreur lors de l\'envoi de l\'avis.');
    }
  };

  return (
    <div className='flex flex-col w-full md:w-2/3 px-2'>
      <h1 className='font-bold text-4xl text-center mb-10'>Votre avis</h1>
      <form onSubmit={handleSubmit} className='flex flex-col min-w-[300px] border-2 border-slate-300 rounded-md p-6 gap-6 bg-foreground text-secondary'>
        <div className='flex flex-col gap-6'>
          <div className='w-full flex-col'> 
            <input
              type="text"
              value={pseudo}
              onChange={handlePseudoChange}
              required
              minLength={3}
              maxLength={30}
              className='w-full text-white p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200'
              placeholder='Votre pseudonyme'
            />
            {pseudoError && <small className="text-red-500">{pseudoError}</small>}
          </div>
          <div className='w-full flex-col'>
            <textarea
              value={comment}
              onChange={handleCommentChange}
              required
              minLength={3}
              maxLength={150}
              className='w-full text-white p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200'
              placeholder='Votre avis sur le parc ...'
            />
            {commentError && <small className="text-red-500">{commentError}</small>}
          </div>
          <div className='w-full flex justify-center mt-6'>
            <button type="submit" className='w-1/2 bg-muted hover:bg-background py-2 text-white'>Ajouter un avis</button>
          </div>
        </div>
      </form>
    </div>
  );
}