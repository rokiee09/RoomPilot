import { Static } from "@sinclair/typebox";
import { Link, useNavigate } from "@tanstack/react-router";
import { t } from "elysia/type-system";
import { HTMLAttributes, useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PasswordInput } from "#/components/password-input";
import { Button } from "#/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "#/components/ui/form";
import { Input } from "#/components/ui/input";
import { cn } from "#/lib/utils";
import { api } from "#lib/api";
import { authClient } from "#lib/auth";
import { typeboxResolver } from "#lib/resolver.ts";

type UserAuthFormProps = HTMLAttributes<HTMLFormElement>;

const formSchema = t.Object({
    email: t.String({
        format: "email",
    }),
    password: t.String({
        minLength: 8,
    }),
});

type FormSchema = Static<typeof formSchema>;

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [loginError, setLoginError] = useState<string | null>(null);
    const form = useForm<FormSchema>({
        resolver: typeboxResolver(formSchema),
        defaultValues: {
            email: "burakavcii@hotmail.com",
            password: "",
        },
    });

    async function onSubmit(data: FormSchema) {
        setLoginError(null);
        const response = await authClient.signIn.email({
            email: data.email,
            password: data.password,
            callbackURL: "/dashboard",
        });
        if (response.error) {
            const msg = response.error.message || "Giriş yapılamadı. E-posta ve şifreyi kontrol edin.";
            const code = (response.error as { code?: string }).code;
            const full = code ? `${msg} (kod: ${code})` : msg;
            setLoginError(full);
            toast.error(full);
            return;
        }
        toast.success("Giriş başarılı");
        queryClient.removeQueries({ queryKey: ['session'] });
        await new Promise((r) => setTimeout(r, 200));
        try {
            const sessionRes = await api.auth.me.get();
            if (sessionRes.data) {
                // Cache'e yaz ki dashboard açılınca auth/me tekrar 401 vermesin
                queryClient.setQueryData(['session'], { data: sessionRes.data });
                navigate({ to: '/dashboard/', replace: true });
                return;
            }
        } catch {
            // Cookie ile auth/me başarısız; yine de state ile dene (session sign-in cevabında olabilir)
        }
        setLoginError(
            "Giriş başarılı ancak oturum doğrulanamadı. Sayfayı yenileyip tekrar giriş yapın.",
        );
        toast.error("Dashboard'a geçiş yapılamadı");
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={cn("grid gap-3", className)}
                {...props}
            >
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>E-posta</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="ornek@email.com"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem className="relative">
                            <FormLabel>Şifre</FormLabel>
                            <FormControl>
                                <PasswordInput
                                    placeholder="********"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            <Link
                                to="/forgot-password"
                                className="text-muted-foreground absolute -top-0.5 right-0 text-sm font-medium hover:opacity-75"
                            >
                                Şifremi unuttum?
                            </Link>
                        </FormItem>
                    )}
                />
                {loginError && (
                    <p className="text-destructive text-sm">
                        {loginError}
                    </p>
                )}
                <Button className="mt-2" disabled={form.formState.isSubmitting}>
                    Giriş Yap
                </Button>

                {/* <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background text-muted-foreground px-2'>
              Or continue with
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button variant='outline' type='button' disabled={form.formState.isSubmitting}>
            <IconBrandGithub className='h-4 w-4' /> GitHub
          </Button>
          <Button variant='outline' type='button' disabled={form.formState.isSubmitting}>
            <IconBrandFacebook className='h-4 w-4' /> Facebook
          </Button>
        </div> */}
            </form>
        </Form>
    );
}
