"use client";
import React, { useEffect, useState } from 'react';
import Hours from '@/models/hour';
import { usePathname } from 'next/navigation';

export default function Footer() {
    const [hours, setHours] = useState<Hours[]>([]);
    const pathname = usePathname();

    const fetchHours = async (additionalParam: string | number) => {
        try {
            const cachedHours = sessionStorage.getItem('hours');
            const cachedTimestamp = sessionStorage.getItem('hoursTimestamp');

            const currentTimestamp = Date.now();
            const isCacheValid = cachedTimestamp && (currentTimestamp - Number(cachedTimestamp) < 3600000); // Cache valid for 1 hour (3600000 ms)

            if (cachedHours && isCacheValid) {
                setHours(JSON.parse(cachedHours));
            } else {
                const response = await fetch(`/api/hours/read?additionalParam=${encodeURIComponent(additionalParam.toString())}`, {
                    method: 'GET',
                });     
                const data = await response.json();
                if (data.success) {
                    setHours(data.hours);
                    sessionStorage.setItem('hours', JSON.stringify(data.hours));
                    sessionStorage.setItem('hoursTimestamp', currentTimestamp.toString());
                } else {
                    console.error('Failed to fetch hours:', data.message);
                }
            }
        } catch (error) {
            console.error('Error fetching hours:', error);
        }
    };

    useEffect(() => {
        fetchHours('hours');
    }, [pathname]);

    return (
        <footer className="flex flex-col items-center gap-3 p-3 w-full bg-gray-800 text-white bottom-0 min-h-[400px]">
            <h6 className='text-3xl font-bold font-caption'>Horraires</h6>
            <div className="flex justify-center overflow-x-auto w-full">
                
                <table className="w-full lg:w-2/3 border-gray-200 shadow-md">
                    <thead>
                        <tr className="border bg-gray-900">
                            <th className="py-2 px-4 border-r">Jours</th>
                            <th className="py-2 px-4 border-r">Ouverture</th>
                            <th className="py-2 px-4">Fermeture</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hours.map(hour => (
                            <tr key={hour.id} className="border-b bg-gray-700 hover:bg-gray-800 text-center border-x">
                                <td className="py-2 px-4 border-r text-start">{hour.days}</td>
                                <td className="py-2 px-4 border-r">{hour.open}</td>
                                <td className="py-2 px-4">{hour.close}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="w-full text-center border-t pt-3">Copyright © 2024. ARCADIA Tous droits réservés</div>
        </footer>
    );
}