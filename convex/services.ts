// convex/services.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from './_generated/dataModel';

// Mutation to create a new service
export const createService = mutation({
    args: {
        orgId: v.id("organizations"),
        name: v.string(),
        price: v.number(),
        userId: v.id("users"),
        clientName: v.string(),
        carMake: v.string(),
        carModel: v.string(),
        carYear: v.number(),
        carColor: v.string(),
        notes: v.optional(v.string()),
        status: v.union(
          v.literal("pending"),
          v.literal("reviewed"),
          v.literal("complete"),
          v.literal("cancelled"),
        ),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("You must be logged in to create a service.");
        }

        return await ctx.db.insert("services", {
            name: args.name,
            price: args.price,
            orgId: args.orgId,
            userId: args.userId,
            carMake: args.carMake,
            carModel: args.carModel,
            carYear: args.carYear,
            notes: args.notes ?? undefined, // Use undefined to match schema type
            status: "pending",
            carColor: args.carColor
        });
    },
});

// Get all services
export const getAllServices = query({
    args: {
        id: v.id("services"),
        name: v.string(),
        price: v.number(),
        orgId: v.id("organizations"),
        userId: v.id("users"),
        status: v.union(
            v.literal("pending"),
            v.literal("reviewed"),
            v.literal("complete"),
            v.literal("cancelled"),
        ),
        serviceId: v.array(v.id("services")),
        notes: v.optional(v.string()),
        clientName: v.string(),
        carMake: v.string(),
        carModel: v.string(),
        carYear: v.number(),
    },
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity || identity.orgId) {
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