"use client"
import React, { useEffect, useState } from 'react';
import Hours from '@/models/hour';

export default function Footer() {
    const [hours, setHours] = useState<Hours[]>([]);

    const fetchHours = async (additionalParam: string | number) => {
        try {
            const response = await fetch(`/api/hours/read?additionalParam=${encodeURIComponent(additionalParam.toString())}`, {
                method: 'GET',
            });

            const data = await response.json();
            if (data.success) {
                setHours(data.hours);
            } else {
                console.error('Failed to fetch hours:', data.message);
            }
        } catch (error) {
            console.error('Error fetching hours:', error);
        }
    };

    useEffect(() => {
        fetchHours('hours');
    }, []);

    return (
        <footer className="flex flex-col items-center gap-3 p-3 w-full bg-gray-800 text-white bottom-0 min-h-[400px]">
            <div className="overflow-x-auto w-full">
                <table className="min-w-full bwhiteg- border-gray-200 shadow-md roundeds">
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
                                <td className="py-2 px-4 border-r">{hour.days}</td>
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