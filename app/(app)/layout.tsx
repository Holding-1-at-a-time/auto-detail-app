import Header from "@/components/nav/Header";
import { OrganizationSwitcher } from "@clerk/nextjs";
import Link from "next/link";

export default function AppLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { organizationId: string };
}) {
    return (
        <>
            <Header />
            <div className="flex">
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
                                <Link href={`/${params.organizationId}/${item.path}`}>{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-auto pt-4">
                        <OrganizationSwitcher hidePersonal={true} />
                    </div>
                </nav>
                <main className="flex-1 p-8">{children}</main>
            </div>
        </>
    );
}