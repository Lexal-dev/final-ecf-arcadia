"use client"
import { ref, listAll, getDownloadURL, deleteObject } from 'firebase/storage';
import { useState, useEffect } from 'react';
import ImageUploader from '@/components/images/uploaderImages';
import { storage } from "@/lib/db/firebaseConfig.mjs";
import { toast } from 'react-toastify';
import Loading from '@/components/Loading';
import Image from 'next/image';

interface Habitat {
    id: number;
    name: string;
    description: string;
    comment: string;
    imageUrl: string[]; 
}

interface ImageData {
    name: string;
    url: string;
}

export default function ImageHabitatManager() {
    const [loading, setLoading] = useState<boolean>(true);
    const [modal, setModal] = useState<boolean>(false);
    const [habitats, setHabitats] = useState<Habitat[]>([]);
    const [selectedHabitat, setSelectedHabitat] = useState<Habitat | null>(null);
    const [currentTableUrl, setCurrentTableUrl] = useState<string[]>([]);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [images, setImages] = useState<ImageData[]>([]);
    const token = sessionStorage.getItem('token');

    const fetchListAll = async () => {
        try {
            const res = await listAll(ref(storage, 'images/habitats'));
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

    useEffect(() => {
        onCloseModal()
    }, [loading]);

    useEffect(() => {
        if (selectedHabitat) {
            let updatedUrls: string[] = [];

            if (typeof selectedHabitat.imageUrl === 'string') {
                try {
                    updatedUrls = JSON.parse(selectedHabitat.imageUrl);
                } catch (error) {
                    console.error('Error parsing imageUrl:', error);
                    updatedUrls = [];
                }
            } else if (Array.isArray(selectedHabitat.imageUrl)) {
                updatedUrls = [...selectedHabitat.imageUrl];
            }
            setCurrentTableUrl(updatedUrls);
        }
    }, [selectedHabitat]);

    const selectHabitat = (habitat: Habitat) => {
        setSelectedHabitat({
            ...habitat,
            imageUrl: habitat.imageUrl || [],
        });
        setSelectedImageUrl(null); // Reset selected image URL
        setModal(true);
    };

    const onCloseModal = () => {
        setModal(false);
        setSelectedHabitat(null);
        setCurrentTableUrl([]);
        setSelectedImageUrl(null);
        fetchHabitats('habitats'); // Re-fetch habitats after modal close
        fetchListAll().finally(() => setLoading(false));
    };

    const updateImage = (url: string) => {
        if (selectedHabitat) {
            let updatedUrls: string[] = [];

            if (typeof selectedHabitat.imageUrl === 'string') {
                try {
                    updatedUrls = JSON.parse(selectedHabitat.imageUrl);
                } catch (error) {
                    console.error('Error parsing imageUrl:', error);
                    updatedUrls = [];
                }
            } else if (Array.isArray(selectedHabitat.imageUrl)) {
                updatedUrls = [...selectedHabitat.imageUrl];
            }

            updatedUrls.push(url);

            const updatedHabitat: Habitat = {
                ...selectedHabitat,
                imageUrl: updatedUrls,
            };

            setSelectedHabitat(updatedHabitat);

            updateImageUrl(selectedHabitat.id, updatedHabitat.imageUrl)
                .catch((error) => {
                    console.error("Erreur, l'image url n'a pas pu être ajouté.", error);
                });
        }
        setLoading(true);
    };

    const updateImageUrl = async (habitatId: number, imageUrl: string[]) => {
        try {
            const response = await fetch(`/api/habitats/updateUrl?id=${habitatId}`, {
                method: 'PUT',
                headers:  { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
           
                body: JSON.stringify({ imageUrl }),
            });

            const data = await response.json();
            if (response.ok) {
                toast.success("L'image a bien été ajoutée");
                return data.habitat;
            } else {
                throw new Error(data.message || 'Failed to update image URL');
            }
        } catch (error : any) {
            console.error('Failed to update image URL:', error);
            throw new Error(error.message || 'Failed to update image URL');
        }
    };

    const handleImageSelect = (imageUrl: string) => {
        const selectedImage = images.find(image => image.url === imageUrl);
        if (selectedImage) {
            setSelectedImageUrl(selectedImage.url);
        }
    };

    const handleDeleteImage = (habitatId: number, imageRemoveUrl: string) => async () => {
        try {
            // Delete the image from Firebase Storage
            const storageRef = ref(storage, imageRemoveUrl);
            await deleteObject(storageRef);

           // Remove the image URL from the database
            const updatedUrls = removeImageUrlFromCurrentTable(imageRemoveUrl, currentTableUrl);

            const response = await fetch(`/api/habitats/updateUrl?id=${habitatId}`, {
                method: 'PUT',
                headers:  { 'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
           
                body: JSON.stringify({ imageUrl: updatedUrls }),
            });

            const data = await response.json();
            if (response.ok) {
                // Update the state with the updated URLs
                setCurrentTableUrl(updatedUrls);
                toast.success("L'image a bien été supprimée");
                onCloseModal();
            } else {
                throw new Error(data.message || 'Failed to update image URL');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'image :', error);
        }
    };

    const removeImageUrlFromCurrentTable = (imageUrlToRemove:string, currentTableUrl:string[]) => {
        const updatedCurrentTableUrl = currentTableUrl.filter(url => url !== imageUrlToRemove);
        return updatedCurrentTableUrl;
    };

    return (
        <main className='flex flex-col items-center py-12 px-2 min-h-[200x]'>
            <Loading loading={loading}>
                <h1 className='sm:text-3xl text-2xl mb-4 font-caption font-bold'>Gestion des images : habitats</h1>
                <div className='overflow-x-auto w-full flex flex-col items-center'>
                <table className='w-full md:w-2/3'>
                    <thead className='bg-muted-foreground'>
                        <tr >
                            <th className='border border-background px-4 py-2 text-left'>Name</th>
                            <th className='border border-background px-4 py-2 text-center'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {habitats.map((habitat) => (
                            <tr key={habitat.id} className='w-full border border-background bg-foreground hover:bg-opacity-50 text-secondary hover:bg-muted hover:text-white'>
                                <td className='w-1/3 border border-background px-4 py-2 text-sm'>{habitat.name}</td>
                                <td className='w-1/3 border border-background px-4 py-2 text-sm'>
                                    <div className='flex items-center justify-center'>
                                        <button
                                            className='bg-background hover:bg-muted-foreground text-white p-2 rounded-md'
                                            onClick={() => selectHabitat(habitat)}
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
                        <div className='fixed top-0 left-0 w-screen h-screen flex justify-center items-center bg-black bg-opacity-70 z-50 text-secondary px-1'>
                            <div className='flex flex-col justify-between sm:w-2/3 w-full h-[75%] bg-white rounded-lg overflow-y-auto'>
                                <div>
                                    <div className='w-full flex justify-end mb-2 p-2'>
                                        <button className='text-red-400 hover:text-red-500' onClick={onCloseModal}>Fermer</button>
                                    </div>
                                    {selectedHabitat != null && (
                                        <div className='flex flex-col w-full items-center'>
                                            <p className='font-bold text-xl text-primary'>{selectedHabitat.name}</p>
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
                                                            layout="fill"
                                                            objectFit="cover" 
                                                            alt='Habitat Image' />
                                                    </div>
                                                    <button onClick={handleDeleteImage(selectedHabitat.id, selectedImageUrl)} className='w-[200px] bg-red-500 text-white px-4 py-2 hover:bg-red-600'>
                                                        Supprimer l&apos;image
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className='pb-4 px-4'>
                                    <ImageUploader folderName='habitats' onClose={onCloseModal} onUpdate={(url: string) => updateImage(url) } />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Loading>
        </main>
    );
}