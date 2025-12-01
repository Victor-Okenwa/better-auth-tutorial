"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/lib/auth/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const resetPasswordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;


export default function ResetPasswordPage() {
    const router = useRouter();
    const form = useForm<ResetPasswordSchema>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
        },
    });

    const { isSubmitting } = form.formState;
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    async function onSubmit(data: ResetPasswordSchema) {
        await authClient.resetPassword({
            newPassword: data.password,
            token: token ?? ""
        }, {
            onError: error => {
                toast.error(error.error.message || error.error.statusText || "Something went wrong")
            },
            onSuccess: () => {
                toast.success("Password reset successful")
            },
        });
    }

    if (token === null || error !== null) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Reset Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Invalid password reset link or expired</p>
                    <Button type="button" className="w-full mt-3" variant="outline" onClick={() => router.push("/auth/login")}>Back to Login</Button>
                </CardContent>
            </Card >
        );
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Reset Password</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            <LoadingSwap isLoading={isSubmitting}>Reset Password</LoadingSwap>
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card >
    );
}
