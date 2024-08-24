"use client";
import Link from "next/link";
import React, { useEffect, useState } from 'react';
import { decodeToken } from '@/lib/security/decode';
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { usePathname } from "next/navigation";

interface NavItem {
    name: string;
    path: string;
    roles: string[];
    active: boolean;
}

const SpaceNav: React.FC = () => {
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [navItems, setNavItems] = useState<NavItem[]>([]);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const pathname = usePathname();

    // take user's role with token
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            const decoded = decodeToken(storedToken);
            if (decoded) {
                setUserRoles(
                    Array.isArray(decoded.userRole) 
                        ? decoded.userRole.map(role => role.toUpperCase()) 
                        : [decoded.userRole.toUpperCase()]
                );
            } else {
                console.error('Token invalide');
                localStorage.removeItem('token');
            }
        } else {
            console.warn('Token non trouvé');
        }
    }, []);

    // update navigation elements
    useEffect(() => {
        const spaceNav: NavItem[] = [
            // Route Admin 
            { name: "Dashboard", path: "/login/auth/admin/dashboard", roles: ["ADMIN"], active: false },
            { name: "Utilisateurs", path: "/login/auth/admin/usersManager", roles: ["ADMIN"], active: false },
            { name: "Animaux", path: "/login/auth/admin/animalsManager", roles: ["ADMIN"], active: false },
            { name: "Animaux-Images", path: "/login/auth/admin/animalsImagesManager", roles: ["ADMIN"], active: false },
            { name: "Rapports-Vétérinaire", path: "/login/auth/admin/showVetLogs", roles: ["ADMIN"], active: false },
            { name: "Habitats", path: "/login/auth/admin/habitatsManager", roles: ["ADMIN"], active: false },
            { name: "Habitats-Images", path: "/login/auth/admin/habitatsImagesManager", roles: ["ADMIN"], active: false },
            { name: "Services-Manager", path: "/login/auth/admin/servicesManager", roles: ["ADMIN"], active: false },
            { name: "Horraires", path: "/login/auth/admin/hoursManager", roles: ["ADMIN"], active: false },
            { name: "Espèces", path: "/login/auth/admin/speciesManager", roles: ["ADMIN"], active: false },

            // Route Employee 
            { name: "Avis", path: "/login/auth/employee/avisManager", roles: ["EMPLOYEE", "ADMIN"], active: false },
            { name: "Services", path: "/login/auth/employee/servicesManager", roles: ["EMPLOYEE", "ADMIN"], active: false },
            { name: "Rapports-Nourritures", path: "/login/auth/employee/foodConsumptionManager", roles: ["EMPLOYEE", "ADMIN"], active: false },

            // Route Veterinarian
            { name: "Rapports-Animalié", path: "/login/auth/veterinarian/vetLogsManager", roles: ["VETERINARIAN", "ADMIN"], active: false },
            { name: "Rapports-Employés", path: "/login/auth/veterinarian/employLogsManager", roles: ["VETERINARIAN", "ADMIN"], active: false },
            { name: "Habitats-Commentaire", path: "/login/auth/veterinarian/habCommentsManager", roles: ["VETERINARIAN", "ADMIN"], active: false },
        ];

        const updateNavItems = spaceNav.map(item => ({
            ...item,
            active: item.path === pathname
        }));
        setNavItems(updateNavItems);

        setExpandedSection(null);
        setIsOpen(false);
    }, [pathname]);

    // Filter navigation elements with role
    const employeeNavItems = navItems.filter(navItem => navItem.roles.includes("EMPLOYEE"));
    const veterinarianNavItems = navItems.filter(navItem => navItem.roles.includes("VETERINARIAN"));
    const adminNavItems = navItems.filter(navItem => !navItem.roles.some(role => role === "EMPLOYEE" || role === "VETERINARIAN"));

    const filteredNavItems = () => {
        if (userRoles.includes("ADMIN")) return [...adminNavItems, ...employeeNavItems, ...veterinarianNavItems];
        if (userRoles.includes("EMPLOYEE")) return [...employeeNavItems];
        if (userRoles.includes("VETERINARIAN")) return [...veterinarianNavItems];
        return [];
    };

    const groupedNavItems = filteredNavItems().reduce((acc, item) => {
        const role = item.roles.find(role => role !== "ADMIN") || "ADMIN";
        if (!acc[role]) {
            acc[role] = [];
        }
        acc[role].push(item);
        return acc;
    }, {} as Record<string, NavItem[]>);

    const toggleSection = (role: string) => {
        setExpandedSection(expandedSection === role ? null : role);
    };

    return (
        <nav className="px-4 flex justify-center">
            <div className="flex flex-col items-center bg-muted rounded-b-lg pt-2 w-full">
                {isOpen ? (
                    <>
                        {userRoles.includes("ADMIN") ? (
                            Object.keys(groupedNavItems).map((role) => (
                                <div key={role} className="w-full flex flex-col justify-center items-center">
                                    <h3 
                                        className="w-full text-lg md:text-xl font-bold text-start ps-12 mt-2 mb-2 cursor-pointer"
                                        onClick={() => toggleSection(role)}
                                    >
                                        {role}
                                        {expandedSection === role ? (
                                            <FaCaretUp size={20} className="inline ml-2" />
                                        ) : (
                                            <FaCaretDown size={20} className="inline ml-2" />
                                        )}
                                    </h3>
                                    {expandedSection === role && (
                                        <ul className="flex flex-wrap items-center justify-center md:justify-between gap-4 pt-2 w-full md:w-3/4 mb-6">
                                            {groupedNavItems[role].map((navItem, index) => (
                                                <li key={index} className="w-1/3 md:w-1/4 p-2 text-sm md:text-lg font-semibold hover:text-secondary">
                                                    <Link href={navItem.path} className={`block ${navItem.active ? 'text-secondary' : ''}`}>
                                                        {navItem.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))
                        ) : (
                            <ul className="flex flex-wrap items-center justify-center md:justify-between gap-4 pt-2 w-full md:w-3/4 mb-6">
                                {filteredNavItems().map((navItem, index) => (
                                    <li key={index} className="w-1/3 md:w-1/4 p-2 text-sm md:text-lg font-semibold hover:text-secondary">
                                        <Link href={navItem.path} className={`block ${navItem.active ? 'text-secondary' : ''}`}>
                                            {navItem.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                ) : (
                    <p className="text-md w-full font-bold text-center pt-3">MENU {userRoles.join(', ')}</p>
                )}
                <div className="w-full items-center justify-center text-center">
                    <button onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? (<FaCaretUp size={20} />) : (<FaCaretDown size={20} />)}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default SpaceNav;