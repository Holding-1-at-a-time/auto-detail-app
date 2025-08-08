// convex/assessments.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * Centralized helpers to enforce authentication and authorization.
 * NOTE: These helpers assume org and user identifiers are external auth IDs (strings),
 * which should match your schema fields. Ensure your schema reflects this.
 */

// Require an authenticated user and return identity
async function requireIdentity(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  return identity;
}

// Get identity if available, else null
async function getIdentity(ctx: any) {
  return await ctx.auth.getUserIdentity();
}

// Require admin user; uses environment variable ADMIN_USER_ID
async function requireAdmin(ctx: any) {
  const identity = await requireIdentity(ctx);
  if (!process.env.ADMIN_USER_ID) {
    throw new Error("Server misconfiguration: ADMIN_USER_ID not set");
  }
  if (identity.subject !== process.env.ADMIN_USER_ID) {
    throw new Error("Forbidden");
  }
  return identity;
}

// Ensure the authenticated user has access to the specified org
// Option A: restrict to active org only (identity.orgId must match requested orgId)
async function requireOrgAccess(ctx: any, orgId: string) {
  const identity = await requireIdentity(ctx);
  if (!identity.orgId) {
    throw new Error("No active organization");
  }
  if (identity.orgId !== orgId) {
    // For multi-org membership, replace this check with a proper membership lookup.
    throw new Error("Forbidden: no access to requested organization");
  }
  return identity;
}

// Ensure the authenticated user can modify the given assessment (org-scoped)
async function requireAssessmentWriteAccess(ctx: any, assessmentId: Id<"assessments">) {
  const identity = await requireIdentity(ctx);
  const assessment = await ctx.db.get(assessmentId);
  if (!assessment) {
    throw new Error("Assessment not found");
  }
  if (!identity.orgId || assessment.orgId !== identity.orgId) {
    throw new Error("Forbidden");
  }
  return { identity, assessment };
}

// Unified assessment status validator
const AssessmentStatusValidator = v.union(
  v.literal("pending"),
  v.literal("reviewed"),
  v.literal("complete"),
  v.literal("cancelled"),
);

// Mutation to create a new assessment
export const createAssessment = mutation({
  args: {
    clientName: v.string(),
    carMake: v.string(),
    carModel: v.string(),
    carYear: v.number(),
    services: v.array(v.id("services")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    if (!identity.orgId) {
      throw new Error("You must have an active organization to create an assessment.");
    }

    return await ctx.db.insert("assessments", {
      clientName: args.clientName,
      carMake: args.carMake,
      carModel: args.carModel,
      carYear: args.carYear,
      serviceIds: args.services,
      notes: args.notes,
      orgId: identity.orgId as string,
      userId: identity.subject as string,
      status: "pending",
    });
  },
});

// Mutation to delete an assessment
export const deleteAssessment = mutation({
  args: {
    assessmentId: v.id("assessments"),
  },
  handler: async (ctx, args) => {
    await requireAssessmentWriteAccess(ctx, args.assessmentId);
    await ctx.db.delete(args.assessmentId);
  },
});

// Mutation to update the status of an assessment
export const updateAssessmentStatus = mutation({
  args: {
    assessmentId: v.id("assessments"),
    status: AssessmentStatusValidator,
  },
  handler: async (ctx, args) => {
    await requireAssessmentWriteAccess(ctx, args.assessmentId);
    await ctx.db.patch(args.assessmentId, { status: args.status });
  },
});

// Get a single assessment by its ID (org-scoped)
export const getAssessmentById = query({
  args: {
    assessmentId: v.id("assessments"),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const assessment = await ctx.db.get(args.assessmentId);
    if (!assessment) return null;
    if (!identity.orgId || assessment.orgId !== identity.orgId) {
      throw new Error("Forbidden");
    }
    return assessment;
  },
});

// Query to get assessments for the user's active organization
export const getMyAssessments = query({
  handler: async (ctx) => {
    const identity = await getIdentity(ctx);
    if (!identity || !identity.orgId) {
      return [] as any[];
    }
    return ctx.db
      .query("assessments")
      .withIndex("by_orgId", (q: any) => q.eq("orgId", identity.orgId as string))
      .order("desc")
      .collect();
  },
});

// Query: Get assessments for a specified organization accessible to the user
export const getByOrg = query({
  args: {
    // Optional: if omitted, defaults to active org
    orgId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const requestedOrgId = args.orgId ?? identity.orgId;
    if (!requestedOrgId) {
      return [] as any[];
    }

    await requireOrgAccess(ctx, requestedOrgId);

    return ctx.db
      .query("assessments")
      .withIndex("by_orgId", (q: any) => q.eq("orgId", requestedOrgId))
      .order("desc")
      .collect();
  },
});

// Admin-only: Get all assessments
export const getAllAssessments = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.db.query("assessments").order("desc").collect();
  },
});
