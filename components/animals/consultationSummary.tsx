"use client"
import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/db/firebaseConfig.mjs';
import { toast } from 'react-toastify';
import { MdDelete } from 'react-icons/md';
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
    <table className="w-full md:w-2/3">
      <thead className="bg-muted-foreground">
        <tr >
          <th className="border border-background px-4 py-2 text-left">Nom de l&apos;animal</th>
          <th className="border border-background px-4 py-2 text-left">Nombre de consultations</th>
          <th className="border border-background px-4 py-2 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {consultations.map((animal) => (
          <tr key={animal.id} className="w-full border border-background bg-foreground hover:bg-opacity-50 text-secondary hover:bg-muted hover:text-white">
            <td className="w-1/3 border border-background px-4 py-2 text-sm">{animal.animalName}</td>
            <td className="w-1/3 border border-background px-4 py-2 text-sm text-center">{animal.consultations}</td>
            <td className="w-1/3 border border-background px-4 py-2 text-sm text-center">
              <button
                className="text-red-500 hover:text-red-600"
                onClick={() => deleteConsultation(animal.id)}
              >
                <MdDelete size={28} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ConsultationSummary;