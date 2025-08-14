// components/OrgIdProvider.tsx
"use client";
import { useOrganization } from "@clerk/nextjs";

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Provides the currently active organization ID to its children.
 *
 * If Clerk is not initialized, or there is no active organization, this
 * component will pass `null` to its children.
 *
 * @example
 * 
/*******  dab0159b-b183-42ce-b56f-7f68c3eaf917  *******/
export function OrgIdProvider({ children }: { children: (orgId: string | null) => React.ReactNode }) {
    const { organization } = useOrganization();
    return <>{children(organization?.id ?? null)}</>;
}
