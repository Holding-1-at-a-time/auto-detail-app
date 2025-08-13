// convex/services.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from './_generated/dataModel';

// Mutation to create a new service
export const createService = mutation({
  args: {
    orgId: v.id("organizations"),
    userId: v.id("users"),
    name: v.string(),
    price: v.number(),
    description: v.\\(v.string()),
    category: v.optional(v.string()),
    durationMinutes: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to create a service.");
    }

    // Validate organization membership
    const user = await ctx.db.get(args.userId);
    if (!user || user.orgId !== args.orgId) {
      throw new Error("User is not a member of the specified organization");
    }

    return await ctx.db.insert("services", {
      orgId: args.orgId,
      userId: args.userId,
      name: args.name,
      price: args.price,
      description: args.description,
      category: args.category,
      durationMinutes: args.durationMinutes,
      isActive: args.isActive ?? true,
      imageUrl: args.imageUrl,
    });
  },
});

// Get all services
export const getAllServices = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    return ctx.db
      .query("services")
      .withIndex("by_orgId", (q) => q.eq("orgId", identity.orgId as Id<"organizations">))
      .collect();
  },
});

export const getServicesForCurrentOrg = query({
  args: {
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    return ctx.db
      .query("services")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
  }
});

// Update a service's details
export const updateService = mutation({
  args: {
    serviceId: v.id("services"),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to update a service.");
    }

    const { serviceId, ...rest } = args;

    await ctx.db.patch(serviceId, rest);
  },
});

// Delete a service
export const deleteService = mutation({
  args: {
    serviceId: v.id("services"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to delete a service.");
    }

    await ctx.db.delete(args.serviceId);
  },
});