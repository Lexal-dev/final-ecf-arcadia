"use client"
import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/db/firebaseConfig.mjs';
import { toast } from 'react-toastify';

interface ConsultationSummaryProps {}

const ConsultationSummary: React.FC<ConsultationSummaryProps> = () => {
  const [consultations, setConsultations] = useState<any[]>([]);

  useEffect(() => {
    async function fetchConsultations() {
      try {
        const querySnapshot = await getDocs(collection(db, 'animals'));
        const consultationsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setConsultations(consultationsData);
      } catch (error) {
        console.error('Erreur lors de la récupération des consultations :', error);
      }
    }

    fetchConsultations();
  }, []);

  const deleteConsultation = async (animalId: string) => {
    try {
      await deleteDoc(doc(db, 'animals', animalId));
      setConsultations((prevConsultations) =>
        prevConsultations.filter((consultation) => consultation.id !== animalId)
      );
      toast.success("Nombre de consultation de l'animal bien effacé")
    } catch (error) {
      console.error('Erreur lors de la suppression de la consultation :', error);
    }
  };

  return (
    <table className="w-full md:w-2/3 w-1/2">
      <thead>
        <tr className="bg-muted-foreground">
          <th className="border border-background px-4 py-2">Nom de l&apos;animal</th>
          <th className="border border-background px-4 py-2">Nombre de consultations</th>
          <th className="border border-background px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {consultations.map((animal) => (
          <tr key={animal.id} className="border border-background bg-foreground hover:bg-opacity-50 text-secondary hover:bg-muted hover:text-white">
            <td className="w-1/2 border border-background px-4 py-2">{animal.animalName}</td>
            <td className="w-1/4 border border-background px-4 py-2 text-center">{animal.consultations}</td>
            <td className="w-1/4 border border-background px-4 py-2 text-center">
              <button
                className="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded"
                onClick={() => deleteConsultation(animal.id)}
              >
                Supprimer
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ConsultationSummary;