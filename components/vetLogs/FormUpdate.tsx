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
  onclose: () => void; 
}

const FormUpdate: React.FC<FormUpdateProps> = ({ vetLog, onUpdate, onclose }) => {
  const [formData, setFormData] = useState<VetLog>({
    id: vetLog?.id || 0,
    animalState: vetLog?.animalState || '',
    foodOffered: vetLog?.foodOffered || '',
    foodWeight: vetLog?.foodWeight || 0,
    createdAt: vetLog ? new Date(vetLog.createdAt) : new Date(),
  });

  const handleUpdateVetLog = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onclose();
  };

  return (
    <div className="w-full">
      <div className="p-6">
        <form onSubmit={handleUpdateVetLog} className="text-secondary">
          <div className="mb-4">
            <label className="block text-lg font-bold mb-2">État de l&apos;animal</label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="État de l'animal"
              value={formData.animalState}
              onChange={e => setFormData({ ...formData, animalState: e.target.value })}
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