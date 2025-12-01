import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import { useEffect, useRef, useState } from "react";

export function EmailVerificationTab({ email }: { email: string }) {
    const [timeToNextResend, setTimeToNextResend] = useState(30);
    const interval = useRef<NodeJS.Timeout>(undefined);

    useEffect(() => {
        startEmailVerificationCountdown();
    }, []);

    function startEmailVerificationCountdown(time = 30) {
        setTimeToNextResend(time)

        interval.current = setInterval(() => {
            setTimeToNextResend((t: number) => {
                const newTime = t - 1;
                if (newTime <= 0) {
                    clearInterval(interval.current);
                    return 0;
                }
                return newTime;
            });
        }, 1000);
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground mt-2">
                We sent you a verification link. Please check your email and click the
                link to verify your account.
            </p>

            <BetterAuthActionButton disabled={timeToNextResend > 0} action={() => authClient.sendVerificationEmail({ email, callbackURL: "/" })}>
                {timeToNextResend > 0 ? `Resend in (${timeToNextResend})` : "Resend"}
            </BetterAuthActionButton>
        </div>
    );
}
