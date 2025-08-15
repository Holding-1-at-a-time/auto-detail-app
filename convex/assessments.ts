import { query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const listAssessmentsByOrg = query({
  args: { orgId: v.id("organizations") },
  returns: v.array(
    v.object({
      _id: v.id("assessments"),
      _creationTime: v.number(),
      clientName: v.string(),
      carMake: v.string(),
      carModel: v.string(),
      carYear: v.number(),
      status: v.union(v.literal("pending"), v.literal("reviewed"), v.literal("complete")),
    }),
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    // TODO: Enforce that the caller is a member (or otherwise authorized)
    // for args.orgId using your existing membership/ACL model before querying.
    const assessments = await ctx.db
      .query("assessments")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
    return assessments.map((assessment) => ({
      _id: assessment._id,
      _creationTime: assessment._creationTime,
      clientName: assessment.clientName,
      carMake: assessment.carMake,
      carModel: assessment.carModel,
      carYear: assessment.carYear,
      status: assessment.status,
    }));
  },
});