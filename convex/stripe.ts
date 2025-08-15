import { mutation, query, action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const createExpressAccount = mutation({
  args: {
    organizationId: v.id("organizations"),
    email: v.string(),
    businessName: v.string(),
    businessType: v.union(v.literal("individual"), v.literal("company")),
  },
  returns: v.object({
    accountId: v.string(),
    onboardingUrl: v.string(),
  }),
  handler: async (ctx, args) => {
    const response = await fetch("https://api.stripe.com/v2/core/accounts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY!}`,
        "Stripe-Version": "2025-04-30.preview",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contact_email: args.email,
        display_name: args.businessName,
        dashboard: "full",
        identity: {
          business_details: {
            registered_name: args.businessName,
          },
          country: "us",
          entity_type: args.businessType,
        },
        configuration: {
          customer: {
            capabilities: {
              automatic_indirect_tax: {
                requested: true,
              },
            },
          },
          merchant: {
            capabilities: {
              card_payments: {
                requested: true,
              },
            },
          },
        },
        defaults: {
          currency: "usd",
          responsibilities: {
            fees_collector: "stripe",
            losses_collector: "stripe",
          },
          locales: ["en-US"],
        },
        include: [
          "configuration.customer",
          "configuration.merchant",
          "identity",
          "requirements",
        ],
      }),
    });

    const account = await response.json();

    if (!response.ok) {
      console.error(account);
      throw new Error("Failed to create Stripe account.");
    }

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/stripe/refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/stripe/return`,
      type: "account_onboarding",
    });

    await ctx.db.patch(args.organizationId, {
      stripeAccountId: account.id,
      stripeCustomerId: account.id, // The account id is the customer id in this case
    });

    return {
      accountId: account.id,
      onboardingUrl: accountLink.url,
    };
  },
});
