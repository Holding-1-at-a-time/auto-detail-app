import { query } from "./_generated/server";
import { v } from "convex/values";

export const getAssessmentsInRange = query({
  args: {
    orgId: v.id("organizations"),
    startDate: v.number(),
    endDate: v.number(),
  },
  returns: v.array(
    v.object({
      _id: v.id("assessments"),
      _creationTime: v.number(),
      orgId: v.id("organizations"),
      clientId: v.id("clients"),
      scheduledFor: v.number(),
      clientName: v.string(),
      carMake: v.string(),
      carModel: v.string(),
      carYear: v.number(),
      status: v.union(v.literal("pending"), v.literal("reviewed"), v.literal("complete")),
    }),
  ),
  handler: async (ctx, args) => {
    const assessments = await ctx.db
      .query("assessments")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .filter((q) => q.gte(q.field("scheduledFor"), args.startDate))
      .filter((q) => q.lte(q.field("scheduledFor"), args.endDate))
      .collect();
    return assessments.map((assessment) => ({
      _id: assessment._id,
      _creationTime: assessment._creationTime,
      clientId: assessment.clientId,
      scheduledFor: assessment.scheduledFor,
      clientName: assessment.clientName,
      carMake: assessment.carMake,
      carModel: assessment.carModel,
      carYear: assessment.carYear,
      status: assessment.status,
    }));
  },
});