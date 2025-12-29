"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { updateNotificationSettings } from "../actions/update-notification-settings";
import { type NotificationsSettings, notificationsSettingsSchema } from "../types";

interface NotificationsFormProps {
    initialData: NotificationsSettings;
}

export function NotificationsForm({ initialData }: NotificationsFormProps) {
    const form = useForm<NotificationsSettings>({
        resolver: zodResolver(notificationsSettingsSchema),
        defaultValues: initialData,
    });

    async function onSubmit(data: NotificationsSettings) {
        const result = await updateNotificationSettings(data);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Notification settings updated successfully");
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium">Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                        Configure how you receive notifications.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FieldLabel className="text-base">Email Notifications</FieldLabel>
                            <p className="text-sm text-muted-foreground">
                                Receive notifications via email.
                            </p>
                        </div>
                        <Controller
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FieldLabel className="text-base">Push Notifications</FieldLabel>
                            <p className="text-sm text-muted-foreground">
                                Receive notifications via push notifications.
                            </p>
                        </div>
                        <Controller
                            control={form.control}
                            name="push"
                            render={({ field }) => (
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FieldLabel className="text-base">Marketing Emails</FieldLabel>
                            <p className="text-sm text-muted-foreground">
                                Receive marketing emails and updates.
                            </p>
                        </div>
                        <Controller
                            control={form.control}
                            name="marketing"
                            render={({ field }) => (
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FieldLabel className="text-base">Security Alerts</FieldLabel>
                            <p className="text-sm text-muted-foreground">
                                Receive security alerts and notifications.
                            </p>
                        </div>
                        <Controller
                            control={form.control}
                            name="security"
                            render={({ field }) => (
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                    </div>
                </div>
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save changes"}
            </Button>
        </form>
    );
}
