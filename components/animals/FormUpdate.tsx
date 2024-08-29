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
  imageUrl: string[]; 
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

  useEffect(() => {
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

    fetchSpeciesAndHabitats();
  }, []);

  const handleUpdateAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set default value for etat if it is empty
    const updatedData = {
      ...formData,
      etat: formData.etat || 'Bonne santé'
    };

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`/api/animals/update?id=${animal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Animal modifié avec succès");
        onUpdateSuccess();
      } else {
        console.error('Error updating animal:', data.message);
      }
    } catch (error) {
      console.error("Erreur de la modification de l'animal:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 px-1">
      <div className="bg-foreground p-6 rounded shadow-md w-full md:w-1/2 text-secondary">
        <div className='flex w-full justify-between mb-6'>
          <h1 className='w-3/4 sm:text-3xl text-2xl font-bold'>Modifier un animal</h1>
          <button onClick={onClose} className="w-1/4 flex justify-end text-red-500 hover:text-red-700">
            <MdClose size={36} />
          </button>
        </div>
        <form onSubmit={handleUpdateAnimal} className="text-secondary">
          <div className="mb-4">
            <label className="block">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block">Espèce</label>
            <select
              value={formData.specieId}
              onChange={(e) => setFormData({ ...formData, specieId: e.target.value })}
              className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
              required
            >
              <option value="">Selectionnez une espèce</option>
              {species.map(specie => (
                <option key={specie.id} value={specie.id}>{specie.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block">Habitat</label>
            <select
              value={formData.habitatId}
              onChange={(e) => setFormData({ ...formData, habitatId: e.target.value })}
              className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
              required
            >
              <option value="">Selectionnez un habitat</option>
              {habitats.map(habitat => (
                <option key={habitat.id} value={habitat.id}>{habitat.name}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-muted hover:bg-background text-white py-2 px-4 rounded"
          >
            Mettre à Jour
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormUpdate;