"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const tenantSettingsSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
});

type TenantSettings = z.infer<typeof tenantSettingsSchema>;

interface TenantSettingsFormProps {
    initialData: {
        name: string;
        slug: string;
    };
}

export function TenantSettingsForm({ initialData }: TenantSettingsFormProps) {
    const form = useForm<TenantSettings>({
        resolver: zodResolver(tenantSettingsSchema),
        defaultValues: initialData,
    });

    async function onSubmit(data: TenantSettings) {
        // TODO: Implement update action
        toast.success("Organization settings updated");
        console.log(data);
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium">Organization Profile</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage your organization's public profile and settings.
                    </p>
                </div>
                <div className="grid gap-4 max-w-xl">
                    <Field>
                        <FieldLabel>Organization Name</FieldLabel>
                        <Input {...form.register("name")} />
                        <FieldError errors={[form.formState.errors.name]} />
                    </Field>

                    <Field>
                        <FieldLabel>URL Slug</FieldLabel>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md border">
                                app.q2x.com/
                            </span>
                            <Input {...form.register("slug")} disabled />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Your organization's unique identifier. Contact support to change
                            this.
                        </p>
                    </Field>
                </div>
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting}>
                Save Changes
            </Button>
        </form>
    );
}
