"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";

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
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { ASSESSMENT_STATUSES, type AssessmentStatus } from "./constants";

export type AssessmentActionsProps = {
  assessment: Doc<"assessments">;
};

export default function AssessmentActions({ assessment }: AssessmentActionsProps) {
  const deleteAssessment = useMutation(api.assessments.deleteAssessment);
  const updateAssessmentStatus = useMutation(
    api.assessments.updateAssessmentStatus
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  const availableStatuses = ASSESSMENT_STATUSES.filter(
    (status) => status !== assessment.status
  );

  const handleDelete = useCallback(() => {
    void deleteAssessment({ assessmentId: assessment._id });
  }, [deleteAssessment, assessment._id]);

  const handleChangeStatus = useCallback(
    (next: AssessmentStatus) => {
      void updateAssessmentStatus({
        assessmentId: assessment._id,
        status: next,
      });
    },
    [updateAssessmentStatus, assessment._id]
  );

  return (
    <>
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
            <AlertDialogAction onClick={handleDelete}>
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              {availableStatuses.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleChangeStatus(status)}
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
