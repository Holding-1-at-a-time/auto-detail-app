"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { useOrganization } from "@clerk/nextjs";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./page";
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

interface ClientSelectorProps {
  form: UseFormReturn<FormValues>;
}

/**
 * A component to select a client from a list of existing clients or create a new one.
 * The component uses the Convex `searchByName` API to search for clients based on the user's input.
 * If the user selects a client from the list, the component will set the `clientId` form field to the `_id` of the selected client.
 * If the user types in a new client name, the component will create a new client and set the `clientId` form field to the `_id` of the new client.
 * The component also supports typing in a client email or phone number, and will set the `clientEmail` and `clientPhone` form fields accordingly.
 * The component requires the `form` prop to be passed from the parent component, which is a `react-hook-form` form.
 * The component also requires the `organization` prop to be passed from the parent component, which is the Convex organization document.
 * The component will use the `organization._id` to search for clients in the same organization.
 * @param {{ form: UseFormReturn<FormValues> }} props
 * @returns {JSX.Element}
 */
export default function ClientSelector({ form }: ClientSelectorProps) {
  useOrganization();
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
    form.setValue("clientId", client._id);
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
