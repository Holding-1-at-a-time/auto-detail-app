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

/**
 * Creates a new assessment record, associating it with an existing client if found or creating a new client if necessary.
 *
 * If a client with the specified organization ID and name exists, the assessment is linked to that client; otherwise, a new client is created using the provided details. The assessment includes car information, normalized service IDs, optional notes, and is initialized with a "pending" status.
 *
 * @param args - The input data for the assessment, including organization ID, user ID, client details, car details, services, and optional notes
 * @returns The ID of the newly created assessment
 * @throws Error if the user is not authenticated
 */
export async function createAssessmentModel(
  ctx: MutationCtx,
  args: CreateAssessmentInput,
): Promise<Id<"assessments">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("You must be logged in to create an assessment.");
  }

  let clientId: Id<"clients">;

  // Prioritize finding client by email if provided, as it's more likely to be unique
  if (args.client.email) {
    const clientByEmail = await ctx.db
      .query("clients")
      .withIndex("by_orgId_and_email", (q) =>
        q.eq("orgId", args.orgId).eq("email", args.client.email)
      )
      .first();
    if (clientByEmail) {
      clientId = clientByEmail._id;
    }
  }

  // If client not found by email, try finding by name
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

  // If client is still not found, create a new one
  if (!clientId) {
    clientId = await ctx.db.insert("clients", {
      orgId: args.orgId,
      userId: args.userId,
      name: args.client.name,
      email: args.client.email,
      phone: args.client.phone,
    });
  }

  const serviceIds = args.services
    .map((service) => ctx.db.normalizeId("services", service))
    .filter((id): id is Id<"services"> => id !== null);

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
