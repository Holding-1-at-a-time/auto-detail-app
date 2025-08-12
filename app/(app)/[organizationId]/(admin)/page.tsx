// app/admin/page.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
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
import { Badge } from "@/components/ui/badge";

/**
 * Page for an admin to review and manage all incoming client assessments.
 *
 * This page will only render data if the logged-in user's ID matches
 * ADMIN_USER_ID. The table displays the client name, vehicle info, notes, and
 * status of each assessment. The status is displayed as a badge that changes
 * color depending on whether the assessment is pending or complete.
 */
export default function AdminPage() {
    // This query will only return data if the logged-in user's ID matches ADMIN_USER_ID
    const assessments = useQuery(api.assessments.getAllAssessments);

    return (
        <Card>
            <CardHeader>
                <CardTitle>All Client Assessments</CardTitle>
                <CardDescription>Review and manage all incoming requests.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assessments?.map((assessment) => (
                            <TableRow key={assessment._id}>
                                <TableCell className="font-medium">{assessment.clientName}</TableCell>
                                <TableCell>{assessment.carYear} {assessment.carMake} {assessment.carModel}</TableCell>
                                <TableCell>{assessment.notes}</TableCell>
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