"use client";

import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button";
import { authClient } from "@/lib/auth/auth-client";

export function SetPasswordButton({ email }: { email: string }) {
    return (
        <BetterAuthActionButton variant="outline" successMessage="Password resent email sent" action={async () => {
            return await authClient.requestPasswordReset({
                email,
                redirectTo: "/auth/reset-password"
            });
        }}>
            Send Password Reset Email
        </BetterAuthActionButton>
    );
}
