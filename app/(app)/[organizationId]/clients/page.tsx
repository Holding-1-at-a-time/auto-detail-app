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
 * Displays a page for managing clients within the organization.
 *
 * This page retrieves and displays a list of all clients associated with the
 * currently selected organization. If the organization or client data is loading,
 * a loading message is shown. Once loaded, the list of clients is displayed in a
 * table format with columns for client name, email, and phone number. Each client
 * entry includes a button to view detailed information about the client.
 * 
 * If no clients are found, a message is displayed indicating that new clients will
 * appear after creating an assessment.
 */

/**
 * Renders a page that allows users to manage clients within their organization.
 * 
 * Fetches and displays a list of clients associated with the currently selected organization.
 * The list includes columns for client name, email, and phone number, and provides a button for
 * viewing detailed information about each client. 
 * 
 * If the organization is not selected or client data is loading, an appropriate message is shown.
 * In case no clients are found, a message is displayed indicating that new clients will appear 
 * after creating an assessment.
 */

export default function ClientsPage() {
  const { organization, isLoaded } = useOrganization();
  const clients = useQuery(
    api.clients.listByOrg,
    organization?.id
      ? { orgId: organization.id as Id<"organizations"> }
      : "skip",
  );

  if (!isLoaded || clients === undefined) {
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
          <CardDescription>
            A list of all clients for your organization.
          </CardDescription>
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
              <p className="mt-2 text-sm">
                New clients will appear here after you create your first
                assessment.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
