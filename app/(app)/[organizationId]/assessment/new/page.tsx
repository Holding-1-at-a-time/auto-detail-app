"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import * as Sentry from "@sentry/nextjs";

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
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Combobox } from "@/components/ui/combobox";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";


// Strongly typed form values without unsafe casts
export type FormValues = {
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientId?: string; // Will hold Id<"clients"> as string from selection
  carMake: string;
  carModel: string;
  carYear: number;
  serviceId: string; // Will hold Id<"services"> as string from selection
  notes?: string;
};

// Form schema with strong validation and correct coercion/normalization
const formSchema = z.object({
  clientName: z.string().min(2, "Name must be at least 2 characters."),
  clientEmail: z
    .string()
    .trim()
    .email("Invalid email address.")
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  clientPhone: z.string().optional(),
  clientId: z.string().optional(),
  carMake: z.string().min(2, "Make is required."),
  carModel: z.string().min(2, "Model is required."),
  carYear: z
    .coerce
    .number()
    .int("Year must be an integer")
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future beyond next year"),
  serviceId: z.string().min(1, "You must select a service."),
  notes: z.string().optional(),
});

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

  // Load services for current org and set up client search state
  const services = useQuery(
    api.services.getServicesForCurrentOrg,
    orgDoc?._id ? { orgId: orgDoc._id } : "skip"
  );

  const [searchClientName, setSearchClientName] = useState("");
  const [debouncedSearchClientName, setDebouncedSearchClientName] = useState("");
  const [isClientSelectorOpen, setClientSelectorOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<Id<"clients"> | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchClientName(searchClientName), 300);
    return () => clearTimeout(handler);
  }, [searchClientName]);

  const clientSearchResults = useQuery(
    api.clients.searchByName,
    debouncedSearchClientName.length >= 2 && orgDoc?._id
      ? { name: debouncedSearchClientName, orgId: orgDoc._id }
      : "skip"
  );

  const serviceOptions = useMemo(
    () => services?.map((s) => ({ value: s._id, label: s.name })) ?? [],
    [services]
  );

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
      serviceId: "",
      notes: "",
    },
  });

  /**
   * Handles form submission by calling the createAssessment mutation.
   * If the mutation is successful, resets the form and redirects to the
   * dashboard page for the organization. If the mutation fails, displays
   * an error message to the user and logs the error to the console.
   */
  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    if (!orgDoc?._id || !currentUser?._id) {
      toast.error("Organization and user must be identified to create an assessment.");
      return;
    }

    setIsSubmitting(true);
    await Sentry.startSpan(
      {
        op: "ui.submit",
        name: "Create Assessment Submit",
      },
      async (span) => {
        try {
          span?.setAttribute?.("orgId", orgDoc._id);
          span?.setAttribute?.("userId", currentUser._id);
          span?.setAttribute?.("hasClientId", Boolean(selectedClientId));

          if (!selectedClientId) {
            toast.error("Select an existing client to proceed.");
            return;
          }

          if (!values.serviceId) {
            toast.error("Please select a service.");
            return;
          }

          const selectedService = services?.find((s) => s._id === values.serviceId);
          if (!selectedService) {
            toast.error("Selected service is invalid.");
            return;
          }

          await createAssessment({
            orgId: orgDoc._id,
            userId: currentUser._id,
            client: {
              name: values.clientName,
              email: values.clientEmail,
              phone: values.clientPhone,
            },
            carMake: values.carMake,
            carModel: values.carModel,
            carYear: values.carYear,
            notes: values.notes,
            clientId: selectedClientId,
            serviceId: selectedService._id,
          });

          toast.success("Assessment created successfully!");
          form.reset();

          // Preserve existing routing convention using Clerk org id if available
          const dest = organization?.id ? `/${organization.id}/dashboard` : "/";
          router.push(dest);
        } catch (err: unknown) {
          Sentry.captureException(err);
          const message = err instanceof Error ? err.message : "Unknown error";
          toast.error(`Failed to create assessment: ${message}`);
        } finally {
          setIsSubmitting(false);
        }
      }
    );
  };

  if (orgDoc === undefined || currentUser === undefined) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>New Vehicle Assessment</CardTitle>
          <CardDescription>Loading context...</CardDescription>
        </CardHeader>
        <CardContent>Loading...</CardContent>
      </Card>
    );
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
            <div className="space-y-4 p-4 border rounded-md">
              <h3 className="text-lg font-medium">Client Information</h3>
              <Popover open={isClientSelectorOpen} onOpenChange={setClientSelectorOpen}>
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <PopoverTrigger asChild>
                          <Input
                            placeholder="Search or enter existing client..."
                            {...field}
                            onFocus={() => setClientSelectorOpen(true)}
                            onChange={(e) => {
                              field.onChange(e);
                              setSearchClientName(e.target.value);
                              setSelectedClientId(null);
                              setClientSelectorOpen(true);
                            }}
                            disabled={isSubmitting}
                          />
                        </PopoverTrigger>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandList>
                      {clientSearchResults === undefined && debouncedSearchClientName && (
                        <div className="py-6 text-center text-sm">Loading...</div>
                      )}
                      {clientSearchResults && clientSearchResults.length > 0 ? (
                        <CommandGroup heading="Existing Clients">
                          {clientSearchResults.map((client) => (
                            <CommandItem
                              key={client._id}
                              onSelect={() => {
                                form.setValue("clientName", client.name);
                                form.setValue("clientEmail", client.email ?? "");
                                form.setValue("clientPhone", client.phone ?? "");
                                setSelectedClientId(client._id);
                                form.setValue("clientId", client._id);
                                setClientSelectorOpen(false);
                                setSearchClientName("");
                              }}
                              value={client.name}
                            >
                              <Check className={cn("mr-2 h-4 w-4", selectedClientId === client._id ? "opacity-100" : "opacity-0")} />
                              {client.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ) : (
                        <CommandEmpty>
                          {debouncedSearchClientName ? "No clients found. Continue typing to search." : "Start typing to search for a client."}
                        </CommandEmpty>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <FormField
                control={form.control}
                name="clientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Email</FormLabel>
                    <FormControl>
                      <Input placeholder="client@email.com" {...field} readOnly={!!selectedClientId} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clientPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(123) 456-7890" {...field} readOnly={!!selectedClientId} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                        <Input placeholder="Toyota" {...field} disabled={isSubmitting} />
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
                        <Input placeholder="Camry" {...field} disabled={isSubmitting} />
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
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Service Selection */}
            <div className="space-y-4 p-4 border rounded-md">
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Service</FormLabel>
                      <FormDescription>Select one service.</FormDescription>
                    </div>
                    <FormControl>
                      <Combobox
                        options={serviceOptions}
                        value={field.value ?? ""}
                        onChange={(val) => field.onChange(val ?? "")}
                        placeholder={
                          services === undefined
                            ? "Loading services..."
                            : serviceOptions.length === 0
                              ? "No services available"
                              : "Select a service..."
                        }
                      />
                    </FormControl>
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
                      disabled={isSubmitting}
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
