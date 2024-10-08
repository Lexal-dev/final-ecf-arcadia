"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { decodeToken } from '@/lib/security/decode';
import { FaSpinner } from 'react-icons/fa';

export default function AuthCheck() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkToken = async () => {
            const storedToken = sessionStorage.getItem('token');
            if (storedToken) {
                const decoded = decodeToken(storedToken);
                if (decoded) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    router.push(`/login/auth/${decoded.userRole.toLowerCase()}`);
                } else {
                    console.error('Token invalide');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    sessionStorage.removeItem('token');
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        checkToken();
    }, [router]);

    if (loading) {
        return (
            <div className='w-full flex justify-center items-center text-center min-h-[500px]'>
                <p className='text-xl font-bold font-caption'>Chargement des données</p>
                <div className='px-6'/>
                <FaSpinner className='animate-spin mr-2' size={36}/>
            </div>
        );
    }

    return null;
}