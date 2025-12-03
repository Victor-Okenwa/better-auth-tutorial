"use client";
import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button";
import { authClient } from "@/lib/auth/auth-client";
import { Key } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function PasskeyButton() {
    const router = useRouter();
    const { refetch } = authClient.useSession();

    useEffect(() => {
        authClient.signIn.passkey({ autoFill: true }, {
            onSuccess: () => {
                toast.success("Passkey used successfully");
                router.push("/");
                refetch();
            }
        })
    }, [router, refetch]);

    return (
        <div className="space-y-4">
            <BetterAuthActionButton
                action={() => authClient.signIn.passkey(undefined, {
                    onSuccess: () => {
                        toast.success("Passkey used successfully");
                        router.push("/");
                        refetch();
                    }
                })}
                className="w-full"
                variant="outline"
                size="lg"
            >
                <Key className="size-4" />
                Use Passkey
            </BetterAuthActionButton>
        </div>
    );
}


