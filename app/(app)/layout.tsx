// app/(app)/layout.tsx
import Header from "@/components/nav/Header"; // You'll need to create/update this
import { OrganizationSwitcher, useSession } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export interface AppLayoutProps {
    children: React.ReactNode;
    params: {
        organizationId: string;
    };
}

export default function AppLayout({
    children,
    params,
}: AppLayoutProps) {
    const session = useSession();
    const { orgId } = getToken();

    // Redirect if the user is not in an organization
    if (!orgId && !session) {
        if (session) {
            return redirect(`/${params.organizationId}/dashboard`);
        } else {
            return redirect('/create-organization');
        }
    }

    return (
        <>
            <Header />
            <div className="flex">
                <nav className="w-64 border-r border-white/10 p-4">
                    <h2 className="font-bold mb-4">Navigation</h2>
                    <ul>
                        <li>
                            <Link href={`/${params.organizationId}/dashboard`}>Dashboard</Link>
                        </li>
                        <li>
                            <Link href={`/${params.organizationId}/settings`}>Settings</Link>
                        </li>
                        {/* Add more links here */}
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
function getToken(): { orgId: any; } {
    throw new Error("Function not implemented.");
}

