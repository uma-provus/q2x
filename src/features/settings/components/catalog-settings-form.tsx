"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { updateCatalogSettings } from "../actions/update-catalog-settings";
import { type CatalogSettings, catalogSettingsSchema } from "../types";

interface CatalogSettingsFormProps {
    initialData: CatalogSettings;
}

export function CatalogSettingsForm({ initialData }: CatalogSettingsFormProps) {
    const form = useForm({
        resolver: zodResolver(catalogSettingsSchema),
        defaultValues: initialData,
    });

    const {
        fields: typeFields,
        append: appendType,
        remove: removeType,
    } = useFieldArray({
        control: form.control,
        name: "types",
    });

    const { fields: unitTypeFields } = useFieldArray({
        control: form.control,
        name: "unitTypes",
    });

    async function onSubmit(data: CatalogSettings) {
        const result = await updateCatalogSettings(data);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Settings updated successfully");
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium">Catalog Item Types</h3>
                    <p className="text-sm text-muted-foreground">
                        Configure the types of items available in your catalog. You can
                        rename standard types or add new ones.
                    </p>
                </div>
                <div className="space-y-4">
                    {typeFields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-4">
                            <Controller
                                control={form.control}
                                name={`types.${index}.name`}
                                render={({ field, fieldState }) => (
                                    <Field className="flex-1">
                                        <FieldLabel className={index !== 0 ? "sr-only" : ""}>
                                            Display Name
                                        </FieldLabel>
                                        <Input {...field} />
                                        <FieldError errors={[fieldState.error]} />
                                    </Field>
                                )}
                            />
                            <div className="pb-2 text-sm text-muted-foreground w-32">
                                Key: {form.getValues(`types.${index}.key`)}
                            </div>
                            {!form.getValues(`types.${index}.isStandard`) && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeType(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                            appendType({
                                id: crypto.randomUUID(),
                                name: "New Type",
                                key: `custom_${crypto.randomUUID().split("-")[0]}`,
                                isStandard: false,
                            })
                        }
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Type
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium">Unit Types</h3>
                    <p className="text-sm text-muted-foreground">
                        Enable or disable the unit types available for catalog items.
                    </p>
                </div>
                <div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {unitTypeFields.map((field, index) => (
                            <Controller
                                key={field.id}
                                control={form.control}
                                name={`unitTypes.${index}.enabled`}
                                render={({ field }) => (
                                    <Field className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FieldLabel className="text-base">
                                                {form.getValues(`unitTypes.${index}.name`)}
                                            </FieldLabel>
                                        </div>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </Field>
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit">Save Changes</Button>
            </div>
        </form>
    );
}
