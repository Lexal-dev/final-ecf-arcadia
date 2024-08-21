"use client";
import React, { useEffect, useState } from 'react';
import FormCreate from '@/components/users/FormCreate';
import FormUpdate from '@/components/users/FormUpdate';
import User from '@/models/user';
import { MdDelete, MdEdit } from 'react-icons/md';
import { toast } from 'react-toastify';
import Loading from '@/components/Loading';


export default function UsersManager() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [showUpdateForm, setShowUpdateForm] = useState<boolean>(false); 
    const [selectedUser, setSelectedUser] = useState<User | null>(null); 

    const fetchUsers = async (additionalParam: string | number) => {
        try {
            const response = await fetch(`/api/users/read?additionalParam=${encodeURIComponent(additionalParam.toString())}`)
            const data = await response.json();
            if (data.success) {
                // Filter users to exclude administrators
                const filteredUsers = data.users.filter((user: User) => user.role !== 'ADMIN');
                setUsers(filteredUsers);
            } else {
                console.error(data.message || 'Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers('users');
    }, []);

    // Function to delete a user
    const handleUserDelete = async (id: number) => {
        try {
            const response = await fetch(`/api/users/delete?id=${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                setUsers(users.filter(user => user.id !== id));
                toast.success("Utilisateur effacé avec succès !");
            } else {
                console.error('Error deleting users:', data.message);
                toast.error('Erreur dans la suppression du compte');
            }
        } catch (error) {
            console.error('Error deleting users:', error);
            toast.error('Error deleting user');
        }
    };

    // Function to handle success of creating a user
    const handleUsersCreated = async () => {
        await fetchUsers("users"); // Refresh user list after creation
        setShowForm(false); // Close modal after creation
    };

    // Function to handle success of updating a user
    const handleUsersUpdated = async () => {
        await fetchUsers("users"); 
        setShowUpdateForm(false);
    };

    // Function to open create form
    const openCreateForm = () => {
        setShowForm(true);
    };

    // Function to open update form
    const openUpdateForm = (user: User) => {
        setSelectedUser(user); 
        setShowUpdateForm(true);
    };

    return (
        <main className='flex flex-col items-center py-12 min-h-[200x]'>
            <Loading loading={loading}>
                <h1 className='text-2xl mb-4 font-bold'>Gestionnaire Utilisateurs</h1>
                <button
                    onClick={openCreateForm}
                    className='bg-foreground hover:bg-muted-foreground hover:text-white text-secondary py-1 px-3 rounded-md mb-6'>
                    Ajouter un compte
                </button>
                <div className="overflow-x-auto w-full flex flex-col items-center">
                    <table className='w-full md:w-2/3 w-full'>
                        <thead className='bg-muted-foreground'>
                            <tr>
                                <th className='border border-background px-4 py-2 text-left'>Email</th>
                                <th className='border border-background px-4 py-2 text-left'>Role</th>
                                <th className='border border-background px-4 py-2 text-left'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className='w-full border border-background bg-foreground hover:bg-opacity-50 text-secondary hover:bg-muted hover:text-white'>
                                    <td className='w-1/3 border border-background px-4 py-2 text-sm'>{user.email}</td>
                                    <td className='w-1/3 border border-background px-4 py-2 text-sm'>{user.role}</td>
                                    <td className='w-1/3 border border-background px-4 py-2'>
                                        <div className='flex items-center justify-center md:gap-5'>
                                            <button
                                                className='text-red-500 hover:text-red-600'
                                                onClick={() => handleUserDelete(user.id)}
                                            >
                                                <MdDelete size={28} />
                                            </button>
                                            <button
                                                className='text-yellow-500 hover:text-yellow-600'
                                                onClick={() => openUpdateForm(user)}
                                            >
                                                <MdEdit size={28} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Show create form */}
                {showForm && (
                    <FormCreate
                        onCreateSuccess={handleUsersCreated}
                        onClose={() => setShowForm(false)}
                    />
                )}

                {/* Show update form */}
                {showUpdateForm && selectedUser && (
                    <FormUpdate
                        user={selectedUser}
                        onUpdateSuccess={handleUsersUpdated}
                        onClose={() => setShowUpdateForm(false)}
                    />
                )}
            </Loading>
        </main>
    );
}