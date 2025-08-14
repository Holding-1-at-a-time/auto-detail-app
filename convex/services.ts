// convex/services.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

// NOTE: This file has been updated to align with the new service management UI.
// The mutations now derive the organization ID from the user's authentication
// token rather than requiring it as an explicit argument.

/**
 * Create a new service for the user's organization.
 */
export const createService = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    basePrice: v.number(),
    type: v.union(v.literal("base"), v.literal("add_on")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to create a service.");
    }

    // orgId is expected to be in the Clerk JWT token.
    const orgId = (identity as any).orgId;
    if (!orgId) {
      throw new Error("You must be part of an organization to create a service.");
    }

    return await ctx.db.insert("services", {
      ...args,
      orgId: orgId as Id<"organizations">,
      // Provide defaults for fields not present in the new form
      category: "Uncategorized",
      durationMinutes: 0,
      isActive: true,
      imageUrl: "",
    });
  },
});

/**
 * Get all services for the user's current organization.
 */
export const getServicesForCurrentOrg = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // orgId is expected to be in the Clerk JWT token.
    const orgId = (identity as any).orgId;
    if (!orgId) {
      return [];
    }

    return await ctx.db
      .query("services")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId as Id<"organizations">))
      .collect();
  },
});

/**
 * Update an existing service.
 */
export const updateService = mutation({
  args: {
    serviceId: v.id("services"),
    name: v.string(),
    description: v.string(),
    basePrice: v.number(),
    type: v.union(v.literal("base"), v.literal("add_on")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You are not authorized to perform this action.");
    }

    const orgId = (identity as any).orgId;
    if (!orgId) {
      throw new Error("You must be part of an organization to update a service.");
    }

    const { serviceId, ...rest } = args;

    const existingService = await ctx.db.get(serviceId);
    if (!existingService || existingService.orgId !== orgId) {
      throw new Error("You are not authorized to edit this service.");
    }

    await ctx.db.patch(serviceId, rest);
    return { success: true };
  },
});

/**
 * Delete a service.
 */
export const deleteService = mutation({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You are not authorized to perform this action.");
    }

    const orgId = (identity as any).orgId;
    if (!orgId) {
      throw new Error("You must be part of an organization to delete a service.");
    }

    const existingService = await ctx.db.get(args.serviceId);
    if (!existingService || existingService.orgId !== orgId) {
      throw new Error("You are not authorized to delete this service.");
    }

    // TODO: Add logic here to handle assessments that might be using this service
    // For now, we will delete it directly.

    await ctx.db.delete(args.serviceId);
    return { success: true };
  },
});
