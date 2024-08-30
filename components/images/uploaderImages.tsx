import React, { useState, useEffect } from 'react';
import { storage } from '@/lib/db/firebaseConfig.mjs';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';

interface ImageUploaderProps {
    folderName: string;
    onClose: () => void;
    onUpdate: (imageUrl: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ folderName, onClose, onUpdate }) => {
    const [uploading, setUploading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [images, setImages] = useState<ImageData[]>([]);

    interface ImageData {
        name: string;
        url: string;
    }

    useEffect(() => {
        const listRef = async () => {
            try {
                const res = await listAll(ref(storage, `images/${folderName}`));
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

        listRef();
    }, [folderName]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const currentFile = e.target.files?.[0];
        if (currentFile) {
            setFile(currentFile);
            setError(null);
        }
    };

    const checkFileExists = (fileName: string): boolean => {
        return images.some(image => image.name === fileName);
    };

    const uploadImage = async (imageFile: File) => {
        const fileName = imageFile.name;
        const fileExists = checkFileExists(fileName);

        if (fileExists) {
            setError('File with this name already exists.');
            return null;
        }

        const storageRef = ref(storage);
        const fileRef = ref(storageRef, `images/${folderName}/${imageFile.name}`);

        try {
            setUploading(true);

            // Upload the image
            const snapshot = await uploadBytes(fileRef, imageFile);

            // Get the download URL from the snapshot
            const url = await getDownloadURL(snapshot.ref);
            return url;
        } catch (error) {
            console.error('Error uploading image:', error);
            setError('Failed to upload image');
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleUpload = async () => {
        if (file) {
            try {
                setUploading(true);
                const url = await uploadImage(file);

                if (url) {
                    onUpdate(url);
                    // Reset local state
                    setFile(null);
                    setError(null);
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                setError('Failed to upload image');
            } finally {
                setUploading(false);
                onClose();
            }
        } else {
            setError('Please select an image file.');
        }
    };

    return (
        <div className="flex flex-col w-full gap-6">
            <input type="file" onChange={handleFileChange} />
            {error && <p className="text-red-500">{error}</p>}
            <div className='flex justify-center mt-auto'>
                <button
                    className="mt-2 bg-muted hover:bg-background text-white font-bold py-2 px-4 rounded"
                    onClick={handleUpload}
                    disabled={uploading}
                >
                    {uploading ? 'Uploading...' : "Envoyer l'image"}
                </button>
            </div>
        </div>
    );
};

export default ImageUploader;