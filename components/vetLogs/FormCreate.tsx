import React, { useState } from 'react';

interface FormCreateProps {
  animalId: number; 
  onCreate: (formData: any) => void;
}

const FormCreate: React.FC<FormCreateProps> = ({ animalId, onCreate }) => {
  const [animalState, setAnimalState] = useState('');
  const [foodOffered, setFoodOffered] = useState('');
  const [foodWeight, setFoodWeight] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null); 

    const parsedFoodWeight = parseFloat(foodWeight);

    // formData object
    const formData = {
      animalId,
      animalState,
      foodOffered,
      foodWeight: parsedFoodWeight,
    };

    onCreate(formData);

    setAnimalState('');
    setFoodOffered('');
    setFoodWeight('');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 w-full md:w-2/4 mt-6 text-secondary">
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <div className="mb-2">
        <label className="block text-sm font-medium">État de l&apos;animal</label>
        <input
          type="text"
          value={animalState}
          onChange={(e) => setAnimalState(e.target.value)}
          className="p-2 border border-gray-300 bg-muted text-white hover:bg-muted-foreground rounded-md w-full placeholder-slate-200"
          placeholder="État de l'animal"
          required
          minLength={3}
          maxLength={100}
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">Nourriture proposée</label>
        <input
          type="text"
          value={foodOffered}
          onChange={(e) => setFoodOffered(e.target.value)}
          className="p-2 border border-gray-300 bg-muted text-white hover:bg-muted-foreground rounded-md w-full placeholder-slate-200"
          placeholder="Nourriture proposée"
          required
          minLength={3}
          maxLength={50}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium">Grammage de la nourriture (en g)</label>
        <input
          type="number"
          value={foodWeight}
          onChange={(e) => setFoodWeight(e.target.value)}
          className="p-2 border border-gray-300 bg-muted text-white hover:bg-muted-foreground rounded-md w-full placeholder-slate-200"
          placeholder="Grammage de la nourriture"
          required
          min="0"
          step="INTEGER"
        />
      </div>
      
      <button type="submit" className="bg-muted hover:bg-muted-foreground text-white font-semibold py-2 px-4 rounded-md w-full">Créer vetLog</button>
    </form>
  );
};

export default FormCreate;