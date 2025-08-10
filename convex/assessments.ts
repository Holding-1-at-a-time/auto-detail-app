// convex/assessments.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

// Mutation to create a new assessment
export const createAssessment = mutation({
  args: {
    orgId: v.id("organizations"), // The Clerk Organization ID
    userId: v.id("users"), // The Clerk User ID
    clientName: v.string(),
    carMake: v.string(),
    carModel: v.string(),
    carYear: v.number(),
    services: v.array(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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
      serviceIds: serviceIds,
      notes: args.notes,
      orgId: args.orgId,
      userId: args.userId,
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to delete an assessment.");
    }

    await ctx.db.delete(args.assessmentId);
  },
});

// Mutation to update the status of an assessment
export const updateAssessmentStatus = mutation({
  args: {
    assessmentId: v.id("assessments"),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("complete")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to update an assessment.");
    }

    await ctx.db.patch(args.assessmentId, { status: args.status });
  },
});

// Query to get assessments for the currently logged-in user's organization
export const getMyAssessments = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const orgId = identity.orgId as Id<"organizations">;
    if (!orgId) {
      return [];
    }

    return ctx.db
      .query("assessments")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .order("desc")
      .collect();
  },
});

// Query for the admin to get all assessments
export const getAllAssessments = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You are not authorized to view this.");
    }

    // Simple authorization: check if the user is the designated admin
    if (identity.subject !== process.env.ADMIN_USER_ID) {
      throw new Error("You are not authorized to view this.");
    }

    return ctx.db.query("assessments").order("desc").collect();
  },
});

// NEW QUERY: Get all assessments for the user's active organization
export const getByOrg = query({
  args: {
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.orgId) {
      return [];
    }

    // Verify user has access to the requested organization
    if (identity.orgId !== args.orgId) {
      return [];
    }

    // Fetch all assessments that match the user's orgId and order by creation time
    return ctx.db
      .query("assessments")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .collect();
  },
});

// Get a single assessment by its ID
export const getAssessmentById = query({
  args: {
    assessmentId: v.id("assessments"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to view an assessment.");
    }

    return ctx.db.get(args.assessmentId);
  },
});
