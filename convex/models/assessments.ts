// convex/models/assessments.ts
import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export type AssessmentStatus = "pending" | "reviewed" | "complete";

export type CreateAssessmentInput = {
  orgId: Id<"organizations">; // The Clerk Organization ID
  userId: Id<"users">; // The Clerk User ID
  clientName: string;
  carMake: string;
  carModel: string;
  carYear: number;
  carColor: string; // Added missing property
  services: string[]; // Service document IDs as strings; will be normalized
  notes?: string;
};

// Create a new assessment document and return its Id
export async function createAssessmentModel(
  ctx: MutationCtx,
  args: CreateAssessmentInput,
): Promise<Id<"assessments">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("You must be logged in to create an assessment.");
  }

  const serviceIds = args.services
    .map((service) => ctx.db.normalizeId("services", service))
    .filter((id): id is Id<"services"> => id !== null);

  return await ctx.db.insert("assessments", {
    clientName: args.clientName,
    carMake: args.carMake,
    carModel: args.carModel,
    carYear: args.carYear,
    serviceIds,
    notes: args.notes,
    orgId: args.orgId,
    userId: args.userId,
    status: "pending" as AssessmentStatus,
    carColor: args.carColor,
    serviceId: args.serviceIds[0], // Assuming the first service is the main one
  });
}

// Delete an assessment by Id
export async function deleteAssessmentModel(
  ctx: MutationCtx,
  assessmentId: Id<"assessments">,
): Promise<void> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("You must be logged in to delete an assessment.");
  }

  await ctx.db.delete(assessmentId);
}

// Update the status of an assessment
export async function updateAssessmentStatusModel(
  ctx: MutationCtx,
  assessmentId: Id<"assessments">,
  status: AssessmentStatus,
): Promise<void> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("You must be logged in to update an assessment.");
  }

  await ctx.db.patch(assessmentId, { status });
}
