"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
    LayoutDashboard,
    Settings,
    Users,
    FileText,
    Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
    {
        name: "Dashboard",
        href: "dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "Settings",
        href: "settings",
        icon: Settings,
    },
    {
        name: "Clients",
        href: "clients",
        icon: Users,
    },
    {
        name: "Assessments",
        href: "assessments",
        icon: FileText,
    },
    {
        name: "Services",
        href: "services",
        icon: Briefcase,
    },
];

type NavLinksProps = {
    isCollapsed: boolean;
};

export function NavLinks({ isCollapsed }: NavLinksProps) {
    const params = useParams();
    const organizationId = params.organizationId as string;

    return (
        <div className="flex flex-col gap-4">
            {links.map((link) => {
                const LinkIcon = link.icon;
                return (
                    <Link
                        key={link.name}
                        href={`/${organizationId}/${link.href}`}
                        className={cn(
                            "flex items-center gap-4 p-2 rounded-lg",
                            "hover:bg-gray-700",
                            isCollapsed && "justify-center"
                        )}
                    >
                        <LinkIcon className="w-6 h-6" />
                        <span className={cn(isCollapsed && "hidden")}>{link.name}</span>
                    </Link>
                );
            })}
        </div>
    );
}
