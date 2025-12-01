"use client";

import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button";
import { Card, CardContent } from "@/components/ui/card";
import type { auth } from "@/lib/auth/auth";
import { authClient } from "@/lib/auth/auth-client";
import { SUPPORTED_OAUTH_PROVIDERS_DETAILS, type SupportedOAuthProvider } from "@/lib/auth/oauth-provider";
import { Plus, Shield, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";


type Account = Awaited<ReturnType<typeof auth.api.listUserAccounts>>[number];

export function AccountLinking({ accounts }: { accounts: Account[] }) {
    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h1 className="text-lg font-medium">Linked Accounts</h1>

                {accounts.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-secondary-muted">
                            No accounts linked
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {accounts.map(account => (
                            <AccountCard key={account.id} provider={account.providerId} account={account} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}



function AccountCard({
    provider,
    account,
}: {
    provider: string
    account?: Account
}) {
    const router = useRouter()


    const providerDetails = SUPPORTED_OAUTH_PROVIDERS_DETAILS[
        provider as SupportedOAuthProvider
    ] ?? {
        name: provider,
        Icon: Shield,
    }

    function linkAccount() {
        return authClient.linkSocial({
            provider,
            callbackURL: "/profile",
        })
    }

    function unlinkAccount() {
        if (account == null) {
            return Promise.resolve({ error: { message: "Account not found" } })
        }
        return authClient.unlinkAccount(
            {
                accountId: account.accountId,
                providerId: provider,
            },
            {
                onSuccess: () => {
                    router.refresh()
                },
            }
        )
    }

    return (
        <Card>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {<providerDetails.icon className="size-5" />}
                        <div>
                            <p className="font-medium">{providerDetails.name}</p>
                            {account == null ? (
                                <p className="text-sm text-muted-foreground">
                                    Connect your {providerDetails.name} account for easier sign-in
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Linked on {new Date(account.createdAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                    {account == null ? (
                        <BetterAuthActionButton
                            variant="outline"
                            size="sm"
                            action={linkAccount}
                        >
                            <Plus />
                            Link
                        </BetterAuthActionButton>
                    ) : (
                        <BetterAuthActionButton
                            variant="destructive"
                            size="sm"
                            action={unlinkAccount}
                        >
                            <Trash2 />
                            Unlink
                        </BetterAuthActionButton>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}