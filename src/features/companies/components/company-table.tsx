"use client";

import { format } from "date-fns";
import {
    ArrowUpDown,
    Building2,
    ChevronLeft,
    ChevronRight,
    Grid3x3,
    List,
    Mail,
    MoreVertical,
    Phone,
    Plus,
    Search,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import { createCompany } from "@/features/companies/actions/create-company";
import { deleteCompany } from "@/features/companies/actions/delete-company";
import { updateCompany } from "@/features/companies/actions/update-company";
import { CompanyForm } from "@/features/companies/components/company-form";
import type { CustomFieldDefinition } from "@/lib/custom-fields";
import type { Company, companySchema } from "../types";

type CompanyFormValues = z.infer<typeof companySchema>;

interface CompanyTableProps {
    data: Company[];
    meta: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
    customFields: CustomFieldDefinition[];
}

export function CompanyTable({ data, meta, customFields }: CompanyTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Company | null>(null);
    const [deletingItem, setDeletingItem] = useState<Company | null>(null);
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<string>("name");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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

    // Filter and sort data
    const filteredData = data
        .filter((item) => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return (
                item.name.toLowerCase().includes(query) ||
                item.website?.toLowerCase().includes(query) ||
                item.city?.toLowerCase().includes(query) ||
                item.country?.toLowerCase().includes(query)
            );
        })
        .sort((a, b) => {
            let aVal: string | number;
            let bVal: string | number;

            switch (sortField) {
                case "name":
                    aVal = a.name.toLowerCase();
                    bVal = b.name.toLowerCase();
                    break;
                case "city":
                    aVal = (a.city || "").toLowerCase();
                    bVal = (b.city || "").toLowerCase();
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

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleCreate = async (values: CompanyFormValues) => {
        startTransition(async () => {
            try {
                await createCompany(values);
                toast.success("Company created successfully");
                setIsAddOpen(false);
            } catch {
                toast.error("Failed to create company");
            }
        });
    };

    const handleUpdate = async (values: CompanyFormValues) => {
        if (!editingItem) return;
        startTransition(async () => {
            try {
                await updateCompany(editingItem.id, values);
                toast.success("Company updated successfully");
                setEditingItem(null);
            } catch {
                toast.error("Failed to update company");
            }
        });
    };

    const handleDelete = async () => {
        if (!deletingItem) return;
        startTransition(async () => {
            try {
                await deleteCompany(deletingItem.id);
                toast.success("Company deleted successfully");
                setDeletingItem(null);
            } catch {
                toast.error("Failed to delete company");
            }
        });
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold">Companys</h1>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                        {meta.total.toLocaleString()} companys
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
                                placeholder="Find a company..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </InputGroup>
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
                            New Company
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
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 gap-1 hover:bg-transparent"
                                        onClick={() => handleSort("name")}
                                    >
                                        Company
                                        {sortField === "name" && (
                                            <ArrowUpDown className="h-3 w-3" />
                                        )}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 gap-1 hover:bg-transparent"
                                        onClick={() => handleSort("company")}
                                    >
                                        Company
                                        {sortField === "company" && (
                                            <ArrowUpDown className="h-3 w-3" />
                                        )}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 gap-1 hover:bg-transparent"
                                        onClick={() => handleSort("email")}
                                    >
                                        Contact
                                        {sortField === "email" && (
                                            <ArrowUpDown className="h-3 w-3" />
                                        )}
                                    </Button>
                                </TableHead>
                                <TableHead>Location</TableHead>
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
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No companys found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData.map((company) => (
                                    <TableRow key={company.id}>
                                        <TableCell className="pl-4">
                                            <Checkbox />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-xs">
                                                        {getInitials(company.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{company.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{company.company || "-"}</TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {company.email && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Mail className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-muted-foreground">
                                                            {company.email}
                                                        </span>
                                                    </div>
                                                )}
                                                {company.phone && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Phone className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-muted-foreground">
                                                            {company.phone}
                                                        </span>
                                                    </div>
                                                )}
                                                {!company.email && !company.phone && "-"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {company.city && company.country
                                                ? `${company.city}, ${company.country}`
                                                : company.city || company.country || "-"}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {format(company.createdAt, "MMM d, yyyy")}
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
                                                        onClick={() => setEditingItem(company)}
                                                    >
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setDeletingItem(company)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredData.map((company) => (
                            <div
                                key={company.id}
                                className="rounded-lg border bg-card p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3 flex-1">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback>
                                                {getInitials(company.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold truncate">
                                                {company.name}
                                            </div>
                                            {company.company && (
                                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Building2 className="h-3 w-3" />
                                                    <span className="truncate">{company.company}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => setEditingItem(company)}
                                            >
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => setDeletingItem(company)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="space-y-2 text-sm">
                                    {company.email && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Mail className="h-3 w-3" />
                                            <span className="truncate">{company.email}</span>
                                        </div>
                                    )}
                                    {company.phone && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Phone className="h-3 w-3" />
                                            <span>{company.phone}</span>
                                        </div>
                                    )}
                                    {company.city && company.country && (
                                        <div className="text-muted-foreground">
                                            {company.city}, {company.country}
                                        </div>
                                    )}
                                    <div className="text-xs text-muted-foreground pt-2 border-t">
                                        Added {format(company.createdAt, "MMM d, yyyy")}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Company Sheet */}
            <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
                <SheetContent className="flex flex-col p-0">
                    <SheetHeader className="px-6 pt-6 pb-4 border-b">
                        <SheetTitle className="text-xl font-semibold">Add Company</SheetTitle>
                        <SheetDescription className="text-sm">
                            Add a new company to your system.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <CompanyForm
                            onSubmit={handleCreate}
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
                                        'form'
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

            {/* Edit Company Sheet */}
            <Sheet open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
                <SheetContent className="flex flex-col p-0">
                    <SheetHeader className="px-6 pt-6 pb-4 border-b">
                        <SheetTitle className="text-xl font-semibold">Edit Company</SheetTitle>
                        <SheetDescription className="text-sm">
                            Make changes to the company here.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        {editingItem && (
                            <CompanyForm
                                defaultValues={{
                                    name: editingItem.name,
                                    email: editingItem.email || "",
                                    phone: editingItem.phone || "",
                                    company: editingItem.company || "",
                                    website: editingItem.website || "",
                                    address: editingItem.address || "",
                                    city: editingItem.city || "",
                                    state: editingItem.state || "",
                                    country: editingItem.country || "",
                                    postalCode: editingItem.postalCode || "",
                                    tags: editingItem.tags || [],
                                    customFields: editingItem.customFields || {},
                                }}
                                onSubmit={handleUpdate}
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
                                        'form'
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
                        <AlertDialogTitle>Delete Company</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <strong>{deletingItem?.name}</strong>? This action cannot be
                            undone.
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
