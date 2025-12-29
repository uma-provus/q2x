"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
    variant?: "default" | "ghost" | "outline";
    className?: string;
    showIcon?: boolean;
    showText?: boolean;
}

export function LogoutButton({
    variant = "ghost",
    className,
    showIcon = true,
    showText = true,
}: LogoutButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await signOut({ callbackUrl: "/login" });
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error("Failed to logout");
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size="sm"
            onClick={handleLogout}
            disabled={isLoading}
            className={cn("gap-2", className)}
        >
            {showIcon && <LogOut className="h-4 w-4" />}
            {showText && (isLoading ? "Logging out..." : "Logout")}
        </Button>
    );
}
