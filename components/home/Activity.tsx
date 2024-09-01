"use client";
import { storage } from '@/lib/db/firebaseConfig.mjs';
import { getDownloadURL, listAll, ref } from 'firebase/storage';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { ImageData } from '@/lib/types/types';
import useIsMobile from '@/components/hook/useIsMobile';  // Importer le hook

export default function Activity() {
  const [imagesHabitats, setImagesHabitats] = useState<ImageData[]>([]);
  const [imagesAnimals, setImagesAnimals] = useState<ImageData[]>([]);
  const [shuffleTab, setShuffleTab] = useState<ImageData[]>([]);

  const isMobile = useIsMobile(); 

  const fetchListAll = async () => {
    try {
      const res = await listAll(ref(storage, `images/habitats`));
      const imageInfos = await Promise.all(
        res.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            url
          };
        })
      );
      setImagesHabitats(imageInfos);
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers :', error);
    }
    try {
      const res = await listAll(ref(storage, `images/animals`));
      const imageInfos = await Promise.all(
        res.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            url
          };
        })
      );
      setImagesAnimals(imageInfos);
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers :', error);
    }
  };

  const shuffleImage = (...arrays: ImageData[][]) => {
    let combinedArray: ImageData[] = [];
    arrays.forEach(array => {
      combinedArray = [...combinedArray, ...array];
    });
    return combinedArray;
  };

  useEffect(() => {
    if (imagesAnimals.length !== 0 && imagesHabitats.length !== 0) {
      const combinedArray = shuffleImage(imagesAnimals, imagesHabitats);
      setShuffleTab(combinedArray);
    }
  }, [imagesAnimals, imagesHabitats]);

  useEffect(() => {
    fetchListAll();
  }, []);

  const getUrlAtIndex = (index: number): string | undefined => {
    if (index >= 0 && index < shuffleTab.length) {
      return shuffleTab[index].url;
    }
    return undefined;
  };

  // Table of image URLs for services
  const serviceImages = [
    '/images/Restaurant.png',
    '/images/Souvenir.png',
    '/images/Train.png',
    '/images/Stand.png'
  ];

  return (
    <section className='w-full flex flex-col gap-6 w-full md:w-2/3 lg:w-3/4 text-start px-2'>
      <h3 className="text-4xl font-caption text-center mb-6">Les différentes activités du parc</h3>
      <p className="text-start text-lg md:text-xl mb-6">
        Arcadia vous propose une multitude d&apos;activités allant du visionnage des habitats au animaux qui y vivent.
        Aussi vous aurez accès à plusieurs services comprenant un train qui fait le tour du parc, un guide audio et bien d&apos;autres services.
      </p>

      {/* Section Habitats & Animaux */}
      <div className='w-full flex flex-col items-center mb-12'>
        <div className='flex flex-col mb-6'>
          <p className='text-lg md:text-xl mb-6'>Pour accéder à nos habitats et animaux</p> 
          <Link href="/habitats" className='text-center text-blue-300 hover:text-blue-400 hover:text-bold'>Clickez ici</Link>
        </div>

        <div className="w-full flex">
          <div className="flex flex-wrap gap-1 w-full justify-center">
            {isMobile ? (
              // show unique image
              <div className="flex-shrink-0 w-full">
                <div className="relative w-full h-0 pb-[60%] border border-2 border-green-300">
                  <Image
                    src={getUrlAtIndex(0) || '/images/Pasdimage.jpg'}
                    fill
                    style={{ objectFit: 'cover' }}
                    alt={`habitats&animaux 0`}
                  />
                </div>
              </div>
            ) : (
              // show 4 images
              [0, 1, 2, 3].map((index) => (
                <div key={index} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3">
                  <div className="relative w-full h-0 pb-[60%] border border-2 border-green-300">
                    <Image
                      src={getUrlAtIndex(index) || '/images/Pasdimage.jpg'}
                      fill
                      style={{ objectFit: 'cover' }}
                      alt={`habitats&animaux ${index}`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Section Services */}
      <div className='w-full flex flex-col items-center'>
        <div className='flex flex-col mb-6'>
          <p className='text-lg md:text-xl mb-6'>Pour accéder à nos services</p>
          <Link href="/services" className='text-center text-blue-300 hover:text-blue-400 hover:text-bold'>Clickez ici</Link>  
        </div>

        <div className="w-full flex">
          <div className="flex flex-wrap gap-1 w-full justify-center">
            {isMobile ? (
              // show unique image for mobile
              <div className="flex-shrink-0 w-full">
                <div className="relative w-full h-0 pb-[60%] border border-2 border-green-300">
                  <Image
                    src={serviceImages[0]}  // Use the first image
                    fill
                    style={{ objectFit: 'cover' }}
                    alt={`services 0`}
                  />
                </div>
              </div>
            ) : (
              // show 4 images for larger screens
              serviceImages.map((src, index) => (
                <div key={index} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3">
                  <div className="relative w-full h-0 pb-[60%] border border-2 border-green-300">
                    <Image
                      src={src}
                      fill
                      style={{ objectFit: 'cover' }}
                      alt={`services ${index}`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}