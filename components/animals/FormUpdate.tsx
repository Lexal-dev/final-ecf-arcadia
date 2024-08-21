"use client"
import React, { useEffect, useState } from 'react';
import { MdClose } from 'react-icons/md';
import { toast } from 'react-toastify';

interface FormUpdateProps {
  animal: Animal;
  onUpdateSuccess: () => void; 
  onClose: () => void;
}

interface Animal {
    id: number;
    name: string;
    etat: string;
    specieId: string;
    habitatId: string;
    imageUrl: string[] ; 
  }

interface Specie {
    id: number;
    name: string;
}

interface Habitat {
    id: number;
    name: string;
}

const FormUpdate: React.FC<FormUpdateProps> = ({ animal, onUpdateSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    name: animal.name,
    specieId: animal.specieId,
    habitatId: animal.habitatId,
    etat: animal.etat || 'Bonne santé'
  });
  const [species, setSpecies] = useState<Specie[]>([]);
  const [habitats, setHabitats] = useState<Habitat[]>([]);
  
  const fetchSpecies = async (additionalParam: string) => {
    try {
        const response = await fetch(`/api/species/read?additionalParam=${encodeURIComponent(additionalParam.toString())}`);
        const data = await response.json();   
        if (response.ok) {
            if (data.species) {
                setSpecies(data.species);
            } else {
                console.error('Echec de la récupération des données des espèces');
                setSpecies([]);
            }
        } else {
            console.error('Echec de la récupération des données', data.error);
            setSpecies([]);
        }
    } catch (error) {
        console.error('Erreur de connexion à la base de données:', error);
        setSpecies([]);
    }
};

const fetchHabitats = async (additionalParam: string) => {
    try {
        const response = await fetch(`/api/habitats/read?additionalParam=${encodeURIComponent(additionalParam.toString())}`);
        const data = await response.json();

        if (response.ok) {
            if (data.habitats) {
                setHabitats(data.habitats);
            } else {
                console.error('Failed to fetch data: habitats not found');
            }
        } else {
            console.error('Failed to fetch data:', data.error);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

const fetchSpeciesAndHabitats = async () => {
        fetchHabitats('habitats');
        fetchSpecies('species');
};

useEffect(() => {fetchSpeciesAndHabitats()}, []);

  const handleUpdateAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set default value for etat if it is empty
    const updatedData = {
      ...formData,
      etat: formData.etat || 'Bonne santé'
    };

    try {
      const response = await fetch(`/api/animals/update?id=${animal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Animal modifié avec succès") 
        onUpdateSuccess();
        
      } else {
        console.error('Error updating habitat:', data.message);
        toast.error('erreur, animal non modifié.')
      }
    } catch (error) {
      console.error("error de la modification de l'animal:", error);
      toast.error('erreur, animal non modifié.')
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex flex-col items-center bg-foreground py-12 w-full md:w-1/2 rounded-lg">
        <button onClick={onClose} className="w-full flex justify-end text-red-500 hover:text-red-700">
          <MdClose size={36} />
        </button>
        <form onSubmit={handleUpdateAnimal} className="flex flex-col w-2/3 text-secondary">
          <div className="mb-4">
            <label className="block font-bold mb-2">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
              required
            />
          </div>
            <div className="mb-4">
                <label className="font-bold mb-2">Espèce</label>
                <select
                    value={formData.specieId}
                    onChange={(e) => setFormData({...formData, specieId: e.target.value})}
                    className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
                    required
                >
                    <option value="">Select Specie</option>
                    {species.map(specie => (
                        <option key={specie.id} value={specie.id}>{specie.name}</option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="font-bold mb-2">Habitat</label>
                <select
                    value={formData.habitatId}
                    onChange={(e) => setFormData({...formData, habitatId: e.target.value})}
                    className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
                    required
                >
                    <option value="">Select Habitat</option>
                    {habitats.map(habitat => (
                        <option key={habitat.id} value={habitat.id}>{habitat.name}</option>
                    ))}
                </select>
                <label className="font-bold mb-2">{formData.etat}</label>
            </div>
          <button
            type="submit"
            className="w-full bg-muted hover:bg-background py-2 text-white"
          >
            Mettre à Jour
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormUpdate;