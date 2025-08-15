import { query } from "./_generated/server";
import { v } from "convex/values";

export const getAssessmentsInRange = query({
  args: {
    orgId: v.id("organizations"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const assessments = await ctx.db
      .query("assessments")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .filter((q) => q.gte(q.field("scheduledFor"), args.startDate))
      .filter((q) => q.lte(q.field("scheduledFor"), args.endDate))
      .collect();
    type Assessment = {
      _id: string;
      _creationTime: number;
      orgId: string;
      clientId: string;
      scheduledFor: number;
      clientName: string;
      carMake: string;
      carModel: string;
      carYear: number;
      status: string;
    };
    return assessments.map((assessment: Assessment) => ({
      _id: assessment._id,
      _creationTime: assessment._creationTime,
      orgId: assessment.orgId,
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