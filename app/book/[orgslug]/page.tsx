// app/book/[orgSlug]/page.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

// (You'll need to create these UI components or use shadcn-ui)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function PublicBookingPage({ params }: { params: { orgSlug: string } }) {
  // State for the user's selections
  const [selectedServices, setSelectedServices] = useState<Id<"services">[]>([]);
  const [selectedModifiers, setSelectedModifiers] = useState<Id<"modifiers">[]>([]);

  // Fetch the data for this organization
  const orgData = useQuery(api.public.getOrgForBooking, { slug: params.orgSlug });

  // Fetch the real-time estimate based on selections
  const estimate = useQuery(api.estimates.calculate, 
    (orgData && (selectedServices.length > 0 || selectedModifiers.length > 0)) ? {
      orgId: orgData.orgId,
      serviceIds: selectedServices,
      modifierIds: selectedModifiers,
    } : "skip");

  const handleServiceChange = (serviceId: Id<"services">) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleModifierChange = (modifierId: Id<"modifiers">) => {
    setSelectedModifiers(prev =>
      prev.includes(modifierId)
        ? prev.filter(id => id !== modifierId)
        : [...prev, modifierId]
    );
  };

  // TODO: Add a final step for user details and submission

  if (orgData === undefined) return <div>Loading...</div>;
  if (orgData === null) return <div>Organization not found.</div>;

  const baseServices = orgData.services?.filter(s => s.type === 'base');
  const addOnServices = orgData.services?.filter(s => s.type === 'add_on');

  return (
    <div className="container grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
      {/* --- Main Selection Area --- */}
      <div className="md:col-span-2 space-y-8">
        <div>
          <h2 className="text-2xl font-bold">1. Select Your Main Service</h2>
          <div className="space-y-2 mt-4">
            {baseServices?.map(service => (
              <div key={service._id} className="flex items-center gap-2">
                <Checkbox
                  id={service._id}
                  checked={selectedServices.includes(service._id)}
                  onCheckedChange={() => handleServiceChange(service._id)}
                />
                <label htmlFor={service._id} className="cursor-pointer">
                  {service.name} - ${service.basePrice.toFixed(2)}
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold">2. Vehicle Condition</h2>
           <div className="space-y-2 mt-4">
            {orgData.modifiers?.map(modifier => (
              <div key={modifier._id} className="flex items-center gap-2">
                <Checkbox
                  id={modifier._id}
                  checked={selectedModifiers.includes(modifier._id)}
                  onCheckedChange={() => handleModifierChange(modifier._id)}
                />
                <label htmlFor={modifier._id} className="cursor-pointer">
                  {modifier.name} - ${modifier.price.toFixed(2)}
                  <p className="text-sm text-muted-foreground">{modifier.description}</p>
                </label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold">3. Choose Add-Ons</h2>
          <div className="space-y-2 mt-4">
            {addOnServices?.map(service => (
              <div key={service._id} className="flex items-center gap-2">
                <Checkbox
                  id={service._id}
                  checked={selectedServices.includes(service._id)}
                  onCheckedChange={() => handleServiceChange(service._id)}
                />
                <label htmlFor={service._id} className="cursor-pointer">
                  {service.name} - ${service.basePrice.toFixed(2)}
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Real-Time Estimate Sidebar --- */}
      <div className="md:col-span-1">
        <Card className="sticky top-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4">Live Estimate</h3>
            {estimate ? (
              <div className="space-y-2">
                {estimate.lineItems.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.name}</span>
                    <span>${item.price.toFixed(2)}</span>
                  </div>
                ))}
                <hr className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Subtotal</span>
                  <span>${estimate.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${estimate.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold mt-2">
                  <span>Total</span>
                  <span>${estimate.total.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <p>Select a service to begin.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}