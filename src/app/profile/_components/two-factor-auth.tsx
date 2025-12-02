"use client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { NumberInput } from "@/components/ui/number-input";
import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/lib/auth/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod/v3";
import QRCode from "react-qr-code";

export const twoFactorAuthSchema = z.object({
    password: z.string().min(1, "Password is required"),
});

type TwoFactorAuthSchema = z.infer<typeof twoFactorAuthSchema>;

type TwoFactorData = {
    totpURI: string;
    backupCodes: string[];
};

export const TwoFactorAuth = ({ isEnabled }: { isEnabled: boolean }) => {
    const [twoFactorData, setTwoFactorData] = useState<TwoFactorData | null>(null);
    const router = useRouter();
    const form = useForm<TwoFactorAuthSchema>({
        resolver: zodResolver(twoFactorAuthSchema),
        defaultValues: {
            password: "",
        },
    });

    const { isSubmitting } = form.formState;

    async function onEnable(data: TwoFactorAuthSchema) {
        const res = await authClient.twoFactor.enable({
            password: data.password
        });

        if (res.error) {
            toast.error(res.error.message || res.error.statusText || "Something went wrong")
            return;
        }
        setTwoFactorData(res.data);
        toast.success("Two-factor authentication enabled successfully");
        form.reset();
        router.refresh();

    }

    async function onDisable(data: TwoFactorAuthSchema) {
        return await authClient.twoFactor.disable({
            password: data.password,
        }, {
            onError: error => {
                toast.error(error.error.message || error.error.statusText || "Something went wrong")
            },
            onSuccess: () => {
                form.reset();
                router.refresh();
            },
        });
    }

    if (twoFactorData != null) {
        return <QRCodeVerify {...twoFactorData} onDone={() => setTwoFactorData(null)} />
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(isEnabled ? onDisable : onEnable)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <PasswordInput {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />


                <Button type="submit" variant={isEnabled ? "destructive" : "default"} disabled={isSubmitting} className="w-full">
                    <LoadingSwap isLoading={isSubmitting}>{isEnabled ? "Disable Two-Factor Authentication" : "Enable Two-Factor Authentication"}</LoadingSwap>
                </Button>
            </form>
        </Form>
    );
}

const qrSchema = z.object({
    token: z.string().length(6, "Token must be 6 characters"),
});

type QRForm = z.infer<typeof qrSchema>;


function QRCodeVerify({ totpURI, backupCodes, onDone }: { totpURI: string, backupCodes: string[], onDone: () => void }) {
    const [successfullyEnabled, setSuccessfullyEnabled] = useState(false);
    const router = useRouter();
    const form = useForm<QRForm>({
        resolver: zodResolver(qrSchema),
        defaultValues: {
            token: "",
        },
    });

    const { isSubmitting } = form.formState;
    const onSubmit = async (data: QRForm) => {
        await authClient.twoFactor.verifyTotp({
            code: data.token,
        }, {
            onError: (error) => {
                toast.error(error.error.message || error.error.statusText || "Something went wrong")
            },
            onSuccess: () => {
                setSuccessfullyEnabled(true);
                router.refresh();
            },
        });
    }

    if (successfullyEnabled) {
        return (
            <>
                <p className="text-sm text-muted-foreground">
                    Save this backup codes for recovery purposes. You can use them to access your account if you lose your phone.
                </p>

                <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code) => (
                        <div key={code} className="bg-muted p-2 rounded-md">
                            {code}
                        </div>
                    ))}
                </div>
                <Button onClick={onDone}>Done</Button>
            </>
        )
    }

    return (
        <div className="space-y-8">
            <p>Scan the QR code with your authenticator app and enter the token to enable two-factor authentication.</p>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="token"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    <Button type="submit" disabled={isSubmitting}>
                        <LoadingSwap isLoading={isSubmitting}>Submit Code</LoadingSwap>
                    </Button>
                </form>
            </Form>

            <div className="w-fit bg-white p-4 rounded-lg border shadow-sm">
                <QRCode value={totpURI} size={256} />
            </div>
        </div>
    );
}