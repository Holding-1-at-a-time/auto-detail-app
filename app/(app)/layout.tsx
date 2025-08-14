import Header from "@/components/nav/Header";
import { AppNav } from "@/components/nav/AppNav";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <div className="flex">
                <AppNav />
                <main className="flex-1 p-8">{children}</main>
            </div>
        </>
    );
}