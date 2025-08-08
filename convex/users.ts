// convex/users.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Creates a new user in the database.
 * This is intended to be called from a Clerk webhook when a new user signs up.
 */
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("users", {
      clerkId: args.clerkId,
      orgId: args.orgId,
    });
  },
});

/**
 * Retrieves the user document for the currently logged-in user.
 */
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});
