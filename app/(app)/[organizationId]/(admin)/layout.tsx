// app/(admin)/layout.tsx
import React from "react";

// This layout will ONLY apply to routes inside the (admin) group
export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="bg-primary/10 border-b border-primary/20 py-2 text-center text-sm">
                <div className="container">
                    <p>
                        You are in <span className="font-bold">Admin Mode</span>.
                    </p>
                </div>
            </div>
            <main>{children}</main>
        </div>
    );
}