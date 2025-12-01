"use client";
import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth/auth-client";
import type { Session } from "better-auth";
import { Monitor, Smartphone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { UAParser } from "ua-parser-js";
import { useRouter } from "next/navigation";

export function SessionManagement({
    sessions,
    currentSessionToken
}: {
    sessions: Session[];
    currentSessionToken: string;
}) {
    const router = useRouter();

    const currentSession = sessions.find(session => session.token === currentSessionToken);
    const otherSessions = sessions.filter(session => session.token !== currentSessionToken);

    function revokeOtherSessions() {
        return authClient.revokeOtherSessions(undefined, {
            onError: error => {
                toast.error(error.error.message || error.error.statusText || "Something went wrong");
            },
            onSuccess: () => {
                toast.success("Other sessions revoked");
                router.refresh();
            },
        });
    }

    return (
        <div className="space-y-4">
            {currentSession && (
                <SessionCard session={currentSession} isCurrentSession />
            )}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Other Active Sessions</h3>
                    {otherSessions.length > 0 && (
                        <BetterAuthActionButton
                            variant="destructive"
                            size="sm"
                            action={revokeOtherSessions}
                        >
                            Revoke Other Sessions
                        </BetterAuthActionButton>
                    )}
                </div>

                {otherSessions.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No other active sessions
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {otherSessions.map(session => (
                            <SessionCard key={session.id} session={session} isCurrentSession={false} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const SessionCard = ({ session, isCurrentSession }: { session: Session, isCurrentSession: boolean }) => {
    const userAgentInfo = session.userAgent ? UAParser(session.userAgent) : null;
    const router = useRouter();

    const revokeSession = () => {
        return authClient.revokeSession({ token: session.token }, {
            onError: error => {
                toast.error(error.error.message || error.error.statusText || "Something went wrong");
            },
            onSuccess: () => {
                toast.success("Session revoked");
                router.refresh();
            },
        });
    }

    function getBrowserInfo() {
        if (!userAgentInfo) return "Unknown Device";

        if (userAgentInfo.browser.name === null && userAgentInfo.os.name === null) {
            return `${userAgentInfo.browser.name} ${userAgentInfo.browser.version}`;
        }

        if (userAgentInfo.browser.name === null) {
            return userAgentInfo.os.name;
        }
        if (userAgentInfo.os.name === null) {
            return userAgentInfo.browser.name;
        }

        return `${userAgentInfo.browser.name} ${userAgentInfo.os.name}`;
    }

    function formatDate(date: Date) {
        return new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date);
    }

    return (
        <Card>
            <CardHeader className="flex justify-between">
                <CardTitle>{getBrowserInfo()}</CardTitle>
                {isCurrentSession && <Badge>Current Session</Badge>}
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {userAgentInfo?.device.type === "mobile" ? (
                            <Smartphone />
                        ) : (
                            <Monitor />
                        )}
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Created: {formatDate(session.createdAt)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Expires: {formatDate(session.expiresAt)}
                            </p>
                        </div>
                    </div>
                    {!isCurrentSession && (
                        <BetterAuthActionButton
                            variant="destructive"
                            size="sm"
                            action={revokeSession}
                            successMessage="Session revoked"
                        >
                            <Trash2 />
                        </BetterAuthActionButton>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}