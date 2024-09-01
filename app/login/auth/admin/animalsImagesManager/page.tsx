"use client";
import { ref, listAll, getDownloadURL, deleteObject } from 'firebase/storage';
import { useState, useEffect, useCallback } from 'react';
import ImageUploader from '@/components/images/uploaderImages';
import { storage } from "@/lib/db/firebaseConfig.mjs";
import { toast } from 'react-toastify';
import Loading from '@/components/Loading';
import Image from 'next/image';

interface Animal {
    id: number;
    name: string;
    state: string;
    specieId: number;
    habitatId: number;
    imageUrl: string[]; 
}

interface ImageData {
    name: string;
    url: string;
}

export default function ImageAnimalsManager() {
    const [loading, setLoading] = useState<boolean>(true);
    const [modal, setModal] = useState<boolean>(false);
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
    const [currentTableUrl, setCurrentTableUrl] = useState<string[]>([]);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [images, setImages] = useState<ImageData[]>([]);
    const token = sessionStorage.getItem('token');
    
    const fetchListAll = async () => {
        try {
            const res = await listAll(ref(storage, 'images/animals'));
            const imageInfos = await Promise.all(
                res.items.map(async (itemRef) => {
                    const url = await getDownloadURL(itemRef);
                    return {
                        name: itemRef.name,
                        url
                    };
                })
            );
            setImages(imageInfos);
        } catch (error) {
            console.error('Erreur lors de la récupération des fichiers :', error);
        }
    };

    const fetchAnimals = async (additionalParam: string) => {
        try {
            const response = await fetch(`/api/animals/read?additionalParam=${encodeURIComponent(additionalParam.toString())}`);
            const data = await response.json();

            if (response.ok) {
                if (data.animals) {
                    setAnimals(data.animals);
                    sessionStorage.setItem('animals', JSON.stringify(data.animals))
                } else {
                    console.error('Echec de la récupération des animaux');
                }
            } else {
                console.error('Echec de la récupération des données', data.error);
            }
        } catch (error) {
            console.error('Erreur, donnée non trouvée', error);
        }
    };

    const init = useCallback(async () => {
        await fetchListAll();
        await fetchAnimals('animals');
        setLoading(false);
    }, []); // Ajoutez les dépendances si `fetchListAll` ou `fetchAnimals` changent
    
    useEffect(() => {
        init();
    }, [init]);

    useEffect(() => {
        if (selectedAnimal) {
            let updatedUrls: string[] = [];

            if (typeof selectedAnimal.imageUrl === 'string') {
                try {
                    updatedUrls = JSON.parse(selectedAnimal.imageUrl);
                } catch (error) {
                    console.error('Error parsing imageUrl:', error);
                    updatedUrls = [];
                }
            } else if (Array.isArray(selectedAnimal.imageUrl)) {
                updatedUrls = [...selectedAnimal.imageUrl];
            }
            setCurrentTableUrl(updatedUrls);
        }
    }, [selectedAnimal]);

    const selectAnimal = (animal: Animal) => {

        setSelectedAnimal({
            ...animal,
            imageUrl: animal.imageUrl || [],
        });
        setModal(true);
    };

    const onCloseManualModal = async () => {
        setModal(false)
    }

    const onCloseModal = async () => {
        setModal(false);
        setLoading(true);
        
        await fetchListAll();
        await fetchAnimals('animals');
        

        setSelectedAnimal(null);
        setCurrentTableUrl([]);
        setSelectedImageUrl(null);
        setLoading(false);
    };

    const updateImage = async (url: string) => {
        if (selectedAnimal) {
            let updatedUrls: string[] = [];
        
            if (typeof selectedAnimal.imageUrl === 'string') {
                try {
                    updatedUrls = JSON.parse(selectedAnimal.imageUrl);
                } catch (error) {
                    console.error('Error parsing imageUrl:', error);
                    updatedUrls = [];
                }
            } else if (Array.isArray(selectedAnimal.imageUrl)) {
                updatedUrls = [...selectedAnimal.imageUrl];
            }
        
            updatedUrls.push(url);
        
            const updateAnimal: Animal = {
                ...selectedAnimal,
                imageUrl: updatedUrls,
            };
        
            setSelectedAnimal(updateAnimal);
            setCurrentTableUrl(updatedUrls);
        

            try {
                await updateImageUrl(selectedAnimal.id, updatedUrls);
                toast.success("L'image a bien été ajoutée");
    
         
                await fetchListAll();
            } catch (error) {
                console.error("Erreur, l'image URL n'a pas pu être ajoutée.", error);
            }
        }
    };
    
    const updateImageUrl = async (animalId: number, selectedImage: string[]) => {
        const response = await fetch(`/api/animals/updateUrl?id=${animalId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ imageUrl: selectedImage }),
        });
    
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update image URL');
        }
        return data.animal;
    };

    const handleImageSelect = (imageUrl: string) => {
        const selectedImage = images.find(image => image.url === imageUrl);
        if (selectedImage) {
            setSelectedImageUrl(selectedImage.url);
        }
    };

    const handleDeleteImage = (animalId: number, imageRemoveUrl: string) => async () => {
        try {
            const storageRef = ref(storage, imageRemoveUrl);
            await deleteObject(storageRef);

            // Deleting image URL from the database
            const updatedUrls = removeImageUrlFromCurrentTable(imageRemoveUrl, currentTableUrl);
            const response = await fetch(`/api/animals/updateUrl?id=${animalId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,   
                },
                body: JSON.stringify({ imageUrl: updatedUrls }),
            });

            const data = await response.json();
            if (response.ok) {
                setLoading(true)
                setCurrentTableUrl(updatedUrls); 
                toast.success("L'image a bien été supprimée");
                onCloseModal();
            } else {
                throw new Error(data.message || 'Failed to update image URL');
            }
        } catch (error) {
            console.error('Failed to delete image :', error);
        }
    };

    const removeImageUrlFromCurrentTable = (imageUrlToRemove: string, currentTableUrl: string[]) => {
        return currentTableUrl.filter(url => url !== imageUrlToRemove);
    };

    return (
        <main className='flex flex-col items-center py-12 min-h-[200px]'>
            <Loading loading={loading}>
                <h1 className='sm:text-3xl text-2xl mb-4 font-caption font-bold'>Gestion des images : animaux</h1>
                <div className='overflow-x-auto w-full flex flex-col items-center'>
                    <table className='w-full md:w-2/3'>
                        <thead className='bg-muted-foreground'>
                            <tr>
                                <th className='border border-background px-4 py-2 text-left'>Name</th>
                                <th className='border border-background px-4 py-2 text-center'>URL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {animals.map((animal) => (
                                <tr key={animal.id} className='w-full border border-background bg-foreground hover:bg-opacity-50 text-secondary hover:bg-muted hover:text-white'>
                                    <td className='w-1/3 border border-background px-4 py-2 text-sm'>{animal.name}</td>
                                    <td className='w-1/3 border border-background px-4 py-2 text-sm'>
                                        <div className='flex items-center justify-center'>
                                            <button
                                                className='bg-background hover:bg-muted-foreground text-white p-2 rounded-md'
                                                onClick={() => selectAnimal(animal)}
                                            >
                                                Images
                                            </button>                                        
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {modal && (
                        <div className='fixed top-0 left-0 w-screen h-screen flex justify-center items-center bg-black bg-opacity-70 z-50 text-secondary'>
                            <div className='flex flex-col justify-between sm:w-2/3 w-full h-[75%] bg-white rounded-lg overflow-y-auto'>
                                <div>
                                    <div className='w-full flex justify-end mb-2 p-2'>
                                        <button className='text-red-400 hover:text-red-500' onClick={onCloseManualModal}>Fermer</button>
                                    </div>
                                    {selectedAnimal && (
                                    <div className='flex flex-col w-full items-center'>
                                        <p className='font-bold text-xl text-primary'>{selectedAnimal.name}</p>
                                        <select
                                            value={selectedImageUrl || ''}
                                            onChange={(e) => handleImageSelect(e.target.value)}
                                            className='my-4 border border-gray-300 rounded p-2'
                                        >
                                            <option value="">Sélectionner une image</option>
                                            {currentTableUrl.map((url, index) => {
                                                const matchedImage = images.find(image => image.url === url);
                                                if (matchedImage) {
                                                    return <option key={index} value={url}>{matchedImage.name}</option>;
                                                } else {
                                                    return null;
                                                }
                                            })}
                                        </select>
                                        {selectedImageUrl && (
                                            <div className='w-2/3 flex flex-col items-center justify-center mb-12'>
                                                <div className='relative w-full h-48'>
                                                    <Image
                                                        src={selectedImageUrl}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                        alt='Animal Image'
                                                    />
                                                </div>
                                                <button onClick={handleDeleteImage(selectedAnimal.id, selectedImageUrl)} className='w-[200px] bg-red-500 text-white px-4 py-2 hover:bg-red-600'>
                                                    Supprimer l&apos;image
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    )}
                                </div>

                                <div className='pb-4 px-4'>
                                    <ImageUploader folderName='animals' onClose={onCloseModal} onUpdate={(url: string) => updateImage(url)} />  
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Loading>
        </main>
    );
}