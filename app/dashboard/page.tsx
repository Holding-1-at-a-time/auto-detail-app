"use client";

import { Badge } from "@/components/ui/badge";
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
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

/**
 * Dashboard page showing a list of assessments and their statuses.
 */
export default function DashboardPage() {
    const assessments = useQuery(api.assessments.getMyAssessments);
    const services = useQuery(api.services.getAllServices);

    if (assessments === undefined || services === undefined) {
        return <div>Loading assessments...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Assessments</CardTitle>
                <CardDescription>
                    Here is a list of your past and pending vehicle assessments.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assessments.map((assessment) => {
                            const serviceName =
                                services.find(
                                    (service: { _id: string }) => service._id === assessment.serviceId
                                )?.name || assessment.serviceId;

                            return (
                                <TableRow key={assessment._id}>
                                    <TableCell className="font-medium">
                                        {assessment.carYear} {assessment.carMake} {assessment.carModel}
                                    </TableCell>
                                    <TableCell>{serviceName}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={assessment.status === "pending" ? "default" : "secondary"}>
                                            {assessment.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}