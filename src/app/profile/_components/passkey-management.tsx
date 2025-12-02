"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { authClient } from "@/lib/auth/auth-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Passkey } from "@better-auth/passkey"

const passkeySchema = z.object({
    id: z.string(),
})

type PasskeyForm = z.infer<typeof passkeySchema>

export function PassKeyManagement({ passkeys }: { passkeys: Passkey[] }) {
    const router = useRouter()
    const form = useForm<PasskeyForm>({
        resolver: zodResolver(passkeySchema),
        defaultValues: {
            code: "",
        },
    })

    const { isSubmitting } = form.formState

    async function handleAddPasskey(data: PasskeyForm) {
        console.log(data);
    }

    return (
        <Form {...form}>
            <form
                className="space-y-4"
                onSubmit={form.handleSubmit(handleAddPasskey)}
            >
                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Code</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isSubmitting} className="w-full">
                    <LoadingSwap isLoading={isSubmitting}>Verify</LoadingSwap>
                </Button>
            </form>
        </Form>
    )
}