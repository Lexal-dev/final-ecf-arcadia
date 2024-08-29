"use client"
import React, { useEffect, useState } from 'react';
import {Service} from "@/lib/types/types"
import Loading from '@/components/Loading';

interface ModalProps {
    service: Service | null;
    onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ service, onClose }) => {
    if (!service) return null;

    return (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50'>
            <div className='flex flex-col justify-between bg-foreground p-6 rounded-lg text-secondary w-[600px] h-[400px] '>
                <p className='text-3xl  text-center font-bold mb-2'>{service.name}</p>
                <p className='h-1/3 text-xl tracking-wide leading-6'>{service.description}</p>
                <button className='bg-muted hover:bg-background text-white px-4 py-2 mt-4 rounded-md' onClick={onClose}>
                    Fermer
                </button>
            </div>
        </div>
    );
};

const ServicePage: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
   
    const fetchServices = async (additionalParam: string) => {
            try {
                const cachedService = sessionStorage.getItem('services');

                if(cachedService){
                    setServices(JSON.parse(cachedService))
                
                } else {
                    const response = await fetch(`/api/services/read?additionalParam=${encodeURIComponent(additionalParam.toString())}`);
                    if (!response.ok) {
                        throw new Error('Service synchronization failure');
                    }     
                    const { success, services } = await response.json();

                    if (success) {
                        setServices(services);
                        sessionStorage.setItem('services', JSON.stringify(services))
                    } else {
                        console.error('Service not found');
                    }
                }

            } catch (error) {
                console.error('Service synchronization error', error);
            } finally {
                setLoading(false)
            }
    };

       
     useEffect(() => { fetchServices("service");}, []);

    const openModal = (service: Service) => {
        setSelectedService(service);
    };

    const closeModal = () => {
        setSelectedService(null);
    };

    return (
        <main className='flex flex-col items-center py-12 px-1 md:p-12 gap-6 min-h-[300px]'>
            <h1 className='text-4xl font-bold font-caption mb-10 text-center'>Nos services disponibles</h1>
            <Loading loading={loading}>
            
            <section className='bg-muted p-6 rounded-lg border border-slate-200'>
                <div className='flex flex-wrap justify-center gap-6'>
                    {services.map((service) => (
                        <div key={service.id} className='border-2 bg-foreground hover:bg-background border-slate-200 p-2 rounded-md w-[250px] cursor-pointer text-secondary hover:text-white' onClick={() => openModal(service)}>
                            <p className='text-xl font-bold mb-2'>{service.name}</p>
                            <p className='text-md'>{service.description}</p>
                        </div>
                    ))}
                </div>
            </section>
            <Modal service={selectedService} onClose={closeModal} />
            </Loading>
        </main>
    );
};

export default ServicePage;