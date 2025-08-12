"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Displays detailed information about a specific client, including their contact details and assessment history.
 *
 * Fetches client information and their associated assessments based on the `clientId` obtained from the URL parameters.
 * If the data is loading or unavailable, appropriate loading or error messages are displayed.
 * 
 * Renders the client's name, email address, and phone number in a card, followed by a table listing all assessments
 * associated with the client. Each assessment row displays the vehicle details, status, and creation date.
 * If no assessments are found, a message is displayed instead.
 */

export default function ClientDetailsPage() {
  const params = useParams();
  const clientId = params.clientId as Id<"clients">;

  const client = useQuery(api.clients.getClientById, { clientId });
  const assessments = useQuery(api.assessments.getAssessmentsByClientId, { clientId });

  if (client === undefined || assessments === undefined) {
    return <div>Loading client details...</div>;
  }

  if (client === null) {
      return <div>Client not found.</div>
  }

  return (
    <div>
        <div className="mb-8">
            <h1 className="text-3xl font-bold">{client.name}</h1>
            <p className="text-muted-foreground">
                Contact information and job history.
            </p>
        </div>

        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Contact Details</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="font-semibold">Email Address</p>
                        <p className="text-muted-foreground">{client.email ?? "Not provided"}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Phone Number</p>
                        <p className="text-muted-foreground">{client.phone ?? "Not provided"}</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Assessment History</CardTitle>
                <CardDescription>All assessments associated with this client.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assessments.map((assessment) => (
                      <TableRow key={assessment._id}>
                        <TableCell className="font-medium">{assessment.carYear} {assessment.carMake} {assessment.carModel}</TableCell>
                        <TableCell><Badge className="capitalize">{assessment.status}</Badge></TableCell>
                        <TableCell>{new Date(assessment._creationTime).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {assessments.length === 0 && (
                    <div className="text-center p-8 text-muted-foreground">
                        <p>No assessments found for this client.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
