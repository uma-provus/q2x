"use client";

import { format } from "date-fns";
import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Filter,
    Grid3x3,
    List,
    MoreVertical,
    Plus,
    Search,
    Settings,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { z } from "zod";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { createQuote } from "@/features/quotes/actions/create-quote";
import { deleteQuote } from "@/features/quotes/actions/delete-quote";
import { updateQuote } from "@/features/quotes/actions/update-quote";
import { QuoteConfigDialog } from "@/features/quotes/components/quote-config-dialog";
import { QuoteForm } from "@/features/quotes/components/quote-form";
import type { QuoteSettings } from "@/features/settings/types";
import type { CustomFieldDefinition } from "@/lib/custom-fields";
import { formatCurrency } from "@/lib/utils";
import type { Quote, quoteSchema } from "../types";

type QuoteFormValues = z.infer<typeof quoteSchema>;

interface QuoteTableProps {
    data: Quote[];
    meta: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
    settings: QuoteSettings;
    customFields: CustomFieldDefinition[];
}

export function QuoteTable({
    data,
    meta,
    settings,
    customFields,
}: QuoteTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Quote | null>(null);
    const [deletingItem, setDeletingItem] = useState<Quote | null>(null);
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [sortField, setSortField] = useState<string>("quoteNumber");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= meta.totalPages) {
            router.push(createPageURL(newPage));
        }
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const toggleStatusFilter = (statusKey: string) => {
        setSelectedStatuses((prev) =>
            prev.includes(statusKey)
                ? prev.filter((s) => s !== statusKey)
                : [...prev, statusKey],
        );
    };

    // Filter and sort data
    const filteredData = data
        .filter((item) => {
            const matchesSearch = searchQuery
                ? item.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.customerName
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ??
                    false)
                : true;
            const matchesStatus =
                selectedStatuses.length === 0 || selectedStatuses.includes(item.status);
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            let aVal: any;
            let bVal: any;

            switch (sortField) {
                case "quoteNumber":
                    aVal = a.quoteNumber.toLowerCase();
                    bVal = b.quoteNumber.toLowerCase();
                    break;
                case "title":
                    aVal = a.title.toLowerCase();
                    bVal = b.title.toLowerCase();
                    break;
                case "customerName":
                    aVal = (a.customerName ?? "").toLowerCase();
                    bVal = (b.customerName ?? "").toLowerCase();
                    break;
                case "totalAmount":
                    aVal = Number(a.totalAmount);
                    bVal = Number(b.totalAmount);
                    break;
                case "createdAt":
                    aVal = a.createdAt.getTime();
                    bVal = b.createdAt.getTime();
                    break;
                default:
                    return 0;
            }

            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

    const getStatusLabel = (key: string) => {
        const status = settings.statuses.find((s) => s.key === key);
        return status;
    };

    const handleCreate = async (values: QuoteFormValues) => {
        startTransition(async () => {
            try {
                await createQuote(values);
                toast.success("Quote created successfully");
                setIsAddOpen(false);
            } catch (error) {
                toast.error("Failed to create quote");
            }
        });
    };

    const handleUpdate = async (values: QuoteFormValues) => {
        if (!editingItem) return;
        startTransition(async () => {
            try {
                await updateQuote(editingItem.id, values);
                toast.success("Quote updated successfully");
                setEditingItem(null);
            } catch (error) {
                toast.error("Failed to update quote");
            }
        });
    };

    const handleDelete = async () => {
        if (!deletingItem) return;
        startTransition(async () => {
            try {
                await deleteQuote(deletingItem.id);
                toast.success("Quote deleted successfully");
                setDeletingItem(null);
            } catch (error) {
                toast.error("Failed to delete quote");
            }
        });
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold">Quotes</h1>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                        {meta.total.toLocaleString()} quotes
                    </span>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(meta.page - 1)}
                            disabled={meta.page <= 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1 px-3 text-sm">
                            <span className="font-medium">{meta.page}</span>
                            <span className="text-muted-foreground">
                                of {meta.totalPages}
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(meta.page + 1)}
                            disabled={meta.page >= meta.totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <QuoteConfigDialog settings={settings}>
                        <Button variant="outline" className="gap-2">
                            <Settings className="h-4 w-4" />
                            Setup
                        </Button>
                    </QuoteConfigDialog>
                </div>
            </div>
            {/* Combined Card: Toolbar + Table */}
            <div className="rounded-lg border bg-card shadow-sm">
                {/* Toolbar */}
                <div className="flex items-center justify-between gap-3 p-4 border-b">
                    <div className="flex items-center gap-2 flex-1">
                        <InputGroup className="max-w-xs">
                            <InputGroupAddon>
                                <Search className="h-4 w-4" />
                            </InputGroupAddon>
                            <InputGroupInput
                                placeholder="Find a quote..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </InputGroup>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Filter className="h-4 w-4" />
                                    Status
                                    {selectedStatuses.length > 0 && (
                                        <Badge variant="secondary" className="ml-1 rounded-sm px-1">
                                            {selectedStatuses.length}
                                        </Badge>
                                    )}
                                    {selectedStatuses.length > 0 && (
                                        <span className="text-xs text-muted-foreground ml-1">
                                            · {filteredData.length} results
                                        </span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuLabel className="flex items-center justify-between">
                                    <span>Filter by status</span>
                                    {selectedStatuses.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedStatuses([])}
                                            className="h-auto p-0 text-xs hover:bg-transparent"
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {settings.statuses.map((status) => {
                                    const isSelected = selectedStatuses.includes(status.key);
                                    return (
                                        <DropdownMenuItem
                                            key={status.key}
                                            onClick={() => toggleStatusFilter(status.key)}
                                            className="flex items-center gap-2"
                                        >
                                            <div
                                                className="h-3 w-3 rounded-full"
                                                style={{ backgroundColor: status.color }}
                                            />
                                            <span className="flex-1">{status.name}</span>
                                            {isSelected && <span className="text-xs">✓</span>}
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded-md">
                            <Button
                                variant={viewMode === "list" ? "secondary" : "ghost"}
                                size="icon"
                                onClick={() => setViewMode("list")}
                                className="h-8 w-8 rounded-none rounded-l-md"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === "grid" ? "secondary" : "ghost"}
                                size="icon"
                                onClick={() => setViewMode("grid")}
                                className="h-8 w-8 rounded-none rounded-r-md"
                            >
                                <Grid3x3 className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Quote
                        </Button>
                    </div>
                </div>

                {/* Table */}
                {viewMode === "list" ? (
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-10 pl-4">
                                    <Checkbox />
                                </TableHead>
                                <TableHead>#</TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 gap-1 hover:bg-transparent"
                                        onClick={() => handleSort("title")}
                                    >
                                        Title
                                        {sortField === "title" && (
                                            <ArrowUpDown className="h-3 w-3" />
                                        )}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 gap-1 hover:bg-transparent"
                                        onClick={() => handleSort("customerName")}
                                    >
                                        Customer
                                        {sortField === "customerName" && (
                                            <ArrowUpDown className="h-3 w-3" />
                                        )}
                                    </Button>
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 gap-1 hover:bg-transparent"
                                        onClick={() => handleSort("totalAmount")}
                                    >
                                        Amount
                                        {sortField === "totalAmount" && (
                                            <ArrowUpDown className="h-3 w-3" />
                                        )}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 gap-1 hover:bg-transparent"
                                        onClick={() => handleSort("createdAt")}
                                    >
                                        Created
                                        {sortField === "createdAt" && (
                                            <ArrowUpDown className="h-3 w-3" />
                                        )}
                                    </Button>
                                </TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        No quotes found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData.map((quote) => {
                                    const status = getStatusLabel(quote.status);
                                    return (
                                        <TableRow key={quote.id}>
                                            <TableCell className="pl-4">
                                                <Checkbox />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {quote.quoteNumber}
                                            </TableCell>
                                            <TableCell>{quote.title}</TableCell>
                                            <TableCell>{quote.customerName}</TableCell>
                                            <TableCell>
                                                {status && (
                                                    <Badge
                                                        variant="outline"
                                                        className="gap-1.5 border-0 font-normal"
                                                        style={{
                                                            backgroundColor: `${status.color}15`,
                                                            color: status.color,
                                                        }}
                                                    >
                                                        <div
                                                            className="h-1.5 w-1.5 rounded-full"
                                                            style={{ backgroundColor: status.color }}
                                                        />
                                                        {status.name}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(
                                                    Number(quote.totalAmount),
                                                    quote.currency,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {format(quote.createdAt, "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => setEditingItem(quote)}
                                                        >
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => setDeletingItem(quote)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredData.map((quote) => {
                            const status = getStatusLabel(quote.status);
                            return (
                                <div
                                    key={quote.id}
                                    className="rounded-lg border bg-card p-4 shadow-sm"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="font-semibold">{quote.quoteNumber}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {quote.title}
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingItem(quote)}>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => setDeletingItem(quote)}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Customer</span>
                                            <span>{quote.customerName}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Status</span>
                                            {status && (
                                                <Badge
                                                    variant="outline"
                                                    className="gap-1.5 border-0 font-normal"
                                                    style={{
                                                        backgroundColor: `${status.color}15`,
                                                        color: status.color,
                                                    }}
                                                >
                                                    <div
                                                        className="h-1.5 w-1.5 rounded-full"
                                                        style={{ backgroundColor: status.color }}
                                                    />
                                                    {status.name}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between font-semibold">
                                            <span className="text-muted-foreground font-normal">
                                                Amount
                                            </span>
                                            <span>
                                                {formatCurrency(
                                                    Number(quote.totalAmount),
                                                    quote.currency,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                                            <span>Created</span>
                                            <span>{format(quote.createdAt, "MMM d, yyyy")}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {/* Add Quote Sheet */}
            <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
                <SheetContent className="flex flex-col p-0">
                    <SheetHeader className="px-6 pt-6 pb-4 border-b">
                        <SheetTitle className="text-xl font-semibold">Add Quote</SheetTitle>
                        <SheetDescription className="text-sm">
                            Create a new quote to add to your system.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <QuoteForm
                            onSubmit={handleCreate}
                            settings={settings}
                            customFields={customFields}
                            isSubmitting={isPending}
                        />
                    </div>
                    <div className="border-t px-6 py-4 bg-background">
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending}
                                onClick={() => {
                                    const form = document.querySelector(
                                        "form",
                                    ) as HTMLFormElement;
                                    form?.requestSubmit();
                                }}
                            >
                                {isPending ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
            {/* Edit Quote Sheet */}
            <Sheet open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
                <SheetContent className="flex flex-col p-0">
                    <SheetHeader className="px-6 pt-6 pb-4 border-b">
                        <SheetTitle className="text-xl font-semibold">
                            Edit Quote
                        </SheetTitle>
                        <SheetDescription className="text-sm">
                            Make changes to the quote here.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        {editingItem && (
                            <QuoteForm
                                defaultValues={{
                                    quoteNumber: editingItem.quoteNumber,
                                    title: editingItem.title,
                                    customerName: editingItem.customerName,
                                    customerId: editingItem.customerId || "",
                                    status: editingItem.status,
                                    totalAmount: editingItem.totalAmount,
                                    currency: editingItem.currency,
                                    validUntil: editingItem.validUntil || undefined,
                                    notes: editingItem.notes || "",
                                    tags: editingItem.tags || [],
                                    customFields: editingItem.customFields || {},
                                }}
                                onSubmit={handleUpdate}
                                settings={settings}
                                customFields={customFields}
                                isSubmitting={isPending}
                            />
                        )}
                    </div>
                    <div className="border-t px-6 py-4 bg-background">
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingItem(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending}
                                onClick={() => {
                                    const form = document.querySelector(
                                        "form",
                                    ) as HTMLFormElement;
                                    form?.requestSubmit();
                                }}
                            >
                                {isPending ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!deletingItem}
                onOpenChange={() => setDeletingItem(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Quote</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete quote{" "}
                            <strong>{deletingItem?.quoteNumber}</strong>? This action cannot
                            be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
