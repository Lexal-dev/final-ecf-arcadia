"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { Animal } from "@/lib/types/types";

import { storage } from '@/lib/db/firebaseConfig.mjs'; // Import Firebase config
import { getDownloadURL, listAll, ref } from 'firebase/storage';

export default function Presentation() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [error, setError] = useState<string>('');
  const [loadingImage, setLoadingImage] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnimalsAndImages = async () => {
      setLoadingImage(true);
      try {
        const cachedAnimals = sessionStorage.getItem('animals');
        if (cachedAnimals) {
          setAnimals(JSON.parse(cachedAnimals));
        } else {
          const response = await fetch('/api/animals/read?additionalParam=animals');
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          setAnimals(data.animals);
          sessionStorage.setItem('animals', JSON.stringify(data.animals));
        }

        const imagesRef = ref(storage, 'images/animals'); // Assurez-vous que le chemin est correct
        const imageList = await listAll(imagesRef);

        if (imageList.items.length === 0) {
          throw new Error('Aucune image trouvée dans Firebase Storage.');
        }

        const urls = await Promise.all(
          imageList.items.map(item => getDownloadURL(item))
        );

        setImageUrls(urls);

      } catch (error) {
        console.error('Error fetching animals or images:', error);
        setError('Échec de la récupération des animaux ou des images. Veuillez réessayer plus tard.');
      } finally {
        setLoadingImage(false);
      }
    };

    fetchAnimalsAndImages();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1));
    setDirection('right');
  }, [imageUrls]);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 20000); // Change slide every 20 seconds

    return () => clearInterval(interval);
  }, [nextSlide]);

  const prevSlide = () => {
    setCurrentIndex(prevIndex => (prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1));
    setDirection('left');
  };

  const currentImageUrl = imageUrls[currentIndex] || '/images/Pasdimage.jpg';

  return (
    <section className="w-full flex flex-col gap-6 w-full md:w-2/3 lg:w-3/4 text-start px-2">
      <h1 className="text-4xl font-caption text-center mb-6">Présentation du zoo</h1>
      <p className="text-start text-md md:text-xl">
        Bienvenue au Zoo Arcadia, un lieu de merveilles et de découvertes. Notre zoo offre une expérience unique avec une
        variété d&apos;animaux, de beaux paysages et des programmes éducatifs.
      </p>

      {loadingImage ? (
        <p className="text-center">Chargement des images...</p>
      ) : (
        <div className="flex flex-col gap-6">
          <motion.div
            key={currentIndex}
            className="relative overflow-hidden border-2 bg-black"
            style={{ paddingBottom: '50%' }}
          >
            <motion.div
              className="absolute inset-0 flex justify-center items-center"
              initial={{ opacity: 0, x: direction === 'left' ? '-100%' : '100%' }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, type: 'tween' }}
            >
              <Image
                src={currentImageUrl}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                alt={`Image ${currentIndex}`}
                className="object-center object-cover"
                priority // Add the priority attribute here
              />
            </motion.div>
          </motion.div>

          <div className="w-full flex justify-between mt-4">
            <motion.button
              onClick={prevSlide}
              className="text-white text-4xl font-bold px-4 rounded hover:text-green-400"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <FaAngleLeft />
            </motion.button>
            <motion.button
              onClick={nextSlide}
              className="text-white text-4xl font-bold px-4 rounded hover:text-green-400"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <FaAngleRight />
            </motion.button>
          </div>
        </div>
      )}

      {error && <p>Erreur : {error}</p>}
      {animals.length === 0 && !loadingImage && !error && <p className='w-full text-center'>Aucun animal trouvé.</p>}
    </section>
  );
}