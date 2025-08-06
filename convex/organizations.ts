// convex/organizations.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Creates a new organization.
 * This is intended to be called from a Clerk webhook when a new organization is created.
 */
export const createOrganization = mutation({
  args: {
    orgId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("organizations", {
      clerkOrgId: args.orgId,
      name: args.name,
    });
  },
});

/**
 * Retrieves the organization for the currently logged-in user.
 */
export const getOrganization = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.orgId) {
      return null;
    }

    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_clerkOrgId", (q) => q.eq("clerkOrgId", identity.orgId!))
      .unique();

    return organization;
  },
});
