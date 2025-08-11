// app/book/[orgSlug]/page.tsx
"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";
import { string } from "zod";
import { useUser } from "@clerk/clerk-react";

export default function PublicBookingPage({
  params,
}: {
  params: { orgSlug: string };
}) {
  const orgData = useQuery(api.public.getOrgForBooking, { slug: params.orgSlug });
  const createAssessment = useMutation(api.public.publicCreateAssessment);
  const { user } = useUser();

  if (orgData === null) {
    return <div>Organization not found.</div>;
  }

  if (orgData === undefined) {
    return <div>Loading...</div>;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const serviceIds = formData
      .getAll("serviceIds")
      .map((id) => {
        // Ensure id is a string and matches expected format (add your own validation if needed)
        if (typeof id === "string" && id.trim() !== "") {
          return id as Id<"services">;
        }
        return null;
      })
      .filter((id): id is Id<"services"> => id !== null);

    if (!user) {
      console.error("User is not authenticated");
      return;
    }

    const carYearRaw = formData.get("carYear");
    const carYear = parseInt(typeof carYearRaw === "string" ? carYearRaw.trim() : "", 10);

    // Validate carYear: must be an integer and a reasonable year (e.g., between 1900 and next year)
    const currentYear = new Date().getFullYear();
    if (
      !carYearRaw ||
      isNaN(carYear) ||
      !Number.isInteger(carYear) ||
      String(carYear) !== (typeof carYearRaw === "string" ? carYearRaw.trim() : "") ||
      carYear < 1900 ||
      carYear > currentYear + 1
    ) {
      alert("Please enter a valid car year (must be a whole number between 1900 and next year).");
      return;
    }

    createAssessment({
      orgId: orgData.orgId as Id<"organizations">,
      clientName: formData.get("clientName") as string,
      carMake: formData.get("carMake") as string,
      carModel: formData.get("carModel") as string,
      carYear: carYear,
      serviceId: formData.get("serviceId") as Id<"services">,
      notes: formData.get("notes") as string,
      userId: user.id as Id<"users">
    }).then(() => {
      alert("Assessment submitted successfully!");
      event.currentTarget.reset();
    }).catch((error) => {
      console.error("Failed to submit assessment:", error);
      alert("Failed to submit assessment. Please try again or contact support.");
    });
  };

  return (
    <div className="container py-12">
      <div className="text-center mb-8">
        <img src={orgData.orgImageUrl} alt={`${orgData.orgName} logo`} className="w-24 h-24 rounded-full mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Book a Service with {orgData.orgName}</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
        <Input name="clientName" placeholder="Your Full Name" required />
        <div className="flex gap-4">
          <Input name="carMake" placeholder="Car Make" required />
          <Input name="carModel" placeholder="Car Model" required />
          <Input name="carYear" type="number" placeholder="Year" required />
        </div>
        <div>
          <h3 className="font-semibold mb-2">Select Services:</h3>
          <div className="space-y-2">

            {orgData.services.map((service: { _id: string; name: string; price: number }) => (
              <div key={String(service._id)} className="flex items-center gap-2">
                <Checkbox id={String(service._id)} name="serviceIds" value={String(service._id)} />
                <label htmlFor={String(service._id)}>{service.name} (${service.price})</label>
              </div>
            ))}
          </div>
        </div>
        <Textarea name="notes" placeholder="Any additional notes about your vehicle's condition?" />
        <Button type="submit" className="w-full">Submit Assessment</Button>
      </form>
    </div>
  );
}