// app/dashboard/page.tsx
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
                                <TableCell>
                                    {assessment.lineItems?.find((li) => li.type === "service")?.name ?? "Unknown"}
                                </TableCell>                                <TableCell className="text-right">
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