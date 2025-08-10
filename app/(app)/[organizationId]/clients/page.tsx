"use client";

import { useQuery } from "convex/react";
import { useOrganization } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";

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
import { Button } from "@/components/ui/button";

/**
 * Displays a list of clients associated with the current organization, allowing users to view client details.
 *
 * Shows a loading message while client data is being fetched. If no clients are found, displays a message indicating that new clients will appear after creating an assessment.
 */
export default function ClientsPage() {
  const { organization } = useOrganization();
  const clients = useQuery(
    api.clients.listByOrg,
    organization?.id ? { orgId: organization.id as Id<"organizations"> } : "skip"
  );

  if (clients === undefined) {
    return <div>Loading clients...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Client Management</h1>
        <p className="text-muted-foreground">
          View and manage all your clients.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
          <CardDescription>A list of all clients for your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client._id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email ?? "N/A"}</TableCell>
                  <TableCell>{client.phone ?? "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/${organization?.id}/clients/${client._id}`}>
                      <Button variant="outline">View Details</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {clients.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
              <p>No clients found.</p>
              <p className="mt-2 text-sm">New clients will appear here after you create your first assessment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
