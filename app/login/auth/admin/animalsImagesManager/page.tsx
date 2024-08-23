"use client"
import { ref, listAll, getDownloadURL, deleteObject } from 'firebase/storage';
import { useState, useEffect } from 'react';
import ImageUploader from '@/components/images/uploaderImages';
import { storage } from "@/lib/db/firebaseConfig.mjs";
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import { toast } from 'react-toastify';

interface Animal {
    id: number;
    name: string;
    state: string;
    specieId: number;
    habitatId: number;
    imageUrl: string[] ; 
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
    const router = useRouter()

    
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
                } else {
                    console.error('Echec de la récupération des animaux');
                }
            } else {
                console.error('Echec de la récupération des données', data.error);
            }
        } catch (error) {
            console.error('Erreur, donnée non trouvé', error);
        }
    };

    useEffect(() => {
        setModal(false);
        router.push('/login/auth/admin/animalsImagesManager');
        fetchAnimals('animals');
        fetchListAll().finally(() => setLoading(false));
    }, [loading]);

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
        setSelectedImageUrl(null); // Reset selected image URL
        setModal(true);
    };

    const onCloseModal = () => {
        setModal(false);
        setSelectedAnimal(null);
        setCurrentTableUrl([]);
        setSelectedImageUrl(null);
        fetchAnimals('animals'); // Re-fetch habitats after modal close
    };

    const updateImage = (url: string) => {
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

            updateImageUrl(selectedAnimal.id, updateAnimal.imageUrl)
                .then((updateAnimalFromServer) => {
                    console.log("Image Url bien ajouté à l'animal");
                    fetchAnimals('animals'); 
                })
                .catch((error) => {
                    console.error("Erreur, l'image url n'a pas pu être ajouté.", error);
                });
        }
        setLoading(true);
    };

    const updateImageUrl = async (animalId: number, selectedImage: string[]) => {
        try {
            const response = await fetch(`/api/animals/updateUrl?id=${animalId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageUrl: selectedImage}), // Pass selectedImage instead of selectedAnimal
            });
    
            const data = await response.json();
            if (response.ok) {
                toast.success("L'image a bien été ajoutée");
                return data.animal;
            } else {
                throw new Error(data.message || 'Failed to update image URL');
            }
        } catch (error:any) {
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
                },
                body: JSON.stringify({ imageUrl: updatedUrls }),
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Image supprimée avec succès');

                setCurrentTableUrl(updatedUrls);
                fetchAnimals('animals'); 
                router.push('/login/auth/admin/animalsImagesManager');
                toast.success("l'image a bien été supprimé");
                setLoading(true);
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
        <main className='flex flex-col items-center py-12 min-h-[200x]'>
        <Loading loading={loading}>
            <h1 className='text-3xl mb-4 font-bold'>Gestionnaire des images : animaux</h1>
            <div className='overflow-x-auto w-full flex flex-col items-center'>
                <table className='w-full md:w-2/3'>
                    <thead className='bg-muted-foreground'>
                        <tr>
                            <th className='border border-background px-4 py-2 text-left'>Name</th>
                            <th className='border border-background px-4 py-2 text-center'>Actions</th>
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
                    <div className='fixed top-0 left-0 w-screen h-screen flex justify-center items-center bg-black bg-opacity-70 z-50 text-secondary px-1'>
                        <div className=' w-full md:w-2/3 h-2/3 bg-white rounded-lg shadow-lg p-6 overflow-y-auto'>
                            <div className='w-full flex justify-end mb-2'>
                                <button className='text-red-400 hover:text-red-500' onClick={onCloseModal}>Fermer</button>
                            </div>
                            
                            {selectedAnimal != null && (
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
                                            <img src={selectedImageUrl} className='object-cover h-[200px]' alt='Animal Image' />
                                            <button onClick={handleDeleteImage(selectedAnimal.id, selectedImageUrl)} className='w-full md:w-1/3 bg-red-500 text-white px-4 py-2 hover:bg-red-600'>
                                                Supprimer l&apos;image
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                            <ImageUploader folderName='animals' onClose={onCloseModal} onUpdate={(url: string) => updateImage(url) } />
                        </div>
                    </div>
                )}
            </div>
        </Loading>
    </main>
    );
}