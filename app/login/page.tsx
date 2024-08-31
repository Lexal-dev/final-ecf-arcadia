"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token) {
            router.push('/login/auth');
        }
    }, [router]); 

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const { message } = await response.json();
                throw new Error(message || 'Erreur lors de la connexion.');
            }

            const { token } = await response.json();
            sessionStorage.setItem('token', token);
            await new Promise(resolve => setTimeout(resolve, 1000));
            router.push('/login/auth');
        } catch (error:any) {
            setError(error.message || 'Erreur lors de la connexion.');
        }
    };

    return (
        <main className='flex flex-col w-full items-center justify-center py-12 px-1'>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <form onSubmit={handleSubmit} className='flex flex-col justify-around w-full  md:max-w-[500px] min-h-[350px]  p-4 rounded-lg gap-3 bg-foreground text-secondary shadow-md'>
                <h3 className='text-3xl font-bold font-caption text-center'>Connexion</h3>
                <input type="email" id="email"  name="email" placeholder='Entrez votre adresse e-mail..' className='w-full  text-white p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200' value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" id="password"  name="password" placeholder='Entrez votre mot de passe..'  className='w-full  text-white p-2 rounded-md bg-muted hover:bg-background placeholder-slate-200'value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit" className='w-full bg-muted hover:bg-background text-white p-2'>Se connecter</button>
      
            </form>
        </main>
    );
};