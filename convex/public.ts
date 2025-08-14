// convex/public.ts
import { Id } from "./_generated/dataModel";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// PUBLIC QUERY: Get an organization and its services by name or ID
export const getOrgAndServices = query({
  args: {
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.orgId);

    if (!org) {
      return null;
    }

    const services = await ctx.db
      .query("services")
      .withIndex("by_orgId", (q) => q.eq("orgId", org._id))
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
  handler: async (ctx, args) => {
    // Find the organization by its unique slug
    const org = await ctx.db
      .query("organizations")
      .filter((q) => q.eq(q.field("orgSlug"), args.slug))
      .first();

    if (!org) {
      return null;
    }

    // Find the services offered by this organization
    const services = await ctx.db
      .query("services")
      .withIndex("by_orgId", (q) => q.eq("orgId", org._id))
      .collect();

    // Find the modifiers for this organization
    const modifiers = await ctx.db
      .query("modifiers")
      .withIndex("by_orgId", (q) => q.eq("orgId", org.orgId))
      .collect();

    return {
      orgName: org.orgName,
      orgImageUrl: org.logo,
      orgId: org.orgId,
      services,
      modifiers,
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
    carColor: v.optional(v.string()),
    serviceId: v.id("services"), // Changed from serviceId to serviceId
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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
    if (!args.carYear) {
      throw new Error("Missing carYear");
    }
    if (!args.serviceId) {
      throw new Error("Missing serviceId"); // Changed from serviceId to serviceId
    }
    try {
      // Find an existing client by org and name. Public flow requires an existing client.
      const client = await ctx.db
        .query("clients")
        .withIndex("by_orgId_and_name", (q) =>
          q.eq("orgId", args.orgId).eq("name", args.clientName)
        )
        .first();

      if (!client) {
        throw new Error("Client not found for this organization");
      }

      return await ctx.db.insert("assessments", {
        orgId: args.orgId,
        clientId: client._id,
        clientName: args.clientName,
        carMake: args.carMake,
        carModel: args.carModel,
        carYear: args.carYear,
        carColor: args.carColor ?? "Unknown",
        lineItems: [{ type: "service", name: "Publicly Booked Service", price: 0 }], // Placeholder, actual service details would be fetched
        notes: args.notes,
        status: "pending",
        clientEmail: "",
        subtotal: 0,
        tax: 0,
        total: 0
      });
    } catch (e) {
      console.error("Error creating assessment:", e);
      throw e;
    }
  },
});