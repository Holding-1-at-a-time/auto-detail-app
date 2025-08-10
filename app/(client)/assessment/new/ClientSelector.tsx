"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { useOrganization } from "@clerk/nextjs";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Check } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

// Re-defining the schema part needed for the form values type
const formSchema = z.object({
  clientName: z.string().min(2, "Name must be at least 2 characters."),
  clientEmail: z.string().email("Invalid email address.").optional().or(z.literal('')),
  clientPhone: z.string().optional(),
  carMake: z.string(), // Other fields are not needed here, just for type consistency
  carModel: z.string(),
  carYear: z.number(),
  services: z.array(z.string()),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

interface ClientSelectorProps {
  form: UseFormReturn<FormValues>;
}

export default function ClientSelector({ form }: ClientSelectorProps) {
  const { organization } = useOrganization();
  const [searchClientName, setSearchClientName] = useState("");
  const [debouncedSearchClientName, setDebouncedSearchClientName] = useState("");
  const [isClientSelectorOpen, setClientSelectorOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<Id<"clients"> | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchClientName(searchClientName);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchClientName]);

  // Resolve the Convex organization doc (uses Clerk identity under the hood)
  const orgDoc = useQuery(api.organizations.getOrganization);

  const searchResults = useQuery(
    api.clients.searchByName,
    debouncedSearchClientName.length >= 2 && orgDoc?._id
      ? { name: debouncedSearchClientName, orgId: orgDoc._id }
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

  return (
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
                    placeholder="Search or enter new client..."
                    {...field}
                    onFocus={() => setClientSelectorOpen(true)}
                    onChange={(e) => {
                      field.onChange(e);
                      setSearchClientName(e.target.value);
                      setSelectedClientId(null);
                      setClientSelectorOpen(true);
                    }}
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
              {searchResults === undefined && debouncedSearchClientName && (
                <div className="py-6 text-center text-sm">Loading...</div>
              )}
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
  );
}
