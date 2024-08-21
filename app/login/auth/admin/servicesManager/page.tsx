"use client"
import React, { useEffect, useState } from 'react';
import FormCreate from '@/components/services/FormCreate';
import FormUpdate from '@/components/services/FormUpdate'; 
import Service from '@/models/service';
import { MdDelete, MdEdit } from 'react-icons/md';
import Loading from '@/components/Loading';
import { toast } from 'react-toastify';

export default function ServicesManager() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState<boolean>(false); // Create
    const [showUpdateForm, setShowUpdateForm] = useState<boolean>(false); // Update
    const [selectedService, setSelectedService] = useState<Service | null>(null);
   
    const fetchServices = async (additionalParam: string | number) => {
        try {
            const response = await fetch(`/api/services/read?additionalParam=${encodeURIComponent(additionalParam.toString())}`)
            const data = await response.json();
            if (data.success) {
                setServices(data.services);
            } else {
                setError(data.message || 'Failed to fetch services');
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            setError('An error occurred while fetching services');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices('services');
    }, []);


    const handleDeleteService = async (id: number) => {
        try {
            const response = await fetch(`/api/services/delete?id=${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                setServices(services.filter(service => service.id !== id));
                toast.success(`le service a bien été supprimé`)
            } else {
                console.error('Error deleting service:', data.message);
                toast.error(`Erreur durant la suppression du service: `, data.message)
            }
            
        } catch (error) {
            console.error('Error deleting service:', error);
        }
    };


    const handleServiceCreated = async () => {
        await fetchServices('services'); // Refresh after update
        setShowForm(false); // close modal after update
       
    };


    const handleServiceUpdated = async () => {
        await fetchServices('services'); // Refresh after update
        setShowUpdateForm(false); // close modal after update
    
    };


    const openCreateForm = () => {
        setShowForm(true);
    };


    const openUpdateForm = (service: Service) => {
        setSelectedService(service); // Set the selected service for editing
        setShowUpdateForm(true);
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }
   
    return (
        <main className='flex flex-col items-center w-full py-12 px-1'>
            <Loading loading={loading} >
                <h1 className='text-2xl mb-6 font-bold'>Gestionnaire Services</h1> 
                <button onClick={openCreateForm} className='bg-foreground hover:bg-muted-foreground hover:text-white text-secondary py-1 px-3 rounded-md mb-6'> Ajouter un Service</button>
                <div className="overflow-x-auto w-full flex flex-col items-center">
                    <table className='w-full md:w-2/3 text-secondary'>
                        <thead>
                            <tr className='bg-muted-foreground text-white'>
                                <th className='w-1/4 py-3 px-6 text-left'>Name</th>
                                <th className='w-2/4 py-3 px-6 text-left'>Description</th>
                                <th className='w-1/4 py-3 px-6 text-center'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((service) => (
                                <tr key={service.id} className='bg-foreground hover:bg-muted text-secondaryw-full'>
                                    <td className='border-b px-4 py-2'>{service.name}</td>
                                    <td className='border-b px-4 py-2'>{service.description}</td>
                                    <td className='border-b px-4 py-2'>
                                    <div className='flex justify-center gap-2'>
                          <button onClick={() => handleDeleteService(service.id)} className='text-white text-lg bg-red-500 hover:bg-red-600 p-2 rounded-md'>
                            <MdDelete />
                          </button>
                          <button onClick={() => openUpdateForm(service)} className='text-white text-lg bg-yellow-500 hover:bg-yellow-600 rounded p-2 '>
                            <MdEdit />
                          </button>
                        </div>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>


            {/* Display the create form */}
            {showForm && (
                <FormCreate
                    onCreateSuccess={handleServiceCreated}
                    onClose={() => setShowForm(false)}
                />
            )}

            {/* Display the update form */}
            {showUpdateForm && selectedService && (
                <FormUpdate
                    service={selectedService}
                    onUpdateSuccess={handleServiceUpdated}
                    onClose={() => setShowUpdateForm(false)}
                />
            )}
            </Loading>
        </main>
    );
}