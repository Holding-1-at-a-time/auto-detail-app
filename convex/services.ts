// convex/services.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from './_generated/dataModel';

// Mutation to create a new service
export const createService = mutation({
    args: {
        orgId: v.id('organizations'),
        name: v.string(),
        price: v.number(),
        userId: v.id("users"),
        clientName: v.string(),
        carMake: v.string(),
        carModel: v.string(),
        carYear: v.number(),
        notes: v.optional(v.string()),
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
            clientName: args.clientName,
            carMake: args.carMake,
            carModel: args.carModel,
            carYear: args.carYear,
            notes: args.notes,
            status: "pending",
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
    }
});

export const getServicesForCurrentOrg = query({
    args: {
        orgId: v.id("organizations"),
        userId: v.id("users"),
        name: v.string(),
        price: v.number(),
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
        if (!identity || !identity.orgId) {
            return [];
        }

        return ctx.db
            .query("services")
            .withIndex("by_orgId", (q) => q.eq("orgId", identity.orgId as Id<"organizations">))
            .collect();
    }
});