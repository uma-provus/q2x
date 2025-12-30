"use client";

import {
    ArrowUpDown,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Columns3,
    Filter,
    Grid3x3,
    List,
    MoreVertical,
    Plus,
    Search,
    Settings,
    X,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
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
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
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
import { createCatalogItem } from "@/features/catalogs/actions/create-catalog-item";
import { deleteCatalogItem } from "@/features/catalogs/actions/delete-catalog-item";
import { updateCatalogItem } from "@/features/catalogs/actions/update-catalog-item";
import { CatalogConfigDialog } from "@/features/catalogs/components/catalog-config-dialog";
import { CatalogForm } from "@/features/catalogs/components/catalog-form";
import type { CatalogItemFormValues } from "@/features/catalogs/schema";
import type { CatalogSettings } from "@/features/settings/types";
import { formatCurrency } from "@/lib/utils";
import type { CatalogItem } from "../types";

interface CatalogTableProps {
    data: CatalogItem[];
    meta: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
    settings: CatalogSettings;
}

export function CatalogTable({ data, meta, settings }: CatalogTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // State for sheets and dialogs
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
    const [deletingItem, setDeletingItem] = useState<CatalogItem | null>(null);
    const [visibleColumns, setVisibleColumns] = useState({
        type: true,
        cost: true,
        price: true,
        tags: true,
    });
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
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

    const toggleTypeFilter = (typeKey: string) => {
        setSelectedTypes((prev) =>
            prev.includes(typeKey)
                ? prev.filter((t) => t !== typeKey)
                : [...prev, typeKey]
        );
    };

    const clearFilters = () => {
        setSelectedTypes([]);
        setSearchQuery("");
    };

    // Filter and sort data
    const filteredData = data
        .filter((item) => {
            const matchesSearch = searchQuery
                ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchQuery.toLowerCase())
                : true;
            const matchesType =
                selectedTypes.length === 0 || selectedTypes.includes(item.type);
            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            let aVal: any;
            let bVal: any;

            switch (sortField) {
                case "name":
                    aVal = a.name.toLowerCase();
                    bVal = b.name.toLowerCase();
                    break;
                case "type":
                    aVal = a.type.toLowerCase();
                    bVal = b.type.toLowerCase();
                    break;
                case "cost":
                    aVal = Number(a.unitCost);
                    bVal = Number(b.unitCost);
                    break;
                case "price":
                    aVal = Number(a.unitPrice);
                    bVal = Number(b.unitPrice);
                    break;
                default:
                    return 0;
            }

            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

    const getTypeLabel = (key: string) => {
        const type = settings.types.find((t) => t.key === key);
        return type;
    };

    const getUnitTypeLabel = (key: string) => {
        const unit = settings.unitTypes.find((u) => u.key === key);
        return unit ? unit.name : key;
    };

    const handleCreate = async (values: CatalogItemFormValues) => {
        startTransition(async () => {
            try {
                await createCatalogItem(values);
                toast.success("Item created successfully");
                setIsAddOpen(false);
            } catch (error) {
                toast.error("Failed to create item");
            }
        });
    };

    const handleUpdate = async (values: CatalogItemFormValues) => {
        if (!editingItem) return;
        startTransition(async () => {
            try {
                await updateCatalogItem(editingItem.id, values);
                toast.success("Item updated successfully");
                setEditingItem(null);
            } catch (error) {
                toast.error("Failed to update item");
            }
        });
    };

    const handleDelete = async () => {
        if (!deletingItem) return;
        startTransition(async () => {
            try {
                await deleteCatalogItem(deletingItem.id);
                toast.success("Item deleted successfully");
                setDeletingItem(null);
            } catch (error) {
                toast.error("Failed to delete item");
            }
        });
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold">Catalogs</h1>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                        {meta.total.toLocaleString()} items
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
                            <span className="text-muted-foreground">of {meta.totalPages}</span>
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
                    <CatalogConfigDialog settings={settings}>
                        <Button variant="outline" className="gap-2">
                            <Settings className="h-4 w-4" />
                            Setup
                        </Button>
                    </CatalogConfigDialog>
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
                                placeholder="Find a catalog item..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </InputGroup>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <Filter className="h-4 w-4" />
                                    Type
                                    {selectedTypes.length > 0 && (
                                        <Badge variant="secondary" className="ml-1 rounded-sm px-1">
                                            {selectedTypes.length}
                                        </Badge>
                                    )}
                                    {selectedTypes.length > 0 && (
                                        <span className="text-xs text-muted-foreground ml-1">
                                            · {filteredData.length} results
                                        </span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuLabel className="flex items-center justify-between">
                                    <span>Filter by type</span>
                                    {selectedTypes.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto p-0 text-xs"
                                            onClick={clearFilters}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {settings.types.map((type) => (
                                    <DropdownMenuItem
                                        key={type.key}
                                        onClick={() => toggleTypeFilter(type.key)}
                                    >
                                        <Checkbox
                                            checked={selectedTypes.includes(type.key)}
                                            className="mr-2"
                                        />
                                        <div
                                            className="h-2 w-2 rounded-full mr-2"
                                            style={{ backgroundColor: type.color }}
                                        />
                                        {type.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded-md">
                            <Button
                                variant={viewMode === "list" ? "secondary" : "ghost"}
                                size="icon"
                                className="rounded-r-none"
                                onClick={() => setViewMode("list")}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === "grid" ? "secondary" : "ghost"}
                                size="icon"
                                className="rounded-l-none"
                                onClick={() => setViewMode("grid")}
                            >
                                <Grid3x3 className="h-4 w-4" />
                            </Button>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Columns3 className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                                    Toggle columns
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() =>
                                        setVisibleColumns((prev) => ({ ...prev, type: !prev.type }))
                                    }
                                >
                                    <Checkbox checked={visibleColumns.type} className="mr-2" />
                                    Type
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        setVisibleColumns((prev) => ({ ...prev, cost: !prev.cost }))
                                    }
                                >
                                    <Checkbox checked={visibleColumns.cost} className="mr-2" />
                                    Cost
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        setVisibleColumns((prev) => ({ ...prev, price: !prev.price }))
                                    }
                                >
                                    <Checkbox checked={visibleColumns.price} className="mr-2" />
                                    Price
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        setVisibleColumns((prev) => ({ ...prev, tags: !prev.tags }))
                                    }
                                >
                                    <Checkbox checked={visibleColumns.tags} className="mr-2" />
                                    Tags
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={() => setIsAddOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                        </Button>
                    </div>
                </div>

                {/* Active Filters Status */}
                {selectedTypes.length > 0 && (
                    <div className="px-4 py-2 bg-muted/50 border-b">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Viewing only:</span>
                            <div className="flex items-center gap-1.5">
                                {selectedTypes.map((typeKey) => {
                                    const type = settings.types.find((t) => t.key === typeKey);
                                    if (!type) return null;
                                    return (
                                        <Badge
                                            key={typeKey}
                                            variant="secondary"
                                            className="gap-1.5"
                                        >
                                            <div
                                                className="h-2 w-2 rounded-full"
                                                style={{ backgroundColor: type.color }}
                                            />
                                            {type.name}
                                            <button
                                                onClick={() => toggleTypeFilter(typeKey)}
                                                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div>
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-10 pl-4">
                                    <Checkbox />
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer select-none"
                                    onClick={() => handleSort("name")}
                                >
                                    <div className="flex items-center gap-1">
                                        Name
                                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                                    </div>
                                </TableHead>
                                {visibleColumns.type && (
                                    <TableHead
                                        className="cursor-pointer select-none"
                                        onClick={() => handleSort("type")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Type
                                            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                                        </div>
                                    </TableHead>
                                )}
                                {visibleColumns.cost && (
                                    <TableHead
                                        className="cursor-pointer select-none"
                                        onClick={() => handleSort("cost")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Cost
                                            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                                        </div>
                                    </TableHead>
                                )}
                                {visibleColumns.price && (
                                    <TableHead
                                        className="cursor-pointer select-none"
                                        onClick={() => handleSort("price")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Price
                                            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                                        </div>
                                    </TableHead>
                                )}
                                {visibleColumns.tags && <TableHead>Tags</TableHead>}
                                <TableHead className="w-10"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((item) => (
                                <TableRow key={item.id} className="group">
                                    <TableCell className="pl-4">
                                        <Checkbox />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{item.name}</span>
                                            <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                                                {item.description}
                                            </span>
                                        </div>
                                    </TableCell>
                                    {visibleColumns.type && (
                                        <TableCell>
                                            {(() => {
                                                const typeInfo = getTypeLabel(item.type);
                                                return (
                                                    <Badge
                                                        variant="outline"
                                                        className="capitalize font-normal border-0"
                                                        style={{
                                                            backgroundColor: `${typeInfo?.color}15`,
                                                            color: typeInfo?.color,
                                                        }}
                                                    >
                                                        <div
                                                            className="h-2 w-2 rounded-full mr-1.5"
                                                            style={{
                                                                backgroundColor: typeInfo?.color || "#000000",
                                                            }}
                                                        />
                                                        {typeInfo?.name || item.type}
                                                    </Badge>
                                                );
                                            })()}
                                        </TableCell>
                                    )}
                                    {visibleColumns.cost && (
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatCurrency(Number(item.unitCost), item.currency)}
                                        </TableCell>
                                    )}
                                    {visibleColumns.price && (
                                        <TableCell>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-sm font-medium">
                                                    {formatCurrency(Number(item.unitPrice), item.currency)}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    / {getUnitTypeLabel(item.unitType)}
                                                </span>
                                            </div>
                                        </TableCell>
                                    )}
                                    {visibleColumns.tags && (
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {item.tags?.slice(0, 2).map((tag) => (
                                                    <Badge
                                                        key={tag}
                                                        variant="outline"
                                                        className="text-[10px] px-1.5 py-0 h-5 text-muted-foreground"
                                                    >
                                                        {tag}
                                                    </Badge>
                                                ))}
                                                {item.tags && item.tags.length > 2 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] px-1.5 py-0 h-5 text-muted-foreground"
                                                    >
                                                        +{item.tags.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingItem(item)}>
                                                    Edit item
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => setDeletingItem(item)}
                                                >
                                                    Delete item
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        {searchQuery || selectedTypes.length > 0
                                            ? "No results found. Try adjusting your filters."
                                            : "No results."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Add Sheet */}
            <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
                <SheetContent className="flex flex-col p-0">
                    <SheetHeader className="px-6 pt-6 pb-4 border-b">
                        <SheetTitle className="text-xl font-semibold">Add Catalog Item</SheetTitle>
                        <SheetDescription className="text-sm">
                            Create a new item to add to your catalog.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <CatalogForm
                            onSubmit={handleCreate}
                            settings={settings}
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

            {/* Edit Sheet */}
            <Sheet
                open={!!editingItem}
                onOpenChange={(open) => !open && setEditingItem(null)}
            >
                <SheetContent className="flex flex-col p-0">
                    <SheetHeader className="px-6 pt-6 pb-4 border-b">
                        <SheetTitle className="text-xl font-semibold">Edit Catalog Item</SheetTitle>
                        <SheetDescription className="text-sm">
                            Make changes to the catalog item here.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        {editingItem && (
                            <CatalogForm
                                defaultValues={{
                                    name: editingItem.name,
                                    description: editingItem.description || "",
                                    type: editingItem.type,
                                    unitCost: editingItem.unitCost,
                                    unitPrice: editingItem.unitPrice,
                                    unitType: editingItem.unitType,
                                    tags: editingItem.tags || [],
                                    currency: editingItem.currency,
                                }}
                                onSubmit={handleUpdate}
                                settings={settings}
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

            {/* Delete Alert */}
            <AlertDialog
                open={!!deletingItem}
                onOpenChange={(open) => !open && setDeletingItem(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            catalog item "{deletingItem?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
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
