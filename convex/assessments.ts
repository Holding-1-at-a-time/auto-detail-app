// convex/assessments.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  createAssessmentModel,
  deleteAssessmentModel,
  updateAssessmentStatusModel,
} from "./models/assessments";

// Mutation to create a new assessment
export const createAssessment = mutation({
  args: {
    orgId: v.id("organizations"), // The Clerk Organization ID
    userId: v.id("users"), // The Clerk User ID
    serviceId: v.id("services"),
    clientId: v.id("clients"),
    client: v.object({
      name: v.string(),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
    }),
    carMake: v.string(),
    carModel: v.string(),
    carYear: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return createAssessmentModel(ctx, args);
  },
});

// Mutation to delete an assessment
export const deleteAssessment = mutation({
  args: {
    assessmentId: v.id("assessments"),
  },
  handler: async (ctx, args) => {
    await deleteAssessmentModel(ctx, args.assessmentId);
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
    await updateAssessmentStatusModel(ctx, args.assessmentId, args.status);
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
      throw new Error("Not authenticated.");
    }

    // Verify user has access to the requested organization
    if (identity.orgId !== args.orgId) {
      throw new Error("Not authorized for this client.");
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

// Get all assessments for a specific client
export const getAssessmentsByClientId = query({
  args: {
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const client = await ctx.db.get(args.clientId);
    if (!client) {
        return [];
    }

    if (client.orgId !== identity.orgId) {
        return [];
    }

    return ctx.db
      .query("assessments")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .collect();
  },
});
