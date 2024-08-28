"use client"
import Loading from '@/components/Loading'
import FormCreate from '@/components/species/FormCreate'
import FormUpdate from '@/components/species/FormUpdate'
import Specie from '@/models/specie'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { MdDelete, MdEdit } from 'react-icons/md'
import { toast } from 'react-toastify'

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
    };

    const handleUpdateModalOpen = (specie: Specie) => {
        setModalUpdate(true);
        setSelectedSpecie(specie)
        
    };

    const handleDelete  = async (specie : Specie) => {
        const specieId = Number(specie.id);

        const response = await fetch(`/api/species/delete?id=${specieId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            toast.success("Espèce effacée avec succès"); 
            setLoading(true);
            router.push('/login/auth/admin/speciesManager');
        } else {
            const data = await response.json();
            if (data.error && data.error.includes('foreign key constraint')) {
                toast.error("Erreur : Habitat lié à un animal"); 
            } else {
                toast.error("Erreur lors de la suppression de l'espèce"); 
            }
        }
    };

    const onCreateSuccess = async () => {
        fetchSpecies('species')
        onClose();
        setLoading(true);
        toast.success("Espèce créée avec succès");
    };

    const onUpdateSuccess = async () => {
        console.log('Espèce modifiée');
        setLoading(true);
        onClose();
        toast.success("Espèce modifiée avec succès"); 
    };

    const onClose = () => {
        setModalCreate(false)
        setSelectedSpecie(null)
    };
    
    useEffect(() => {fetchSpecies('species'), setLoading(false)}, [loading])

  return (
    <main className='flex flex-col items-center py-12 min-h-[200x] px-2'>
        <Loading loading={loading}>
            <h1 className='sm:text-3xl text-2xl mb-4 font-bold'>Gestionnaire des espèces</h1>
            <button onClick={()=> {setModalCreate(true)}} className='bg-foreground hover:bg-muted-foreground hover:text-white text-secondary py-1 px-3 rounded-md mb-6'>Ajouter une espèce</button>
            {species.length > 0 ? (
            <div className='overflow-x-auto w-full flex flex-col items-center'>
                <table className="w-full md:w-2/3 w-full">
                    <thead className='bg-muted-foreground'>
                        <tr>
                            <th className="border border-background px-4 py-2 text-left">Name</th>
                            <th className="border border-background px-4 py-2 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {species.map((specie) => (
                            <tr key={specie.id} className="w-full border border-background bg-foreground hover:bg-opacity-50 text-secondary hover:bg-muted hover:text-white">
                                <td className="w-1/3 border border-background px-4 py-2 text-sm">{specie.name}</td>
                                <td className='w-1/3 border border-background px-4 py-2'>
                                    <div className='flex items-center justify-center md:gap-5'>
                                        <button onClick={() => {handleDelete(specie)}} className='text-red-500 hover:text-red-600'><MdDelete size={28} /></button>
                                        <button onClick={()=> {handleUpdateModalOpen(specie)}} className='text-yellow-500 hover:text-yellow-600'><MdEdit size={28}/></button>
                                    </div>
                                   
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
    ) : (
        <p className='w-full flex justify-center items-center text-center text-xl'>Pas d&apos;espèces trouvées...</p>
    )}
        {modalCreate &&  <FormCreate onCreateSuccess={onCreateSuccess} onClose={onClose} />}
        {modalUpdate && selectedSpecie &&  <FormUpdate specie={selectedSpecie} onUpdateSuccess={onUpdateSuccess} onClose={onClose} />}
    </Loading>
    </main>
  )
}