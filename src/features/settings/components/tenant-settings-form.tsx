"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
    const { theme, setTheme } = useTheme();

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

            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium">Appearance</h3>
                    <p className="text-sm text-muted-foreground">
                        Customize how the application looks on your device.
                    </p>
                </div>
                <div className="max-w-xl">
                    <Field>
                        <FieldLabel>Theme</FieldLabel>
                        <RadioGroup value={theme} onValueChange={setTheme}>
                            <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent">
                                <RadioGroupItem value="light" id="light" />
                                <Label htmlFor="light" className="flex items-center gap-2 flex-1 cursor-pointer">
                                    <Sun className="h-4 w-4" />
                                    <div>
                                        <div className="font-medium">Light</div>
                                        <div className="text-xs text-muted-foreground">Clean, bright interface</div>
                                    </div>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent">
                                <RadioGroupItem value="dark" id="dark" />
                                <Label htmlFor="dark" className="flex items-center gap-2 flex-1 cursor-pointer">
                                    <Moon className="h-4 w-4" />
                                    <div>
                                        <div className="font-medium">Dark</div>
                                        <div className="text-xs text-muted-foreground">Easy on the eyes</div>
                                    </div>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent">
                                <RadioGroupItem value="system" id="system" />
                                <Label htmlFor="system" className="flex items-center gap-2 flex-1 cursor-pointer">
                                    <Monitor className="h-4 w-4" />
                                    <div>
                                        <div className="font-medium">System</div>
                                        <div className="text-xs text-muted-foreground">Match your device settings</div>
                                    </div>
                                </Label>
                            </div>
                        </RadioGroup>
                    </Field>
                </div>
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting}>
                Save Changes
            </Button>
        </form>
    );
}
