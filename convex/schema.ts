// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // NEW: Table to store business-specific services
  services: defineTable({
    orgId: v.id("organizations"),
    name: v.string(),
    price: v.number(),
  }).index("by_orgId", ["orgId"])
    .index("by_name", ["name"])
    .index("by_price", ["price"]),


  // Assessments now belong to an organization and a user
  assessments: defineTable({
    orgId: v.id('organizations'), // The Clerk Organization ID
    userId: v.id("users"), // The Clerk User ID
    clientName: v.string(),
    carMake: v.string(),
    carModel: v.string(),
    carYear: v.number(),
    serviceIds: v.array(v.id("services")), // Link to the services table
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("complete")
    ),
  }).index("by_orgId", ["orgId"])
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_serviceIds", ["serviceIds"]),

    // User profile now includes the organization ID
    users: defineTable({
      orgId: v.id("organizations"), // The Clerk Organization ID
      clerkId: v.id("users"), // The Clerk User ID
    }).index("by_orgId", ["orgId"])
      .index("by_clerkId", ["clerkId"]),

  // NEW: Table to store organization-specific details
  organizations: defineTable({
    clerkOrgId: v.string(),
    name: v.string(),
  }).index("by_clerkOrgId", ["clerkOrgId"]),
});