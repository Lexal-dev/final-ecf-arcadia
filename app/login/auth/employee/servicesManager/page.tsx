"use client";
import React, { useEffect, useState } from 'react';
import { MdEdit } from 'react-icons/md';
import FormUpdate from '@/components/services/employeeFormUpdate';

interface Service {
  id: number;
  name: string;
  description: string;
}

export default function ServiceManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchServices = async (additionalParam: string | number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/services/read?additionalParam=${encodeURIComponent(additionalParam.toString())}`);
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      const data = await response.json();
      if (data.success) {
        setServices(data.services);
      } else {
        throw new Error(data.message || 'Failed to fetch services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices('services');
  }, []);

  const handleEditService = (service: Service) => {
    setSelectedService(service);
  };

  const handleUpdateSuccess = () => {
    fetchServices('services');
    setSelectedService(null);
  };

  return (
    <main className="flex flex-col items-center py-12 min-h-[200x]">
      <h1 className='text-3xl mb-4 font-bold'>Gestionnaire des services</h1>
      <div className="overflow-x-auto w-full flex flex-col items-center">
        {loading ? (
          <div className="p-4 text-center">Chargement des services...</div>
        ) : services.length === 0 ? (
          <div className="p-4 text-center text-secondary">Aucun service trouvé</div>
        ) : (
          <table className="w-full md:w-2/3">
            <thead>
              <tr className="bg-muted-foreground">
                <th className="border border-background px-4 py-2 text-left">Nom</th>
                <th className="border border-background px-4 py-2 text-left">Description</th>
                <th className="border border-background px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr key={service.id} className="border-t bg-foreground text-secondary hover:bg-muted hover:text-white">
                  <td className="w-1/3 border border-background px-4 py-2 text-sm">{service.name}</td>
                  <td className="w-1/3 border border-background px-4 py-2 text-sm">{service.description}</td>
                  <td className="w-1/3 border border-background px-4 py-2 text-sm text-center">
                    <button onClick={() => handleEditService(service)} className="text-yellow-500 hover:text-yellow-700">
                      <MdEdit size={28} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedService && (
        <FormUpdate
          service={selectedService}
          onUpdateSuccess={handleUpdateSuccess}
          onClose={() => setSelectedService(null)}
        />
      )}
    </main>
  );
}