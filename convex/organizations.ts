// convex/organizations.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id, Doc } from "./_generated/dataModel";

/**
 * Creates a new organization.
 * This is intended to be called from a Clerk webhook when a new organization is created.
 *
 * NOTE: The organizations table requires many fields. We accept a few key args
 * and populate the remainder with sensible defaults so this compiles and works
 * with your current schema.
 */
export const createOrganization = mutation({
  args: {
    orgId: v.string(), // Clerk Organization ID
    userId: v.id("users"), // Creator user id (Id<"users">)
    orgName: v.string(),
  },
  handler: async (ctx, args) => {
    // Normalize Unicode to NFKD and remove diacritics/non-ASCII characters
    const normalized = args.orgName.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    const slug = normalized
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    await ctx.db.insert("organizations", {
      orgId: args.orgId,
      userId: args.userId,
      orgName: args.orgName,
      orgRole: "owner",
      orgSlug: slug,
      address: "",
      city: "",
      state: "",
      zip: "",
      phone: "",
      email: "",
      website: "",
      logo: "",
      services: {
        service1: "",
        service2: "",
        service3: "",
        service4: "",
        service5: "",
        service6: "",
        service7: "",
        service8: "",
        service9: "",
        service10: "",
      },
      users: [args.userId],
      assessments: [],
      roles: ["owner"],
      settings: {
        theme: "light",
        language: "en",
        timezone: "UTC",
        currency: "USD",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "24h",
        defaultRole: "member",
        defaultLanguage: "en",
      },
    });
  },
});

/**
 * Retrieves the organization for the currently logged-in user (by Clerk orgId).
 */
export const getOrganization = query({
  handler: async (ctx): Promise<Doc<"organizations"> | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.orgId) {
      return null;
    }

    return await ctx.db
      .query("organizations")
      .withIndex("by_orgId", (q) => q.eq("orgId", identity.orgId as string))
      .unique();
  },
});

/**
 * Retrieves the organization document for a specific user within a specific org.
 * This replaces prior references to organizationTeamMembers/by_user_and_org.
 */
export const getOrganizationForUser = query({
  args: {
    userId: v.id("users"),
    // This is the Clerk Organization ID string stored in organizations.orgId
    orgId: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<Doc<"organizations"> | null> => {
    // Use the compound index defined in schema: by_userId_and__orgId
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_userId_and__orgId", (q) =>
        q.eq("userId", args.userId).eq("orgId", args.orgId)
      )
      .unique();

    return organization ?? null;
  },
});
