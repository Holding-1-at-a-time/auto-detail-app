// app/(app)/[organizationId]/dashboard/page.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import AssessmentActions from "./AssessmentActions";
import { ASSESSMENT_TABLE_HEADERS } from "./constants";
import { useCallback } from "react";

// Main Dashboard Page Component
export default function DashboardPage() {
  const router = useRouter();
  // Typed destructure for useParams
  const { organizationId } = useParams<{ organizationId: string }>();

  // TODO: If you want to fetch by explicit orgId, use getOrganizationForUser and provide userId/orgId
  // getOrganization uses the authenticated user's orgId and takes no arguments
  const orgDoc = useQuery(api.organizations.getOrganization);
  const assessments = useQuery(
    api.assessments.getByOrg,
    orgDoc?._id ? { orgId: orgDoc._id } : "skip"
  );

  const handleRowClick = useCallback(
    (assessmentId: Id<"assessments">) => {
      router.push(`/assessment/${assessmentId}`);
    },
    [router]
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
              {ASSESSMENT_TABLE_HEADERS.map(({ label, className }) => (
                <TableHead key={label} className={className}>
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {assessments?.map((assessment) => {
              const {
                _id,
                clientName,
                carYear,
                carMake,
                carModel,
                status,
                _creationTime,
              } = assessment;
              return (
                <TableRow
                  key={_id}
                  onClick={() => handleRowClick(_id)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{clientName}</TableCell>
                  <TableCell>
                    {carYear} {carMake} {carModel}
                  </TableCell>
                  <TableCell>
                    <Badge className="capitalize">{status}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(_creationTime).toLocaleDateString()}
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()} // prevent row navigation when clicking actions
                  >
                    <AssessmentActions assessment={assessment} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Removed broken Load More button (status/loadMore undefined) */}
    </div>
  );
}
