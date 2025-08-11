// convex/models/assessments.ts
import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export type AssessmentStatus = "pending" | "reviewed" | "complete";

export type CreateAssessmentInput = {
  orgId: Id<"organizations">;
  userId: Id<"users">;
  client: {
    name: string;
    email?: string;
    phone?: string;
  };
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

  const normalizedServiceIds = args.services.map((serviceIdStr) =>
    ctx.db.normalizeId("services", serviceIdStr)
  );
  const invalidServiceIndexes = normalizedServiceIds
    .map((id, idx) => (id === null ? idx : -1))
    .filter((idx) => idx !== -1);

  if (invalidServiceIndexes.length > 0) {
    const invalidServices = invalidServiceIndexes.map((idx) => args.services[idx]);
    throw new Error(
      `Invalid service IDs provided: ${invalidServices.join(", ")}`
    );
  }

  const serviceIds: Id<"services">[] = normalizedServiceIds.filter(
    (id): id is Id<"services"> => id !== null
  );

  if (serviceIds.length === 0) {
    throw new Error("At least one valid serviceId is required.");
  }

  return await ctx.db.insert("assessments", {
    clientId: clientId,
    carMake: args.carMake,
    carModel: args.carModel,
    carYear: args.carYear,
    serviceIds,
    notes: args.notes,
    orgId: args.orgId,
    userId: args.userId,
    status: "pending" as AssessmentStatus,
    carColor: args.carColor,
    serviceId: serviceIds[0],
    clientName: args.client.name
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
