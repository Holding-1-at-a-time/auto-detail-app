// app/(app)/[organizationId]/pricing/page.tsx
"use client";

import { PricingTable } from "@clerk/nextjs";
import { Protect } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Our Plans</h1>
      {/* This component will only be visible to organization admins, 
        who are the only ones who can manage billing. 
      */}
      <Protect role="org:admin">
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          {/* The `forOrganizations` prop is crucial. It tells the component 
            to display the B2B plans you just created. 
          */}
          <PricingTable forOrganizations />
        </div>
      </Protect>
    </div>
  );
}