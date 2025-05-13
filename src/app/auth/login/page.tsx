
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Card className="shadow-2xl border border-border/20 backdrop-blur-sm bg-background/80 rounded-xl">
      <CardHeader className="space-y-2 text-center pt-8">
        <CardTitle className="text-3xl font-bold text-primary">Welcome Back!</CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Securely access your KontrakPro dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 sm:p-8">
        <LoginForm />
        <Separator className="my-6" />
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-semibold text-accent hover:text-accent/80 hover:underline">
            Create one now
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
