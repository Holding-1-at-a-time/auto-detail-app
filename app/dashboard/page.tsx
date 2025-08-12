// app/dashboard/page.tsx
"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

/**
 * Redirects users to their organization's settings page if they are logged in.
 * Otherwise, users are redirected to the login page.
 * @returns {JSX.Element} A loading message indicating that the user is being redirected.
 */
export default function DashboardRedirect() {
    const router = useRouter();
    // Get the current user's org document
    const orgDoc = useQuery(api.organizations.getOrganization);

    useEffect(() => {
        if (orgDoc?._id) {
            router.replace(`/${orgDoc._id}/settings`);
        }
    }, [orgDoc, router]);

    return <div>Redirecting to your admin settings...</div>;
};

/**
 * Page that displays a list of a user's past and pending vehicle assessments.
 *
 * The table is sorted by most recent first. The status of each assessment is
 * displayed as a badge in the last column.
 */
export default function DashboardPage() {
    const assessments = useQuery(api.assessments.getMyAssessments);

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Assessments</CardTitle>
                <CardDescription>Here is a list of your past and pending vehicle assessments.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Services</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assessments?.map((assessment) => (
                            <TableRow key={assessment._id}>
                                <TableCell className="font-medium">{assessment.carYear} {assessment.carMake} {assessment.carModel}</TableCell>
                                <TableCell>{assessment.serviceId}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={assessment.status === 'pending' ? 'default' : 'secondary'}>
                                        {assessment.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
