import React, { useState } from 'react';

interface VetLog {
  id: number;
  animalState: string;
  foodOffered: string;
  foodWeight: number;
  createdAt: Date;
}

interface FormUpdateProps {
  vetLog: VetLog | null;
  onUpdate: (formData: any) => void;
  onClose: () => void;
}

const FormUpdate: React.FC<FormUpdateProps> = ({ vetLog, onUpdate, onClose }) => {
  const [formData, setFormData] = useState<VetLog>({
    id: vetLog?.id || 0,
    animalState: vetLog?.animalState || '',
    foodOffered: vetLog?.foodOffered || '',
    foodWeight: vetLog?.foodWeight || 0,
    createdAt: vetLog ? new Date(vetLog.createdAt) : new Date(),
  });

  const [error, setError] = useState<string | null>(null);

  const handleUpdateVetLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Réinitialiser les erreurs avant de valider

    // Validation des contraintes
    if (formData.animalState.length < 3 || formData.animalState.length > 100) {
      setError('L\'état de l\'animal doit avoir entre 3 et 100 caractères.');
      return;
    }

    if (formData.foodOffered.length < 3 || formData.foodOffered.length > 50) {
      setError('La nourriture offerte doit avoir entre 3 et 50 caractères.');
      return;
    }

    if (isNaN(formData.foodWeight) || formData.foodWeight <= 0) {
      setError('Le poids de la nourriture doit être un nombre supérieur à zéro.');
      return;
    }

    try {
      // Simulation de l'appel API pour la mise à jour
      await onUpdate(formData);
      onClose();
    } catch (err) {
      setError('Une erreur est survenue lors de la mise à jour des données.');
    }
  };

  return (
    <div className="w-full">
      <div className="p-6">
        <form onSubmit={handleUpdateVetLog} className="text-secondary">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="mb-4">
            <label className="block text-lg font-bold mb-2">État de l&apos;animal</label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="État de l'animal"
              value={formData.animalState}
              onChange={e => setFormData({ ...formData, animalState: e.target.value })}
              minLength={3}
              maxLength={50}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-lg font-bold mb-2">Nourriture offerte</label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Nourriture offerte"
              value={formData.foodOffered}
              onChange={e => setFormData({ ...formData, foodOffered: e.target.value })}
              min="0"
              step="INTEGER"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-lg font-bold mb-2">Poids de la nourriture (g)</label>
            <input
              type="number"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Poids de la nourriture"
              value={formData.foodWeight}
              onChange={e => setFormData({ ...formData, foodWeight: parseFloat(e.target.value) })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-lg font-bold mb-2">Date de création</label>
            <input
              type="datetime-local"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Date de création"
              value={formData.createdAt.toISOString().substring(0, 16)}
              onChange={e => setFormData({ ...formData, createdAt: new Date(e.target.value) })}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-muted hover:bg-muted-foreground border text-white py-2 px-4 rounded"
          >
            Mettre à Jour
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormUpdate;