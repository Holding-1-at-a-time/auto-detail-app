// app/(app)/[organizationId]/settings/page.tsx
"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Protect } from "@clerk/nextjs";
import { toast } from "sonner";
import { MoreHorizontal, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServiceForm } from "./_components/service-form"; // We will create this next

/**
 * Renders the actions dropdown for each service in the table.
 */
function ServiceActions({ service }: { service: Doc<"services"> }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const deleteService = useMutation(api.services.deleteService);

  const handleDelete = () => {
    deleteService({ serviceId: service._id })
      .then(() => toast.success(`${service.name} has been deleted.`))
      .catch(() => toast.error("Failed to delete service."));
  };

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-500" onClick={handleDelete}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Service</DialogTitle>
        </DialogHeader>
        <ServiceForm
          service={service}
          onClose={() => setIsEditDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

/**
 * Settings page for managing an organization's services; access restricted to org admins.
 *
 * Renders a card with a table of services (Name, Type, Base Price) fetched for the current organization.
 * Provides a dialog to create a new service and per-service actions (edit/delete) via the ServiceActions
 * component; creation and editing use the shared ServiceForm. Wrapped in Protect with role "org:admin"
 * — when the current user lacks that role a permission message is shown instead.
 */
export default function SettingsPage() {
  const services = useQuery(api.services.getServicesForCurrentOrg);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Business Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization&apos;s services and public booking information.
        </p>
      </div>

      <Protect
        role="org:admin"
        fallback={<p>You do not have permission to view this page.</p>}
      >
        <Card>
          <CardHeader>
            <CardTitle>Manage Services</CardTitle>
            <CardDescription>
              The services your business offers to clients.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Service
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add a New Service</DialogTitle>
                  </DialogHeader>
                  <ServiceForm onClose={() => setIsCreateDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services?.map((service) => (
                  <TableRow key={service._id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell className="capitalize">{service.type}</TableCell>
                    <TableCell>${service.basePrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <ServiceActions service={service} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {/* We can add the BookingLinkCard here later */}
      </Protect>
    </div>
  );
}