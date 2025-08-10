// app/assessment/new/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useOrganization, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";

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
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

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
 * Renders a form page for creating a new vehicle assessment, allowing users to search for or enter client information, specify vehicle details, select requested services, and add notes.
 *
 * Submitting the form creates a new assessment record and redirects to the organization's dashboard upon success.
 */
export default function NewAssessmentPage() {
  const createAssessment = useMutation(api.assessments.createAssessment);
  const router = useRouter();
  const { organization } = useOrganization();
  const { userId } = useAuth();

  const [searchClientName, setSearchClientName] = useState("");
  const [debouncedSearchClientName, setDebouncedSearchClientName] = useState("");
  const [isClientSelectorOpen, setClientSelectorOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<Id<"clients"> | null>(null);

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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchClientName(searchClientName);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchClientName]);

  const searchResults = useQuery(
    api.clients.searchByName,
    debouncedSearchClientName && organization?.id
      ? { name: debouncedSearchClientName, orgId: organization.id as Id<"organizations"> }
      : "skip"
  );

  const handleClientSelect = (client: { _id: Id<"clients">, name: string, email?: string | null, phone?: string | null }) => {
    form.setValue("clientName", client.name);
    form.setValue("clientEmail", client.email ?? "");
    form.setValue("clientPhone", client.phone ?? "");
    setSelectedClientId(client._id);
    setClientSelectorOpen(false);
    setSearchClientName("");
  };

  /**
   * Submits the new assessment form data to create a vehicle assessment for the current organization and user.
   *
   * If the organization or user ID is missing, the submission is aborted.
   *
   * @param values - The validated form values containing client information, vehicle details, selected services, and notes
   */
  async function onSubmit(values: FormValues) {
    if (!organization?.id || !userId) {
      console.error("No organization or user ID found");
      return;
    }

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

    form.reset();
    router.push(`/${organization.id}/dashboard`);
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

            <div className="space-y-4 p-4 border rounded-md">
              <h3 className="text-lg font-medium">Client Information</h3>
              <Popover open={isClientSelectorOpen} onOpenChange={setClientSelectorOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                      <FormField
                        control={form.control}
                        name="clientName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client Name</FormLabel>
                            <Input
                              placeholder="Search or enter new client..."
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setSearchClientName(e.target.value);
                                setSelectedClientId(null);
                              }}
                            />
                          </FormItem>
                        )}
                      />
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandList>
                      {searchResults && searchResults.length > 0 ? (
                        <CommandGroup heading="Existing Clients">
                          {searchResults.map((client) => (
                            <CommandItem
                              key={client._id}
                              onSelect={() => handleClientSelect(client)}
                              value={client.name}
                            >
                              <Check className={cn("mr-2 h-4 w-4", selectedClientId === client._id ? "opacity-100" : "opacity-0")} />
                              {client.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ) : (
                        <CommandEmpty>
                          {debouncedSearchClientName ? "No clients found. Continue typing to create a new client." : "Start typing to search for a client."}
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
                      <Input placeholder="client@email.com" {...field} readOnly={!!selectedClientId} />
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
                      <Input placeholder="(123) 456-7890" {...field} readOnly={!!selectedClientId} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <Button type="submit">Submit for Review</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}