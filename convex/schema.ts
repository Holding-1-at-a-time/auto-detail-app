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
import { ca } from "zod/locales";

export default defineSchema({
  // ENHANCED: Services table with more detail
  services: defineTable({
    orgId: v.id("organizations"),
    name: v.string(),
    description: v.string(),
    basePrice: v.number(),
    durationMinutes: v.number(),
    category: v.string(),
    isActive: v.boolean(),
    imageUrl: v.string(),
    type: v.union(v.literal("base"), v.literal("add_on")),
  }).index("by_orgId", ["orgId"]),

  // NEW: Modifiers for conditional up-charges
  modifiers: defineTable({
    orgId: v.string(),
    name: v.string(), // e.g., "Excessive Pet Hair"
    price: v.number(),
    description: v.string(),
  }).index("by_orgId", ["orgId"]),

  // ENHANCED: Assessments now store a full itemized estimate
  assessments: defineTable({
    orgId: v.id("organizations"),
    clientId: v.id("clients"),
    clientName: v.string(),
    clientEmail: v.string(),
    carMake: v.string(),
    carModel: v.string(),
    carYear: v.number(),
    carColor: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("complete")
    ),
    serviceName: v.string(),
    scheduledFor: v.number(), // Added scheduledFor field for calendar queries

    // NEW estimate fields
    lineItems: v.array(
      v.object({
        type: v.union(v.literal("service"), v.literal("modifier")),
        name: v.string(),
        price: v.number(),
      })
    ),
    subtotal: v.number(),
    discount: v.optional(v.number()),
    tax: v.number(),
    total: v.number(),
  }).index("by_orgId", ["orgId"])
  .index("by_orgId_and_clientId", ["orgId", "clientId"])
    .index("by_clientId", ["clientId"]),
  
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
    stripeAccountId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    serviceIds: v.array(v.id("services")), // Dynamic references to services
    serviceNames: v.array(v.string()), // Snapshot of service names
    users: v.array(v.id("users")),
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
    .index('by_userId_and__orgId', ['userId', 'orgId'])
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

  clients: defineTable({
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
  })
    .index("by_orgId", ["orgId"])
    .index("by_orgId_and_name", ["orgId", "name"])
    .index("by_orgId_and_email", ["orgId", "email"])
    .index("by_orgId_and_phone", ["orgId", "phone"]),

  cars: defineTable({
    clientId: v.id("clients"),
    orgId: v.id("organizations"), // Added orgId for organization scoping
    make: v.string(),
    model: v.string(),
    year: v.number(),
    color: v.optional(v.string()),
  }).index("by_clientId", ["clientId"]).index("by_orgId", ["orgId"]),
})

// Run codacy_cli_analyze on the updated schema.ts file to check for issues after adding scheduledFor to assessments.
// codacy_cli_analyze --rootPath c:\Users\rrome\auto-detail-app --file c:\Users\rrome\auto-detail-app\convex\schema.ts
