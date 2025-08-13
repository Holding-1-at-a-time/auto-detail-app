// convex/estimates.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

// The "algorithm" for real-time quote calculation
export const calculate = query({
  args: {
    orgId: v.string(),
    serviceIds: v.array(v.id("services")),
    modifierIds: v.array(v.id("modifiers")),
  },
  returns: v.object({
    lineItems: v.array(v.object({
      type: v.string(),
      name: v.string(),
      price: v.number()
    })),
    subtotal: v.number(),
    discount: v.number(),
    tax: v.number(),
    total: v.number()
  }),
  handler: async (ctx, args) => {
    const lineItems: { type: string; name: string; price: number }[] = [];
    let subtotal = 0;

    // Fetch and add selected services to the subtotal
    for (const serviceId of args.serviceIds) {
      const service = await ctx.db.get(serviceId);
      if (service && service.orgId === args.orgId) {
        lineItems.push({ type: "service", name: service.name, price: service.basePrice });
        subtotal += service.basePrice;
      }
    }

    // Fetch and add selected modifiers to the subtotal
    for (const modifierId of args.modifierIds) {
      const modifier = await ctx.db.get(modifierId);
      if (modifier && modifier.orgId === args.orgId) {
        lineItems.push({ type: "modifier", name: modifier.name, price: modifier.price });
        subtotal += modifier.price;
      }
    }

    // --- Business Logic ---
    // In the future, you could fetch these values from the organization's settings
    const TAX_RATE = 0.0825; // Example: 8.25%
    const DISCOUNT_PERCENTAGE = 0; // Example: No discount by default

    const discount = subtotal * DISCOUNT_PERCENTAGE;
    const taxableSubtotal = subtotal - discount;
    const tax = taxableSubtotal * TAX_RATE;
    const total = taxableSubtotal + tax;

    return {
      lineItems,
      subtotal,
      discount,
      tax,
      total,
    };
  },
});
