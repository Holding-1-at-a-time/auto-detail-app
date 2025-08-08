// app/(app)/[organizationId]/dashboard/page.tsx
"use client";

import { useMutation, useQuery } from "convex/react";
import { useOrganization } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

// Sub-component for the action menu to keep the main component clean
function AssessmentActions({ assessment }: { assessment: Doc<"assessments"> }) {
  const deleteAssessment = useMutation(api.assessments.deleteAssessment);
  const updateAssessmentStatus = useMutation(
    api.assessments.updateAssessmentStatus
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const newStatuses = ["pending", "reviewed", "complete"].filter(
    (status) => status !== assessment.status
  );

  return (
    <>
      {/* Alert Dialog for delete confirmation */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              assessment for {assessment.clientName}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteAssessment({ assessmentId: assessment._id })
              }
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dropdown Menu for actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {newStatuses.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() =>
                    updateAssessmentStatus({
                      assessmentId: assessment._id,
                      status: status as "pending" | "reviewed" | "complete",
                    })
                  }
                  className="capitalize"
                >
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-500"
            onClick={() => setIsConfirmOpen(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

// Main Dashboard Page Component
export default function DashboardPage() {
  const { organization } = useOrganization();
  const assessments = useQuery(
    api.assessments.getByOrg,
    organization?.id ? { orgId: organization.id as Id<"organizations"> } : "skip"
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Assessment Dashboard</h1>
        <p className="text-muted-foreground">
          View and manage all incoming job assessments for your business.
        </p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Client</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assessments?.map((assessment) => (
              <TableRow key={assessment._id}>
                <TableCell className="font-medium">
                  {assessment.clientName}
                </TableCell>
                <TableCell>
                  {assessment.carYear} {assessment.carMake} {assessment.carModel}
                </TableCell>
                <TableCell>
                  <Badge className="capitalize">{assessment.status}</Badge>
                </TableCell>
                <TableCell>
                  {new Date(assessment._creationTime).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <AssessmentActions assessment={assessment} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}