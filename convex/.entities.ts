// convex/entities.ts
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { createAssessmentModel, type CreateAssessmentInput } from "./models/assessments";

function slugify(input: string): string {
  const normalized = input.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  return normalized.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export type CreateOrganizationArgs = {
  orgId: string; // Clerk Organization ID
  userId: Id<"users">;
  orgName: string;
};

export type CreateServiceArgs = {
  orgId: Id<"organizations">;
  userId: Id<"users">;
  name: string;
  price: number;
  description?: string;
  category?: string;
  durationMinutes?: number;
  isActive?: boolean;
  imageUrl?: string;
  type?: "base" | "add_on"; // Add type property
};

export type CreateEntitiesArgs = {
  organizations?: Array<CreateOrganizationArgs>;
  services?: Array<CreateServiceArgs>;
  assessments?: Array<CreateAssessmentInput>;
};

export type CreateEntitiesResult = {
  organizations: Array<Id<"organizations">>;
  services: Array<Id<"services">>;
  assessments: Array<Id<"assessments">>;
};

export const createEntities = internalMutation({
  args: {
    organizations: v.optional(
      v.array(
        v.object({
          orgId: v.string(),
          userId: v.id("users"),
          orgName: v.string(),
        }),
      ),
    ),
    services: v.optional(
      v.array(
        v.object({
          orgId: v.id("organizations"),
          userId: v.id("users"),
          name: v.string(),
          price: v.number(),
          description: v.optional(v.string()),
          category: v.optional(v.string()),
          durationMinutes: v.optional(v.number()),
          isActive: v.optional(v.boolean()),
          imageUrl: v.optional(v.string()),
          type: v.optional(v.string()),
        }),
      ),
    ),
    assessments: v.optional(
      v.array(
        v.object({
          orgId: v.id("organizations"),
          userId: v.id("users"),
          serviceId: v.id("services"),
          client: v.object({
            name: v.string(),
            email: v.optional(v.string()),
            phone: v.optional(v.string()),
          }),
          carMake: v.string(),
          carModel: v.string(),
          carYear: v.number(),
          carColor: v.optional(v.string()),
          notes: v.optional(v.string()),
        }),
      ),
    ),
  },
  returns: v.object({
    organizations: v.array(v.id("organizations")),
    services: v.array(v.id("services")),
    assessments: v.array(v.id("assessments")),
  }),
  handler: async (ctx, args): Promise<CreateEntitiesResult> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const created: CreateEntitiesResult = {
      organizations: [],
      services: [],
      assessments: [],
    };

    // Create organizations with sensible defaults
    for (const org of args.organizations ?? []) {
      const insertedOrgId = await ctx.db.insert("organizations", {
        orgId: org.orgId,
        userId: org.userId,
        orgName: org.orgName,
        orgRole: "owner",
        orgSlug: slugify(org.orgName),
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
        users: [org.userId],
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
      created.organizations.push(insertedOrgId);
    }

    // Create services, validating org membership
    for (const svc of args.services ?? []) {
      const userDoc = await ctx.db.get(svc.userId);
      if (!userDoc || userDoc.orgId !== svc.orgId) {
        throw new Error("User is not a member of the specified organization for service creation");
      }
      const insertedServiceId = await ctx.db.insert("services", {
        orgId: svc.orgId,
        name: svc.name, 
        basePrice: svc.price,
        type: svc.type ?? "base",
        description: svc.description ?? "", // Ensure description is a string
        category: svc.category ?? "Uncategorized", // Ensure category is a string
        durationMinutes: svc.durationMinutes ?? 0, // Ensure durationMinutes is a number
        isActive: svc.isActive ?? true,
        imageUrl: svc.imageUrl,
      });
      created.services.push(insertedServiceId);
    }

    // Create assessments using shared model helper
    for (const a of args.assessments ?? []) {
      const insertedAssessmentId = await createAssessmentModel(ctx, a);
      created.assessments.push(insertedAssessmentId);
    }

    return created;
  },
});
