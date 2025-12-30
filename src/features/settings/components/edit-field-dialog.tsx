"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteCustomField } from "@/features/settings/actions/delete-custom-field";
import { updateCustomField } from "@/features/settings/actions/update-custom-field";
import type { CustomFieldDefinition } from "@/lib/custom-fields";

const fieldSchema = z.object({
    label: z.string().min(1, "Label is required"),
    description: z.string().optional(),
});

type FieldFormValues = z.infer<typeof fieldSchema>;

interface EditFieldDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    field: CustomFieldDefinition;
    entityType: string;
    tenantId: string;
}

export function EditFieldDialog({
    open,
    onOpenChange,
    field,
    entityType,
    tenantId,
}: EditFieldDialogProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const form = useForm<FieldFormValues>({
        resolver: zodResolver(fieldSchema),
        defaultValues: {
            label: field.label,
            description: field.description || "",
        },
    });

    const handleSubmit = async (values: FieldFormValues) => {
        startTransition(async () => {
            const result = await updateCustomField({
                id: field.id,
                label: values.label,
                description: values.description,
            });

            if (result.success) {
                toast.success("Field updated successfully");
                onOpenChange(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update field");
            }
        });
    };

    const handleDelete = async () => {
        startTransition(async () => {
            const result = await deleteCustomField(field.id);

            if (result.success) {
                toast.success("Field deleted successfully");
                setShowDeleteDialog(false);
                onOpenChange(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete field");
            }
        });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Field</DialogTitle>
                        <DialogDescription>
                            Update the properties of this custom field
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <div className="p-3 bg-muted rounded-md space-y-1">
                                <div className="text-sm font-medium">Field key</div>
                                <div className="text-sm text-muted-foreground font-mono">
                                    {field.fieldKey}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Cannot be changed after creation
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="label"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Label</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} rows={2} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-between pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setShowDeleteDialog(true)}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete Field
                                </Button>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => onOpenChange(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isPending}>
                                        {isPending ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Custom Field?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the field "{field.label}" and all its data.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Field
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
