"use client"
import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface FormContactProps {}

const FormContact: React.FC<FormContactProps> = () => {
  const [formData, setFormData] = useState({
    email: '',
    title: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({
    emailError: '',
    titleError: '',
    messageError: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    validateField(e.target.name, e.target.value);
  };

  const validateField = (fieldName: string, value: string) => {
    switch (fieldName) {
      case 'email':
        if (value.length < 1 || value.length > 40) {
          setFormErrors({ ...formErrors, emailError: 'L\'email doit contenir entre 1 et 40 caractères.' });
        } else if (!isValidEmail(value)) {
          setFormErrors({ ...formErrors, emailError: 'Veuillez entrer une adresse email valide.' });
        } else {
          setFormErrors({ ...formErrors, emailError: '' });
        }
        break;
      case 'title':
        if (value.length < 1 || value.length > 30) {
          setFormErrors({ ...formErrors, titleError: 'Le titre doit contenir entre 1 et 30 caractères.' });
        } else {
          setFormErrors({ ...formErrors, titleError: '' });
        }
        break;
      case 'message':
        if (value.length < 1 || value.length > 255) {
          setFormErrors({ ...formErrors, messageError: 'Le message doit contenir entre 1 et 255 caractères.' });
        } else {
          setFormErrors({ ...formErrors, messageError: '' });
        }
        break;
      default:
        break;
    }
  };

  const isValidEmail = (email: string) => {
    // Fonction validate email
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/mailer/contactMailer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setIsSuccess(true);
        setFormData({
          email: '',
          title: '',
          message: '',
        });
        toast.success('Formulaire de contact bien envoyé')
      } else {
        console.error('Erreur lors de l\'envoi du formulaire:', data.message);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du formulaire:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    let isValid = true;

    if (formData.email.length < 1 || formData.email.length > 40) {
      setFormErrors({ ...formErrors, emailError: 'L\'email doit contenir entre 1 et 40 caractères.' });
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      setFormErrors({ ...formErrors, emailError: 'Veuillez entrer une adresse email valide.' });
      isValid = false;
    }

    if (formData.title.length < 1 || formData.title.length > 30) {
      setFormErrors({ ...formErrors, titleError: 'Le titre doit contenir entre 1 et 30 caractères.' });
      isValid = false;
    }

    if (formData.message.length < 1 || formData.message.length > 255) {
      setFormErrors({ ...formErrors, messageError: 'Le message doit contenir entre 1 et 255 caractères.' });
      isValid = false;
    }

    return isValid;
  };

  return (
    <>
      <form className="flex flex-col w-full md:min-w-[500px] border-2 border-slate-300 bg-foreground rounded-md p-6 gap-6" onSubmit={handleSubmit}>
        <div className='w-full'>
          <input
            type="email"
            name="email"
            placeholder="Adresse email : exemple - arcadia.zoo@yahoo.fr"
            className="w-full p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {formErrors.emailError && <small className="text-red-500">{formErrors.emailError}</small>}
        </div>

        <div className='w-full'>
          <input
            type="text"
            name="title"
            placeholder="Titre: exemple - Animaux sauvage..."
            className="w-full p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200"
            value={formData.title}
            onChange={handleChange}
            required
          />
          {formErrors.titleError && <small className="text-red-500">{formErrors.titleError}</small>}
        </div>

        <div className='w-full'>
          <textarea
            name="message"
            placeholder="Demande: exemple - Insérez votre demande ici ..."
            className="w-full p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200"
            value={formData.message}
            onChange={handleChange}
            required
          />
          {formErrors.messageError && <small className="text-red-500">{formErrors.messageError}</small>}
        </div>

        <button
          type="submit"
          className="bg-muted hover:bg-background py-2"
          disabled={isLoading}
        >
          {isLoading ? 'Envoi en cours...' : 'Envoyer'}
        </button>
      </form>
      {isSuccess && (
        <p className="text-green-700 text-center mt-4">Votre message a été envoyé avec succès !</p>
      )}
    </>
  );
};

export default FormContact;