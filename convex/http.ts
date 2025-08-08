// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
  path: "/api/webhooks/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Error occurred", { status: 400 });
    }

    console.log(`Received Clerk webhook event: ${event.type}`);

    // The 'data' payload of the event can be typed for better safety
    const data: WebhookEvent["data"] = event.data;

    // Use a switch statement to handle different event types
    switch (event.type) {
      // User Events
      case "user.created":
      case "user.updated":
        // await ctx.runMutation(internal.clerk.fulfillUser, { data });
        break;
      case "user.deleted":
        // await ctx.runMutation(internal.clerk.deleteUser, { id: data.id });
        break;

      // Organization Events
      case "organization.created":
      case "organization.updated":
        // await ctx.runMutation(internal.clerk.fulfillOrganization, { data });
        break;
      case "organization.deleted":
        // await ctx.runMutation(internal.clerk.deleteOrganization, { id: data.id });
        break;

      // Subscription Events (assuming you use Clerk Billing)
      case "subscription.created":
      case "subscription.updated":
      case "subscription.active":
      case "subscription.past_due":
      case "subscriptionItem.updated": // etc.
        // await ctx.runMutation(internal.clerk.updateSubscription, { data });
        break;      // Default case for all other events
      default: {
        // Log unhandled events for future development without breaking the webhook
        console.log("Ignored Clerk webhook event:", event.type);
      }
    }

    return new Response(null, { status: 200 });
  }),
});

// Function to validate the webhook request authenticity
async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payloadString, svixHeaders) as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook event:", error);
    return null;
  }
}

export default http;