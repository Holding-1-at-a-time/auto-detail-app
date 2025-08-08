/**
    * @description      : 
    * @author           : rrome
    * @group            : 
    * @created          : 08/08/2025 - 08:38:11
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 08/08/2025
    * - Author          : rrome
    * - Modification    : 
**/
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
    givenName: v.string(),
    familyName: v.string(),
    userName: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zip: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(), // The Clerk User ID
  }).index("by_clerk_id", ["clerkId"])
    .index("by_orgId", ["orgId"])
    .index("by_givenName", ["givenName"])
    .index("by_familyName", ["familyName"])
    .index("by_email", ["email"])
    .index("by_phone", ["phone"]),

  // Organization profile now includes the organization ID
  organizations: defineTable({
    orgId: v.string(), // The Clerk Organization ID
    userId: v.id("users"), // The Clerk User ID
    orgName: v.string(),
    orgRole: v.string(),
    orgSlug: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zip: v.string(),
    phone: v.string(),
    email: v.string(),
    website: v.string(),
    logo: v.string(),
    services: v.object({
      // Organization services can be customized here
      service1: v.string(),
      service2: v.string(),
      service3: v.string(),
      service4: v.string(),
      service5: v.string(),
      service6: v.string(),
      service7: v.string(),
      service8: v.string(),
      service9: v.string(),
      service10: v.string(),
    }),
    users: v.array(v.id("users"),),
    assessments: v.array(v.id("assessments")),
    roles: v.array(v.string()), // Roles assigned to the organization
    settings: v.object({
      // Organization settings can be customized here
      theme: v.string(),
      language: v.string(),
      timezone: v.string(),
      currency: v.string(),
      dateFormat: v.string(),
      timeFormat: v.string(),
      defaultRole: v.string(),
      defaultLanguage: v.string(),
    }),
  }).index("by_orgId", ["orgId"])
    .index("by_userId", ["userId"])
    .index("by_orgName", ["orgName"])
    .index("by_users", ["users"])
    .index("by_assessments", ["assessments"])
    .index("by_roles", ["roles"])
    .index("by_settings", ["settings"]),

  subscriptions: defineTable({
    clerkSubscriptionId: v.string(),
    orgId: v.string(), // The Clerk Organization ID
    status: v.string(), // e.g., "active", "past_due"
    endsAt: v.optional(v.number()), // Unix timestamp for subscription end
  })
    .index("by_clerk_subscription_id", ["clerkSubscriptionId"])
    .index("by_org_id", ["orgId"]),

});