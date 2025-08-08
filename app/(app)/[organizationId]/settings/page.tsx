// app/(app)/[organizationId]/settings/page.tsx
'use client';

import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useOrganization, Protect } from '@clerk/nextjs';
import { QRCodeSVG } from 'qrcode.react';
import { useRef } from 'react';
import { toast } from "sonner"; // <-- Import toast from Sonner

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/**
 * Renders a card for managing business services.
 */
function ManageServicesCard() {
    const services = useQuery(api.services.getServicesForCurrentOrg);
    const createService = useMutation(api.services.createService);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = formData.get('name') as string;
        const price = Number(formData.get('price'));
        const { organization } = useOrganization();
        const orgId = organization?.id;
        const userId = 'some-user-id'; // Replace with actual user ID
        const clientName = 'default-client'; // Replace with actual client name
        const carMake = 'default-make'; // Replace with actual car make
        const carModel = 'default-model'; // Replace with actual car model
        const carYear = 2022; // Replace with actual car year

        if (!orgId) {
            toast.error("Organization ID is missing.");
            return;
        }

        await createService({
            orgId,
            name,
            price,
            userId,
            clientName,
            carMake,
            carModel,
            carYear
        })
            .then(() => {
                toast.success("New service has been added."); // <-- Use Sonner for success
                event.currentTarget.reset();
            })
            .catch((error) => {
                toast.error("Failed to add the service."); // <-- Use Sonner for error
                console.error(error);
            });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Services</CardTitle>
                <CardDescription>Add or edit the services your business offers.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 mb-8">
                    <Input name="name" placeholder="Service Name (e.g., Interior Detail)" required />
                    <Input name="price" type="number" placeholder="Price" step="0.01" required />
                    <Button type="submit" disabled={createService.isPending}>
                        {createService.isPending ? 'Adding...' : 'Add Service'}
                    </Button>
                </form>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Service Name</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {services?.map((service) => (
                            <TableRow key={service._id}>
                                <TableCell className="font-medium">{service.name}</TableCell>
                                <TableCell className="text-right">${service.price.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

/**
 * Renders a card displaying the unique booking link and QR code for the organization.
 */
function BookingLinkCard() {
    const { organization } = useOrganization();
    const qrCodeRef = useRef<HTMLDivElement>(null);

    if (!organization) return null;

    const bookingUrl = `${window.location.origin}/book/${organization.slug}`;

    // ... (keep the existing downloadQRCode function)

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Your Public Booking Link</CardTitle>
                <CardDescription>
                    Share this QR code or link with your clients to have them book a service.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div ref={qrCodeRef} className="p-4 bg-white rounded-lg">
                        <QRCodeSVG value={bookingUrl} size={128} />
                    </div>
                    <div className="flex-grow w-full">
                        <Input readOnly value={bookingUrl} className="mb-2" />
                        <div className="flex gap-2">
                            <Button
                                onClick={() => {
                                    navigator.clipboard.writeText(bookingUrl);
                                    toast.success("Copied to clipboard!"); // <-- Use Sonner
                                }}
                            >
                                Copy Link
                            </Button>
                            {/* ... (download button) ... */}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Main settings page, protected to be accessible only by organization admins.
 */
export default function SettingsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Business Settings</h1>
                <p className="text-muted-foreground">Manage your organization's services and public booking information.</p>
            </div>

            <Protect role="org:admin" fallback={<p>You do not have permission to view this page.</p>}>
                <ManageServicesCard />
                <BookingLinkCard />
            </Protect>
        </div>
    );
}