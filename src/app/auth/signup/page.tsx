
import { SignupForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function SignupPage() {
  return (
    <Card className="shadow-2xl border border-border/20 backdrop-blur-sm bg-background/80 rounded-xl">
      <CardHeader className="space-y-2 text-center pt-8">
        <CardTitle className="text-3xl font-bold text-primary">Join KontrakPro</CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Create your account to streamline contract management.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 sm:p-8">
        <SignupForm />
        <Separator className="my-6" />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-accent hover:text-accent/80 hover:underline">
            Log In
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
