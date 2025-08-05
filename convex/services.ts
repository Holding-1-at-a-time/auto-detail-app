// convex/services.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Create a new service for the current organization
export const createService = mutation({
    args: {
        name: v.string(),
        price: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity || !identity.orgId) {
            throw new Error("You must be part of an organization to create a service.");
        }

        // Create the service and associate it with the organization
        await ctx.db.insert("services", {
            orgId: String(identity.orgId),
            name: args.name,
            price: args.price,
        });
    },
});

// Get all services for the currently active organization
export const getServicesForCurrentOrg = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity || !identity.orgId) {
            return [];
        }

        return ctx.db
            .query("services")
            .withIndex("by_orgId", (q) => q.eq("orgId", String(identity.orgId!)))
            .collect();
    }
});