"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import ClientSelector from "./clientSelector";

// Service options and a strict union of service IDs
const serviceOptions = [
  { id: "interior-detail", label: "Full Interior Detail" },
  { id: "exterior-wash", label: "Exterior Hand Wash & Wax" },
  { id: "paint-correction", label: "Paint Correction" },
  { id: "ceramic-coating", label: "Ceramic Coating" },
] as const;
const serviceId = [
  "interior-detail",
  "exterior-wash",
  "paint-correction",
  "ceramic-coating",
] as const;

// Form schema with strong validation and correct type coercion
const formSchema = z.object({
  clientName: z.string().min(2, "Name must be at least 2 characters."),
  clientEmail: z.string().email("Invalid email address.").optional().or(z.literal("")),
  clientPhone: z.string().optional(),
  clientId: z.string().optional(),
  carMake: z.string().min(2, "Make is required."),
  carModel: z.string().min(2, "Model is required."),
  carYear: z.number().int("Year must be an integer").min(1900, "Year must be 1900 or later").max(new Date().getFullYear() + 1, "Year cannot be in the future beyond next year"),
  services: z.array(z.enum(serviceId)).min(1, "You have to select at least one service."),
  notes: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

/**
 * Page for creating a new vehicle assessment.
 *
 * This page displays a form with input fields for client data, vehicle info,
 * services requested, and notes. On submit, it calls the createAssessment
 * mutation using resolved Convex IDs for the organization and user.
 */
export default function NewAssessmentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createAssessment = useMutation(api.assessments.createAssessment);
  const router = useRouter();
  const { organization } = useOrganization(); // Used for client-side routing only

  // Resolve Convex organization and current user documents
  const orgDoc = useQuery(api.organizations.getOrganization);
  const currentUser = useQuery(api.users.getCurrentUser);

  const form = useForm<FormValues>({

    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientId: undefined,
      carMake: "",
      carModel: "",
      carYear: new Date().getFullYear(),
      services: [],
      notes: "",
    },
  });

  /**
   * Handles form submission by calling the createAssessment mutation.
   * If the mutation is successful, resets the form and redirects to the
   * dashboard page for the organization. If the mutation fails, displays
   * an error message to the user and logs the error to the console.
   */
  async function onSubmit(values: FormValues) {
    if (!orgDoc?._id || !currentUser?._id) {
      toast.error("Organization and user must be identified to create an assessment.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createAssessment({
        orgId: orgDoc._id,
        userId: currentUser._id,
        client: {
          name: values.clientName,
          email: values.clientEmail || undefined,
          phone: values.clientPhone || undefined,
        },
        carMake: values.carMake,
        carModel: values.carModel,
        carYear: values.carYear,
        notes: values.notes || undefined,
        clientId: values.clientId as Id<"clients">,
        serviceId: values.services[0] as Id<"services">
      });

      toast.success("Assessment created successfully!");
      form.reset();

      // Preserve existing routing convention using Clerk org id if available
      const dest = organization?.id ? `/${organization.id}/dashboard` : "/";
      router.push(dest);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to create assessment: ${message}`);
      // eslint-disable-next-line no-console
      console.error("Failed to create assessment:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>New Vehicle Assessment</CardTitle>
        <CardDescription>
          Fill out the details below. Start by searching for an existing client or entering a new one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Client selection and details */}
            <ClientSelector form={form} />

            {/* Vehicle Information */}
            <div className="space-y-4 p-4 border rounded-md">
              <h3 className="text-lg font-medium">Vehicle Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="carMake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Car Make</FormLabel>
                      <FormControl>
                        <Input placeholder="Toyota" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="carModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Car Model</FormLabel>
                      <FormControl>
                        <Input placeholder="Camry" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="carYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2024"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === "" ? undefined : Number(val));
                          }}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Services Requested */}
            <div className="space-y-4 p-4 border rounded-md">
              <FormField
                control={form.control}
                name="services"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Services Requested</FormLabel>
                      <FormDescription>Select all that apply.</FormDescription>
                    </div>
                    {serviceOptions.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="services"
                        render={({ field }) => (
                          <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  const isChecked = checked === true;
                                  return isChecked
                                    ? field.onChange([...(field.value || []), item.id])
                                    : field.onChange((field.value || []).filter((v) => v !== item.id));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{item.label}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., specific stains, scratches, or areas of concern"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
