// components/OrgIdProvider.tsx
"use client";
import { useOrganization } from "@clerk/nextjs";

export function OrgIdProvider({ children }: { children: (orgId: string | null) => React.ReactNode }) {
    const { organization } = useOrganization();
    return <>{children(organization?.id ?? null)}</>;
}
