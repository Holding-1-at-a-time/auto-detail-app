// app/assessment/new/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

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
import { useAuth } from "@clerk/clerk-react";
import { Id } from "convex/values";

// Define the form schema using Zod for validation
const formSchema = z.object({
    clientName: z.string().min(2, "Name must be at least 2 characters."),
    carMake: z.string().min(2, "Make is required."),
    carModel: z.string().min(2, "Model is required."),
    carYear: z.number().min(1900).max(new Date().getFullYear() + 1),
    services: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: "You have to select at least one service.",
    }),
    notes: z.string().optional(),
});

const serviceOptions = [
    { id: "interior-detail", label: "Full Interior Detail" },
    { id: "exterior-wash", label: "Exterior Hand Wash & Wax" },
    { id: "paint-correction", label: "Paint Correction" },
    { id: "ceramic-coating", label: "Ceramic Coating" },
];

export default function NewAssessmentPage() {
    const createAssessment = useMutation(api.assessments.createAssessment);
    const router = useRouter();

    const form = useForm<z.infer<(typeof formSchema)>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            clientName: "",
            carMake: "",
            carModel: "",
            carYear: new Date().getFullYear(),
            services: [],
            notes: "",
        },
    });
    async function onSubmit(values: z.infer<typeof formSchema>) {
        // You must provide orgId and userId as required by the mutation
        // Replace the following with your actual logic to get orgId and userId
        const { data: org } = await api.organizations.getOrganizationForUser();
        const orgId = org?.id;

        const { userId } = useAuth();

        if (!orgId || !userId) {
            console.error("Failed to get orgId or userId");
            return;
        }

        await createAssessment({
            ...values,
            orgId,
            userId: Id<'users>',
        });
        form.reset();
        // Redirect to a dashboard page after successful submission
        router.push("/dashboard");
    }
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>New Vehicle Assessment</CardTitle>
                <CardDescription>
                    Fill out the details below to get started. We'll review it and get
                    back to you.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* Form fields go here */}
                        <FormField
                            control={form.control}
                            name="clientName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField control={form.control} name="carMake" render={({ field }) => (
                                <FormItem><FormLabel>Car Make</FormLabel><FormControl><Input placeholder="Toyota" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="carModel" render={({ field }) => (
                                <FormItem><FormLabel>Car Model</FormLabel><FormControl><Input placeholder="Camry" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="carYear" render={({ field }) => (
                                <FormItem><FormLabel>Year</FormLabel><FormControl><Input type="number" placeholder="2024" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>

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
                                            render={({ field }) => {
                                                return (
                                                    <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => {
                                                                return checked ? field.onChange([...field.value, item.id]) : field.onChange(field.value?.filter((value) => value !== item.id))
                                                            }} />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">{item.label}</FormLabel>
                                                    </FormItem>
                                                )
                                            }} />
                                    ))}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField<{ clientName: string; carMake: string; carModel: string; carYear: number; services: string[]; notes?: string | undefined; }>
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

                        <Button type="submit">Submit for Review</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}