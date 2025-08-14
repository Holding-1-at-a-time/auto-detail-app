// app/(app)/[organizationId]/assessment/[assessmentId]/page.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";

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

export default function AssessmentDetailsPage() {
  const params = useParams();
  const assessmentId = params.assessmentId as Id<"assessments">;

  const assessment = useQuery(api.assessments.getAssessmentById, { assessmentId });

  if (assessment === undefined) {
    return <div>Loading assessment details...</div>;
  }

  if (assessment === null) {
    return <div>Assessment not found.</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Assessment for {assessment.clientName}</h1>
        <p className="text-muted-foreground">
          Vehicle: {assessment.carYear} {assessment.carMake} {assessment.carModel}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itemized Estimate</CardTitle>
          <CardDescription>
            The following is a detailed breakdown of the service costs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessment.lineItems.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold">
                <TableCell>Subtotal</TableCell>
                <TableCell className="text-right">${assessment.subtotal.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Tax</TableCell>
                <TableCell className="text-right">${assessment.tax.toFixed(2)}</TableCell>
              </TableRow>
              {(assessment?.discount ?? false) && (
                <TableRow>
                  <TableCell>Discount</TableCell>
                  <TableCell className="text-right">-${(assessment?.discount ?? 0).toFixed(2)}</TableCell>
                </TableRow>
              )}
              <TableRow className="text-xl font-bold">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">${assessment.total.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
