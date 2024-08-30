"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { Animal } from "@/lib/types/types";

type PresentationProps = {
  animals: Animal[];
  error: string;
  loadingImage: boolean;
};

export default function Presentation({ animals, error, loadingImage }: PresentationProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    let urls: string[] = [];

    animals.forEach((animal) => {
      if (animal.imageUrl) {
        try {
          const parsedUrls = JSON.parse(animal.imageUrl);
          urls = urls.concat(parsedUrls.filter((url: string) => url)); // Filter out empty values
        } catch (error) {
          console.error(`Error parsing imageUrl for animal ID ${animal.id}:`, error);
        }
      }
    });

    const fallbackImages = [
      '/images/Crocodile.png',
      '/images/Lion.png',
      '/images/Renard-roux.png',
      '/images/Tigre.png',
    ];

    urls = shuffleArray(urls);
    setImageUrls(urls.length > 0 ? urls : fallbackImages);
  }, [animals]);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1));
    setDirection('right');
  }, [imageUrls.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 20000);

    return () => clearInterval(interval);
  }, [nextSlide]);

  const prevSlide = () => {
    setCurrentIndex(prevIndex => (prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1));
    setDirection('left');
  };

  const shuffleArray = (array: string[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

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
              src={imageUrls[currentIndex] || '/images/Pasdimage.jpg'}
              fill
              alt={`Image ${currentIndex}`}
              className="object-center object-cover"
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