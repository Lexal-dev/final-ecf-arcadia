import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';
import { toast } from 'react-toastify';

interface FormCreateProps {
    onCreateSuccess: () => Promise<void>;
    onClose: () => void;
}

const FormCreate: React.FC<FormCreateProps> = ({ onCreateSuccess, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('EMPLOYEE');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (role !== 'EMPLOYEE' && role !== 'VETERINARIAN') {
            setError('Le rôle sélectionné n\'est pas valide.');
            return;
        }
        
        const token = sessionStorage.getItem('token');
        const response = await fetch('/api/users/create', {
            method: 'POST',
            headers:    { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },  
            body: JSON.stringify({ email, password, role }),
        });

        const data = await response.json();
        if (data.success) {
            toast.success('Utilisateur créé avec succès !');
            await onCreateSuccess();
        } else {
            console.error('Error creating user:', data.message);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 px-1">
            <div className="bg-foreground p-6 rounded shadow-md w-full md:w-1/2 text-secondary">
                <div className='flex w-full justify-between mb-6'>
                    <h1 className='w-3/4 sm:text-3xl text-2xl font-bold'>Ajouter un utilisateur</h1>
                    <button onClick={onClose} className="text-red-500 hover:text-red-700"><MdClose size={36} /></button>
                </div>
                <form onSubmit={handleSubmit} className="text-secondary">
                    {error && <p className="text-red-500 mb-2">{error}</p>}
                    <div className="mb-4">
                        <label className="block">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded bg-muted hover:bg-background text-white"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full p-2 border rounded bg-muted hover:bg-background text-white mb-6"
                        >
                            <option value="EMPLOYEE">EMPLOYEE</option>
                            <option value="VETERINARIAN">VETERINARIAN</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-muted hover:bg-background text-white py-2 px-4 rounded">
                        Créer
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FormCreate;