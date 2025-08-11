// convex/models/assessments.ts
import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export type AssessmentStatus = "pending" | "reviewed" | "complete";

interface ClientInput {
  name: string;
  email?: string;
  phone?: string;
}

interface CarInput {
  make: string;
  model: string;
  year: number;
  color?: string;
}

interface AssessmentDocument {
  clientId: Id<"clients">;
  carMake: string;
  carModel: string;
  carYear: number;
  serviceId: Id<"services">;
  notes?: string;
  orgId: Id<"organizations">;
  userId: Id<"users">;
  status: AssessmentStatus;
  carColor: string;
  clientName: string;
}

export type CreateAssessmentInput = {
  orgId: Id<"organizations">;
  userId: Id<"users">;
  serviceId: Id<"services">;
  client: {
    name: string;
    email?: string;
    phone?: string;
  };
  carMake: string;
  carModel: string;
  carYear: number;
  carColor?: string; // Optional; defaults to "Unknown" if not provided
  notes?: string;
};
// Create a new assessment document and return its Id
export async function createAssessmentModel(
  ctx: MutationCtx,
  args: CreateAssessmentInput,
): Promise<Id<"assessments">> {
  // Ensure the client is valid and exists in the database
  if (!args.client.email && !args.client.name) {
    throw new Error("A valid client email or name is required.");
  }
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("You must be logged in to create an assessment.");
  }

  let clientId: Id<"clients"> | null = null;

  // 1) Try by email (more likely to be unique)
  if (args.client.email) {
    const clientByEmail = await ctx.db
      .query("clients")
      .withIndex("by_orgId_and_email", (q) =>
        q.eq("orgId", args.orgId).eq("email", args.client.email!)
      )
      .first();
    if (clientByEmail) {
      clientId = clientByEmail._id;
    }
  }

  // 2) Try by name AND phone (to reduce false positives)
  if (!clientId && args.client.name && args.client.phone) {
    const clientByNameAndPhone = await ctx.db
      .query("clients")
      .withIndex("by_orgId_name_and_phone", (q) =>
        q
          .eq("orgId", args.orgId)
          .eq("name", args.client.name)
          .eq("phone", args.client.phone!)
      )
      .first();
    if (clientByNameAndPhone) {
      clientId = clientByNameAndPhone._id;
    }
  }

  // 3) Fallback: try by name
  if (!clientId) {
    const clientByName = await ctx.db
      .query("clients")
      .withIndex("by_orgId_and_name", (q) =>
        q.eq("orgId", args.orgId).eq("name", args.client.name)
      )
      .first();
    if (clientByName) {
      clientId = clientByName._id;
    }
  }

  if (!clientId) {
    // Given current schema, clients require assessmentId, carId, and address.
    // Avoid creating an incomplete client here.
    throw new Error(
      "Client not found. Please create the client (with required details) before creating an assessment."
    );
  }

  // serviceId is already an Id<"services">, so just use it directly
  if (!args.serviceId) {
    throw new Error("A valid serviceId is required.");
  }

  return await ctx.db.insert("assessments", {
    orgId: args.orgId,
    userId: args.userId,
    serviceId: args.serviceId,
    clientId,
    clientName: args.client.name,
    carMake: args.carMake,
    carModel: args.carModel,
    carYear: args.carYear,
    carColor: args.carColor ?? "Unknown",
    notes: args.notes,
    status: "pending",
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
