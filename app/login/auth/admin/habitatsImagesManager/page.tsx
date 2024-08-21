"use client"
import { ref, listAll, getDownloadURL, deleteObject } from 'firebase/storage';
import { useState, useEffect } from 'react';
import ImageUploader from '@/components/images/uploaderImages';
import { storage } from "@/lib/db/firebaseConfig.mjs";
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';

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
    const router = useRouter()

    
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
        setModal(false)
        router.push('/login/auth/admin/habitatsImagesManager')
        fetchHabitats('habitats');
        fetchListAll().finally(() => setLoading(false));
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
                .then((updatedHabitatFromServer) => {
                    console.log("Image Url bien ajouté à l'habitat");
                    fetchHabitats('habitats'); // Re-fetch habitats after update
                })
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageUrl }),
            });

            const data = await response.json();
            if (response.ok) {
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageUrl: updatedUrls }),
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Image supprimée avec succès');

                // Update the state with the updated URLs
                setCurrentTableUrl(updatedUrls);
                fetchHabitats('habitats'); // Re-fetch habitats after delete
                router.push('/login/auth/admin/habitatsImagesManager')
                setLoading(true)
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
        <main className='w-full py-12 px-1'>
            <Loading loading={loading}>
                <div className='overflow-x-auto w-full flex flex-col items-center'>
                <table className='w-full md:w-2/3 text-secondary'>
                    <thead>
                        <tr className='bg-muted-foreground text-white'>
                            <th className='px-4 py-2'>Name</th>
                            <th className='px-4 py-2'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {habitats.map((habitat) => (
                            <tr key={habitat.id} className='bg-foreground hover:bg-muted text-secondary'>
                                <td className='border-b px-2 py-2'>{habitat.name}</td>
                                <td className='border-b px-2 py-2'>
                                <div className='flex items-center justify-center'>
                                        <button
                                            className='bg-muted hover:bg-muted-foreground hover:text-white p-2 rounded-md'
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
                            <div className=' w-full md:w-2/3 h-2/3 bg-white rounded-lg shadow-lg p-6 overflow-x-auto'>
                            <div className='w-full flex justify-end mb-2'>
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
                                                <img src={selectedImageUrl} className='object-cover h-[200px]' alt='Habitat Image' />
                                                <button onClick={handleDeleteImage(selectedHabitat.id, selectedImageUrl)} className='w-full bg-red-500 text-white px-4 py-2 hover:bg-red-600'>
                                                    Supprimer l'image
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <ImageUploader folderName='habitats' onClose={onCloseModal} onUpdate={(url: string) => updateImage(url) } />
                            </div>
                        </div>
                    )}
                </div>
            </Loading>
        </main>
    );
}