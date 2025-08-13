// convex/estimates.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

// The "algorithm" for real-time quote calculation
/**
 * Calculates a real-time estimate for services and modifiers.
 *
 * @param ctx - The Convex query context.
 * @param args - The arguments for the query, including organization ID, service IDs, and modifier IDs.
 * @returns An object containing line items, subtotal, discount, tax, and total.
 */
export const calculate = query({
  args: {
    orgId: v.id("organizations"),
    serviceIds: v.array(v.id("services")),
    modifierIds: v.array(v.id("modifiers")),
  },
  returns: v.object({
    lineItems: v.array(
      v.object({
        type: v.string(),
        name: v.string(),
        price: v.number(),
      })
    ),
    subtotal: v.number(),
    discount: v.number(),
    tax: v.number(),
    total: v.number(),
  }),
  handler: async (ctx, args) => {
    const lineItems: { type: string; name: string; price: number }[] = [];
    let subtotal = 0;

    // Batch fetch all services and modifiers
    const [services, modifiers] = await Promise.all([
      Promise.all(args.serviceIds.map(id => ctx.db.get(id))),
      Promise.all(args.modifierIds.map(id => ctx.db.get(id))),
    ]);

    // Process services
    for (const service of services) {
      if (!service || service.orgId !== args.orgId) continue;
      const price = Number(service.basePrice ?? service.price ?? 0);
      if (!Number.isFinite(price) || price < 0) continue;
      lineItems.push({ type: "service", name: service.name, price });
      subtotal += price;
    }

    // Process modifiers
    for (const modifier of modifiers) {
      if (!modifier || modifier.orgId !== args.orgId) continue;
      const price = Number(modifier.price ?? 0);
      if (!Number.isFinite(price) || price < 0) continue;
      lineItems.push({ type: "modifier", name: modifier.name, price });
      subtotal += price;
    }

    // --- Business Logic ---
    // In the future, you could fetch these values from the organization's settings
    const TAX_RATE = 0.0825; // Example: 8.25%
    const DISCOUNT_PERCENTAGE = 0; // Example: No discount by default

    const round2 = (n: number) => Math.round(n * 100) / 100;
    const discount = round2(subtotal * DISCOUNT_PERCENTAGE);
    const taxableSubtotal = Math.max(0, round2(subtotal - discount));
    const tax = round2(taxableSubtotal * TAX_RATE);
    const total = round2(taxableSubtotal + tax);
    return {
      lineItems,
      subtotal,
      discount,
      tax,
      total,
    };
  },
});
