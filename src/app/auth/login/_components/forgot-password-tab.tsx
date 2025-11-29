"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email"),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordTab({ openSignInTab }: { openSignInTab: () => void }) {
    const form = useForm<ForgotPasswordSchema>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const { isSubmitting } = form.formState;

    async function onSubmit(data: SignInSchema) {
        await authClient.forgotPassword({
            email: data.email,
            callbackURL: "/",
        }, {
            onError: error => {
                toast.error(error.error.message || error.error.statusText || "Something went wrong")
            },
            onSuccess: () => {
                toast.success("Forgot password successful")
                openSignInTab();
            },
        });
        console.log(data);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex gap-2">
                    <Button type="button" variant="outline" disabled={isSubmitting} className="w-full" onClick={openSignInTab}>Back</Button>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        <LoadingSwap isLoading={isSubmitting}>Sign In</LoadingSwap>
                    </Button>
                </div>
            </form>
        </Form>
    );
}
