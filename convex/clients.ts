// convex/clients.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const createClient = mutation({
  args: {
    orgId: v.id("organizations"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
    }),
  },
  returns: v.id("clients"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("clients", {
      orgId: args.orgId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      address: args.address,
    });
  },
});

export const listClients = query({
  args: {
    orgId: v.id("organizations"),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(v.any()),
    isDone: v.boolean(),
    continueCursor: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("clients")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .paginate(args.paginationOpts);
  },
});

export const getClient = query({
  args: {
    clientId: v.id("clients"),
  },
  returns: v.optional(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.clientId);
  },
});

export const updateClient = mutation({
  args: {
    clientId: v.id("clients"),
    update: v.object({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(
        v.object({
          street: v.string(),
          city: v.string(),
          state: v.string(),
          zip: v.string(),
        }),
      ),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.clientId, args.update);
    return null;
  },
});

export const deleteClient = mutation({
  args: {
    clientId: v.id("clients"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.clientId);
    return null;
  },
});
