"use client"
import FormCreate from '@/components/species/FormCreate'
import FormUpdate from '@/components/species/FormUpdate'
import Specie from '@/models/specie'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { MdDelete, MdEdit } from 'react-icons/md'
import { toast } from 'react-toastify'  // Import du toast

export default function SpeciesManager() {
    const [loading, setLoading] = useState<boolean>(true)
    const [species, setSpecies] = useState<Specie[]>([])
    const [selectedSpecie, setSelectedSpecie] = useState<Specie | null>(null)
    const [modalCreate, setModalCreate] = useState<boolean>(false)
    const [modalUpdate, setModalUpdate] = useState<boolean>(false)
    const router = useRouter()

    const fetchSpecies = async (additionalParam: string) => {
        try {
            const response = await fetch(`/api/species/read?additionalParam=${encodeURIComponent(additionalParam.toString())}`,{method:'GET'} );

            const data = await response.json();
    
            if (response.ok) {
                if (data.species) {
                    setSpecies(data.species);
                } else {
                    console.error('Echec de la récupération des données des éspèce');
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
    }

    useEffect(() => {fetchSpecies('species'), setLoading(false)}, [loading])


    const handleDelete  = async (specie : Specie) => {
        const specieId = Number(specie.id);

        const response = await fetch(`/api/species/delete?id=${specieId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            toast.success("Espèce effacée avec succès");  // Toast en cas de succès
            setLoading(true);
            router.push('/login/auth/admin/speciesManager');
        } else {
            const data = await response.json();
            if (data.error && data.error.includes('foreign key constraint')) {
                toast.error("Erreur : Habitat lié à un animal");  // Toast pour erreur de clé étrangère
            } else {
                toast.error("Erreur lors de la suppression de l'espèce");  // Toast pour autre type d'erreur
            }
        }
    };

    const handleUpdateModalOpen = (specie: Specie) => {
        setModalUpdate(true);
        setSelectedSpecie(specie)
        
    }

    const onCreateSuccess = async () => {
        fetchSpecies('species')
        onClose();
        setLoading(true);
        toast.success("Espèce créée avec succès");  // Toast en cas de succès de la création
    };

    const onUpdateSuccess = async () => {
        console.log('Espèce modifiée');
        setLoading(true);
        onClose();
        toast.success("Espèce modifiée avec succès");  // Toast en cas de succès de la modification
    };

    const onClose = () => {
        setModalCreate(false)
        setSelectedSpecie(null)
    };

  return (
    <main>
        
        {loading ? (<div className='w-full flex justify-center items-center text-center text-xl'>Loading...</div>) : (
        <div className='text-center'>
            <h1 className='text-4xl text-center mb-12 font-bold'>Gestionnaire des espèces</h1>
            <button onClick={()=> {setModalCreate(true)}} className='bg-foreground hover:bg-muted rounded p-2 text-secondary mb-1'>Ajouter une espèce</button>
            {species.length > 0 ? (
            <table className="table-auto border-collapse w-full">
                <thead>
                    <tr className="bg-muted-foreground text-white uppercase text-sm">
                        <th className="py-3 px-6">ID</th>
                        <th className="py-3 px-6">Name</th>
                        <th className="py-3 px-6">Action</th>
                    </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                    {species.map((specie) => (
                        <tr key={specie.id} className="bg-muted border-b border-gray-200 hover:bg-background text-center text-white">
                            <td className="py-3 px-6">{specie.id}</td>
                            <td className="py-3 px-6">{specie.name}</td>
                            <td>
                                <button onClick={() => {handleDelete(specie)}} className='text-lg bg-red-500 hover:bg-red-600 p-2 rounded-md'><MdDelete /></button>
                                <button onClick={()=> {handleUpdateModalOpen(specie)}} className='text-lg bg-yellow-500 hover:bg-yellow-600 rounded p-2 '><MdEdit/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
    ) : (
        <p className='w-full flex justify-center items-center text-center text-xl'>No species available</p>
    )}
        </div>
        )}
        {modalCreate &&  <FormCreate onCreateSuccess={onCreateSuccess} onClose={onClose} />}
        {modalUpdate && selectedSpecie &&  <FormUpdate specie={selectedSpecie} onUpdateSuccess={onUpdateSuccess} onClose={onClose} />}
    </main>
  )
}