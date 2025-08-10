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
  services: string[];
  notes?: string;
};

/**
 * Creates a new assessment record, associating it with an existing client if one matches the provided organization and client name, or creating a new client if necessary.
 *
 * If a client with the given organization ID and normalized name exists, their ID is reused; otherwise, a new client is created with the provided details. The assessment is then created with the specified car, service, and note information, and its status is set to "pending".
 *
 * @param args - The input data for the assessment, including client, car, and service details
 * @returns The ID of the newly created assessment
 * @throws If the user is not authenticated
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

  // Normalize inputs for matching/insert
  const normalizedName = args.client.name.trim().toLocaleLowerCase();
  const normalizedEmail = args.client.email?.trim().toLocaleLowerCase();
  const normalizedPhone = args.client.phone?.replace(/\D+/g, "");

  const existingClient = await ctx.db
    .query("clients")
    .withIndex("by_orgId_and_name", (q) =>
      q.eq("orgId", args.orgId).eq("name", normalizedName)
    )
    .first();

  if (existingClient) {
    clientId = existingClient._id;
  } else {
    clientId = await ctx.db.insert("clients", {
      orgId: args.orgId,
      userId: args.userId,
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
    });
  }
  const serviceIds = args.services
    .map((service) => ctx.db.normalizeId("services", service))
    .filter((id): id is Id<"services"> => id !== null);

  return await ctx.db.insert("assessments", {
      clientId,
      carMake: args.carMake,
      carModel: args.carModel,
      carYear: args.carYear,
      serviceIds,
      notes: args.notes,
      orgId: args.orgId,
      userId: args.userId,
      status: "pending" as AssessmentStatus,
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
