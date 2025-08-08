// convex/public.ts
import { Id } from "./_generated/dataModel";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// PUBLIC QUERY: Get an organization and its services by name or ID
export const getOrgAndServices = query({
  args: {
    orgName: v.string(),
    orgId: v.id("organizations"),
    serviceIds: v.array(v.id("services")),
    price: v.number(),
  },
  handler: async (args: {
    orgName: string;
    orgId: Id<"organizations">;
    serviceIds: Id<"services">[];
    price: number;
  }, ctx: QueryCtx) => {
    const { orgId } = args;
    const org = await ctx.db
      .query("organizations")
      .filter((q) => q.eq(q.field("orgId"), orgId))
      .first();

    if (!org) {
      return null;
    }

    const services = await ctx.db
      .query("services")
      .withIndex("by_orgId", "orgId", orgId)
      .collect();

    return {
      org,
      services,
    };
  },
});

// PUBLIC QUERY: Get an organization by slug
export const getOrgForBooking = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx: QueryCtx, args: { slug: string }) => {
    // Find the organization by its unique slug
    const org = await ctx.db
      .query("organizations")
      .withIndex((q) => q.eq(q.field("orgSlug"), args.slug))
      .first();

    if (!org) {
      return null;
    }

    // Find the services offered by this organization
    const services = await ctx.db
      .query("services")
      .withIndex("by_orgId", "orgId", org._id as Id<"organizations">)
      .collect();

    return {
      orgName: org.orgName,
      orgImageUrl: org.logo,
      orgId: org.orgId,
      services,
    };
  },
});

// PUBLIC MUTATION: Create an assessment for a specific organization
export const publicCreateAssessment = mutation({
  args: {
    userId: v.id("users"),
    orgId: v.id("organizations"), // Pass the orgId from the public page
    clientName: v.string(),
    carMake: v.string(),
    carModel: v.string(),
    carYear: v.number(),
    serviceIds: v.array(v.id("services")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx: MutationCtx, args: {
    userId: Id<"users">;
    orgId: Id<"organizations">;
    clientName: string;
    carMake: string;
    carModel: string;
    carYear: number;
    serviceIds: Id<"services">[];
    notes?: string;
  }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    if (!args.userId) {
      throw new Error("Missing userId");
    }
    if (!args.orgId) {
      throw new Error("Missing orgId");
    }
    if (!args.clientName) {
      throw new Error("Missing clientName");
    }
    if (!args.carMake) {
      throw new Error("Missing carMake");
    }
    if (!args.carModel) {
      throw new Error("Missing carModel");
    }
    if (!args.serviceIds) {
      throw new Error("Missing serviceIds");
    }
    try {
      return await ctx.db.insert("assessments", {
        ...args,
        status: "pending",
      });
    } catch (e) {
      console.error("Error creating assessment:", e);
      throw e;
    }
  },
});