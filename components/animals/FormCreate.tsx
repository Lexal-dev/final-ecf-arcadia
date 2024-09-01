import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { toast } from 'react-toastify';

interface FormCreateProps {
    onCreateSuccess: () => Promise<void>;
    onClose: () => void;
}

interface Specie {
    id: number;
    name: string;
}

interface Habitat {
    id: number;
    name: string;
}

const FormCreate: React.FC<FormCreateProps> = ({ onCreateSuccess, onClose }) => {
    const [name, setName] = useState('');
    const [specieName, setSpecieName] = useState('');
    const [habitatName, setHabitatName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
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

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch('/api/animals/create', {
                method: 'POST',
                headers:{ 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ name, specieName, habitatName }),
            });

            const data = await response.json();
            if (data.success) {
                await onCreateSuccess();
                setName('');
                setSpecieName('');
                setHabitatName('');
                toast.success('Animal bien enregistré.');
            } else {
                setError(data.message || "Erreur lors de la création de l'animal");
                console.error("Error creating animal:", data.message);
            }
        } catch (error) {
            console.error("Erreur lors de la création de l'animal:", error);
            toast.error("Erreur lors de la création de l'animal.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
    
        return () => {
          document.body.style.overflow = 'auto';
        };
      }, []);
      
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="bg-foreground p-6 rounded shadow-md w-full md:w-1/2 text-secondary">
                <div className='flex w-full justify-between mb-6'>
                    <h1 className='w-3/4 text-2xl sm:text-3xl font-bold'>Ajouter un Animal</h1>
                    <button onClick={onClose} className="w-1/4 flex justify-end text-red-500 hover:text-red-700"><MdClose size={36} /></button>
                </div>
                    
                <form onSubmit={handleSubmit} className="text-secondary">
                    {error && <p className="text-red-500 mb-2">{error}</p>}
                    <div className="mb-4">
                        <label className="block">Nom</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
                            required
                            minLength={3}
                            maxLength={30}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block">Espèce</label>
                        <select
                            value={specieName}
                            onChange={(e) => setSpecieName(e.target.value)}
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
                            value={habitatName}
                            onChange={(e) => setHabitatName(e.target.value)}
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
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Ajouter un Animal'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default FormCreate;