// app/(app)/[organizationId]/settings/page.tsx
'use client';

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";

/**
 * Page allowing organization admins to add and view services offered by their
 * business.
 *
 * This page is only accessible to organization admins, and will display an
 * error message if a non-admin attempts to access it.
 */

export default function SettingsPage() {
    const createService = useMutation(api.services.createService);
    const services = useQuery(api.services.getServicesForCurrentOrg);
    const { membership } = useOrganization();

    // Simple form handler
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        createService({
            name: formData.get("name") as string,
            price: Number(formData.get("price")),
        });
        event.currentTarget.reset();
    };

    // Only allow organization admins to access this page's content
    if (membership?.role !== 'org:admin') {
        return <div>You do not have permission to view this page.</div>
    }

    return (
        <div>
            <h1 className="text-2xl font-bold">Manage Services</h1>
            <p>Add the services your business offers.</p>

            {/* Form to add a new service */}
            <form onSubmit={handleSubmit} className="mt-8 flex gap-4">
                <input name="name" placeholder="Service Name (e.g., Interior Detail)" required className="p-2 bg-gray-800 rounded-md flex-grow" />
                <input name="price" type="number" placeholder="Price" required className="p-2 bg-gray-800 rounded-md" />
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Add Service</button>
            </form>

            {/* List of existing services */}
            <div className="mt-8">
                <h2 className="font-semibold">Your Services</h2>
                <ul>
                    {services?.map(service => (
                        <li key={service._id} className="flex justify-between p-2 border-b border-gray-700">
                            <span>{service.name}</span>
                            <span>${service.price}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}