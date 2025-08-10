// app/assessment/new/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useOrganization, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
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
import ClientSelector from "./ClientSelector";

const formSchema = z.object({
  clientName: z.string().min(2, "Name must be at least 2 characters."),
  clientEmail: z.string().email("Invalid email address.").optional().or(z.literal('')),
  clientPhone: z.string().optional(),
  carMake: z.string().min(2, "Make is required."),
  carModel: z.string().min(2, "Model is required."),
  carYear: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  services: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one service.",
  }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const serviceOptions = [
    { id: "interior-detail", label: "Full Interior Detail" },
    { id: "exterior-wash", label: "Exterior Hand Wash & Wax" },
    { id: "paint-correction", label: "Paint Correction" },
    { id: "ceramic-coating", label: "Ceramic Coating" },
];

/**
 * Page for creating a new vehicle assessment.
 *
 * This page displays a form with input fields for client name, car make, car model, car year, services requested, and additional notes.
 * When the form is submitted, the page will call the `createAssessment` mutation to create a new assessment document in the database.
 * If the mutation is successful, the page will redirect to a dashboard page.
 */
export default function NewAssessmentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createAssessment = useMutation(api.assessments.createAssessment);
  const router = useRouter();
  const { organization } = useOrganization();
  const { userId } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      carMake: "",
      carModel: "",
      carYear: new Date().getFullYear(),
      services: [],
      notes: "",
    },
  });

  async function onSubmit(values: FormValues) {
    if (!organization?.id || !userId) {
      toast.error("Organization and user must be identified to create an assessment.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createAssessment({
        orgId: organization.id as Id<"organizations">,
        userId: userId as Id<"users">,
        client: {
          name: values.clientName,
          email: values.clientEmail,
          phone: values.clientPhone,
        },
        carMake: values.carMake,
        carModel: values.carModel,
        carYear: values.carYear,
        services: values.services,
        notes: values.notes,
      });

      toast.success("Assessment created successfully!");
      form.reset();
      router.push(`/${organization.id}/dashboard`);

    } catch (error) {
      toast.error("Failed to create assessment. Please try again.");
      console.error("Failed to create assessment:", error);
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

            <ClientSelector form={form} />

            <div className="space-y-4 p-4 border rounded-md">
              <h3 className="text-lg font-medium">Vehicle Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="carMake" render={({ field }) => (<FormItem><FormLabel>Car Make</FormLabel><FormControl><Input placeholder="Toyota" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="carModel" render={({ field }) => (<FormItem><FormLabel>Car Model</FormLabel><FormControl><Input placeholder="Camry" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="carYear" render={({ field }) => (<FormItem><FormLabel>Year</FormLabel><FormControl><Input type="number" placeholder="2024" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            </div>

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
                              <Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => {
                                return checked ? field.onChange([...field.value, item.id]) : field.onChange(field.value?.filter((value) => value !== item.id));
                              }} />
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

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., specific stains, scratches, or areas of concern" className="resize-none" {...field} />
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