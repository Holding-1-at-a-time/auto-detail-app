"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { OrganizationSwitcher } from "@clerk/nextjs";

export function AppNav() {
    const params = useParams();
    const organizationId = params.organizationId as string;

    return (
        <nav className="w-64 border-r border-white/10 p-4 flex flex-col">
            <h2 className="font-bold mb-4">Navigation</h2>
            <ul>
                {[
                    { label: "Dashboard", path: "dashboard" },
                    { label: "Settings", path: "settings" },
                    { label: "Clients", path: "clients" },
                    { label: "Assessments", path: "assessments" },
                    { label: "Services", path: "services" },
                ].map((item) => (
                    <li key={item.path}>
                        <Link href={`/${organizationId}/${item.path}`}>{item.label}</Link>
                    </li>
                ))}
            </ul>
            <div className="mt-auto pt-4">
                <OrganizationSwitcher hidePersonal={true} />
            </div>
        </nav>
    );
}
