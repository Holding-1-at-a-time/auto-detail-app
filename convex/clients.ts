// convex/clients.ts
import { query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Query to get all clients for the user's active organization
export const listByOrg = query({
  args: {
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    if (identity.orgId !== args.orgId) {
      return [];
    }

    return ctx.db
      .query("clients")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .collect();
  },
});

// Query to search for clients by name within the user's organization
export const searchByName = query({
    args: {
        orgId: v.id("organizations"),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        if (identity.orgId !== args.orgId) {
            return [];
        }

        if (!args.name) {
            return [];
        }

        return ctx.db
            .query("clients")
            .withSearchIndex("search_name", (q) =>
                q.search("name", args.name).eq("orgId", args.orgId)
            )
            .take(10);
    }
});

// Get a single client by their ID
export const getClientById = query({
  args: {
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const client = await ctx.db.get(args.clientId);

    if (!client) {
      return null;
    }

    // Security check: ensure the user's orgId matches the client's orgId
    if (client.orgId !== identity.orgId) {
      // This case should ideally not happen if UI is built correctly,
      // but it's a crucial security measure.
      return null;
    }

    return client;
  },
});
