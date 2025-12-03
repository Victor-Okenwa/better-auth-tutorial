"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { PasskeyButton } from "./passkey-button";

export const signInSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(4, "Password must be at least 4 characters"),
});

type SignInSchema = z.infer<typeof signInSchema>;

export function SignInTab({ openEmailVerificationTab, openForgotPasswordTab }: { openEmailVerificationTab: (email: string) => void, openForgotPasswordTab: () => void }) {
    const form = useForm<SignInSchema>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const { isSubmitting } = form.formState;

    async function onSubmit(data: SignInSchema) {
        await authClient.signIn.email({
            email: data.email,
            password: data.password,
            callbackURL: "/",
        }, {
            onError: error => {
                if (error.error.code === "EMAIL_NOT_VERIFIED") {
                    openEmailVerificationTab(data.email);
                } else {
                    toast.error(error.error.message || error.error.statusText || "Something went wrong")
                }
            },
            onSuccess: () => {
                toast.success("Sign in successful")
                openEmailVerificationTab(data.email);
            },
        });
        console.log(data);
    }

    return (
        <div className="space-y-8">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input autoComplete="email webauthn" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex justify-between">
                                    <FormLabel>Password</FormLabel>
                                    <Button type="button" variant="link" disabled={isSubmitting} className="text-sm p-0 opacity-70" onClick={openForgotPasswordTab}>Forgot Password?</Button>
                                </div>
                                <FormControl>
                                    <PasswordInput autoComplete="current-password webauthn" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        <LoadingSwap isLoading={isSubmitting}>Sign In</LoadingSwap>
                    </Button>
                </form>
            </Form >

            <div className="space-y-4">
                <p className="text-center text-sm text-primary/50 flex gap-1 items-center ">
                    <span className="h-px flex-1 bg-primary/20"></span>
                    OR
                    <span className="h-px flex-1 bg-primary/20"></span>
                </p>

                <PasskeyButton />
            </div>
        </div>

    );
}
