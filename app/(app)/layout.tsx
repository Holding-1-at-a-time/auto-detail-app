// app/(app)/layout.tsx
import Header from "@/components/nav/Header";
import { OrganizationSwitcher, useSession, useOrganization } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export interface AppLayoutProps {
    children: React.ReactNode;
    params: {
        organizationId: string;
    };
}

function GetToken(): { orgId: string | null } {
    const { organization } = useOrganization();
    const orgId = organization?.id || null;

    return { orgId };
}

export { GetToken };

/**
 * Renders the main application layout with a header, sidebar navigation, and content area, enforcing organization context.
 *
 * Redirects users to the organization creation page if no organization is selected. The sidebar navigation links are dynamically generated based on the current organization ID.
 *
 * @param children - The content to display within the main area of the layout
 * @param params - Contains the current organization ID used for navigation links
 * @returns The complete application layout or a redirect if no organization is present
 */
export default function AppLayout({
    children,
    params,
}: AppLayoutProps) {
    const { orgId } = GetToken();

    // Redirect if the user is not in an organization
    if (!orgId) {
        return redirect('/create-organization');
    }

    return (
        <>
            <Header />
            <div className="flex">
                <nav className="w-64 border-r border-white/10 p-4">
                    <h2 className="font-bold mb-4">Navigation</h2>
                    <ul>
                        {[
                            { label: "Dashboard", path: "dashboard" },
                            { label: "Settings", path: "settings" },
                        ].map((item) => (
                            <li key={item.path}>
                                <Link href={`/${params.organizationId}/${item.path}`}>{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-auto pt-4">
                        <OrganizationSwitcher hidePersonal={true} />
                    </div>
                </nav>
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </>
    );
}