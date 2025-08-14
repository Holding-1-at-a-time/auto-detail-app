"use client";

import { useState } from "react";
import { OrganizationSwitcher } from "@clerk/nextjs";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NavLinks } from "./NavLink";

export function AppNav() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    function toggleSidebar() {
        setIsCollapsed(!isCollapsed);
    }

    return (
        <nav
            className={cn(
                "border-r border-white/10 p-4 flex flex-col transition-all duration-300",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <div className="flex items-center justify-between">
                <h2 className={cn("font-bold", isCollapsed && "hidden")}>
                    Navigation
                </h2>
                <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                    {isCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
                </Button>
            </div>
            <div className="mt-8">
                <NavLinks isCollapsed={isCollapsed} />
            </div>
            <div className="mt-auto pt-4">
                <OrganizationSwitcher
                    hidePersonal={true}
                    afterSelectOrganizationUrl={(org) => `/${org.id}/dashboard`}
                    afterLeaveOrganizationUrl="/create-organization"
                    afterCreateOrganizationUrl={(org) => `/${org.id}/dashboard`}
                />
            </div>
        </nav>
    );
}
