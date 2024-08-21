"use client"
import Link from "next/link";
import React, { useEffect, useState } from 'react';
import { decodeToken } from '@/lib/security/decode';
import { FaCaretDown } from "react-icons/fa";
import { FaCaretUp } from "react-icons/fa";
import { usePathname } from "next/navigation";

interface NavItem {
    name: string;
    path: string;
    roles: string[];
    active: boolean;
}

const SpaceNav: React.FC = () => {
    const [userRoles, setUserRoles] = useState<string[]>([]); // Changer en tableau pour plusieurs rôles
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [navItems, setNavItems] = useState<NavItem[]>([]);
    const pathname = usePathname();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            const decoded = decodeToken(storedToken);
            if (decoded) {
                // Assurez-vous que userRole est un tableau
                setUserRoles(Array.isArray(decoded.userRole) ? decoded.userRole.map(role => role.toUpperCase()) : [decoded.userRole.toUpperCase()]);
            } else {
                console.error('Token invalide');
                localStorage.removeItem('token');
            }
        } else {
            console.warn('Token non trouvé');
        }
    }, []);

    useEffect(() => {
        // Mettez à jour les éléments de navigation actifs en fonction du pathname
        const updateNavItems = spaceNav.map(item => ({
            ...item,
            active: item.path === pathname
        }));
        setNavItems(updateNavItems);
    }, [pathname]);

    const spaceNav: NavItem[] = [
        { name: "Dashboard", path: "/login/auth/admin/dashboard", roles: ["ADMIN"], active: false },
        { name: "Utilisateurs", path: "/login/auth/admin/usersManager", roles: ["ADMIN"], active: false },
        { name: "Animaux", path: "/login/auth/admin/animalsManager", roles: ["ADMIN"], active: false },
        { name: "Animaux-Images", path: "/login/auth/admin/animalsImagesManager", roles: ["ADMIN"], active: false },
        { name: "Rapports-Vétérinaire", path: "/login/auth/admin/showVetLogs", roles: ["ADMIN"], active: false },
        { name: "Habitats", path: "/login/auth/admin/habitatsManager", roles: ["ADMIN"], active: false },
        { name: "Habitats-Images", path: "/login/auth/admin/habitatsImagesManager", roles: ["ADMIN"], active: false },
        { name: "Services-Manager", path: "/login/auth/admin/servicesManager", roles: ["ADMIN"], active: false },
        { name: "horraires", path: "/login/auth/admin/hoursManager", roles: ["ADMIN"], active: false },

        { name: "Avis", path: "/login/auth/employee/avisManager", roles: ["EMPLOYEE", "ADMIN"], active: false },
        { name: "Services", path: "/login/auth/employee/servicesManager", roles: ["EMPLOYEE", "ADMIN"], active: false },
        { name: "Rapports-Nourritures", path: "/login/auth/employee/foodConsumptionManager", roles: ["EMPLOYEE", "ADMIN"], active: false },

        { name: "Rapports-Animalié", path: "/login/auth/veterinarian/vetLogsManager", roles: ["VETERINARIAN", "ADMIN"], active: false },
        { name: "Rapports-Employés", path: "/login/auth/veterinarian/employLogsManager", roles: ["VETERINARIAN", "ADMIN"], active: false },
        { name: "Habitats-Commentaire", path: "/login/auth/veterinarian/habCommentsManager", roles: ["VETERINARIAN", "ADMIN"], active: false },
    ];

    // Filtrer les éléments de navigation en fonction des rôles de l'utilisateur
    const filteredNavItems = navItems.filter(navItem => navItem.roles.some(role => userRoles.includes(role)));

    return (
        <nav className="px-4">
            <div className="bg-muted rounded-b-lg pt-2">
                {isOpen ? (
                    <ul className="flex flex-wrap items-center justify-center gap-6 px-2">
                        {filteredNavItems.map((navItem, index) => (
                            <li key={index} className={`text-lg py-3 font-semibold hover:text-secondary ${navItem.active ? 'text-secondary' : ''}`}>
                                <Link href={navItem.path}>
                                    {navItem.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-lg w-full font-bold text-center pt-3">MENU {userRoles.join(', ')}</p>
                )}
                <div className="w-full items-center justify-center text-center pt-1">
                    <button onClick={() => { setIsOpen(!isOpen); }}>
                        {isOpen ? (<FaCaretUp size={24} />) : (<FaCaretDown size={24} />)}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default SpaceNav;