"use client";
import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button";
import { authClient } from "@/lib/auth/auth-client";
import { Trash2 } from "lucide-react";

export function AccountDeletion() {
    return (
        <div className="space-y-4">
            <BetterAuthActionButton
                action={() => authClient.deleteUser({
                    callbackURL: "/",
                })}
                className="w-full"
                variant="destructive"
                size="lg"
                successMessage="Account deletion initiated please check your email to confirm"
            >
                <Trash2 className="size-4" />
                Delete Account Permanently
            </BetterAuthActionButton>
            <p className="text-sm text-muted-foreground">
                This action cannot be undone.
            </p>
        </div>
    );
}


