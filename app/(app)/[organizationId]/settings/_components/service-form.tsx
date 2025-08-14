// app/(app)/[organizationId]/settings/_components/service-form.tsx
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface ServiceFormProps {
  service?: Doc<"services">; // Optional service prop for editing
  onClose: () => void;
}

/**
 * Form component for creating a new service or editing an existing one.
 *
 * Renders inputs for name, description, base price, and type, and submits collected values
 * to the appropriate Convex mutation (create or update). Shows success/error toasts,
 * disables the submit button while the operation is pending, and invokes `onClose` after
 * a successful save or when the user cancels.
 *
 * @param service - Optional existing service document; when provided the form is initialized for editing.
 * @param onClose - Callback invoked to close the form (called after successful save or when cancelling).
 * @returns A JSX element containing the service form.
 */
export function ServiceForm({ service, onClose }: ServiceFormProps) {
  const createService = useMutation(api.services.createService);
  const updateService = useMutation(api.services.updateService);
  const mutation = service ? updateService : createService;
  const [pending, setPending] = useState(false);
  // For form submission, we'll manage a local loading state.

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      basePrice: Number(formData.get("price")),
      type: formData.get("type") as "base" | "add_on",
    };

    setPending(true);
    try {
      if (service) {
        await updateService({ serviceId: service._id, ...data });
        toast.success(`Service updated successfully.`);
      } else {
        await createService(data);
        toast.success(`Service created successfully.`);
      }
      onClose();
    } catch (error) {
      toast.error(`Failed to ${service ? "update" : "create"} service.`);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="name" defaultValue={service?.name} placeholder="Service Name" required />
      <Textarea name="description" defaultValue={service?.description} placeholder="Service Description" required />
      <Input name="price" type="number" step="0.01" defaultValue={service?.basePrice} placeholder="Base Price" required />
      <Select name="type" defaultValue={service?.type ?? "base"}>
        <SelectTrigger>
          <SelectValue placeholder="Select service type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="base">Base Service</SelectItem>
          <SelectItem value="add_on">Add-On</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save Service"}
        </Button>
      </div>
    </form>
  );
}
