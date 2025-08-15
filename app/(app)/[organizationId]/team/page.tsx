// app/(app)/[organizationId]/team/page.tsx
"use client";

import { Protect } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// A fallback component to show to users on the wrong plan.
const UpgradePlanFallback = () => (
  <div>
    <h2 className="text-2xl font-bold">Upgrade to Access Team Features</h2>
    <p className="text-muted-foreground my-4">
      Inviting team members is only available on the Growth plan and above.
    </p>
    <Button asChild>
      <Link href="../pricing">View Plans</Link>
    </Button>
  </div>
);

export default function TeamPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Team</h1>
      {/* The <Protect> component wraps your feature. It checks if the active
        organization's plan has the specified feature. 
        If not, it renders the fallback component.
      */}
      <Protect feature="team_invites" fallback={<UpgradePlanFallback />}>
        {/* This content is only visible to organizations on a plan 
          that includes the "team_invites" feature.
        */}
        <div>
          <p>Your team members are listed here.</p>
          {/* Add your UI for inviting and managing team members */}
        </div>
      </Protect>
    </div>
  );
}