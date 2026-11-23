import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignInForm } from "./SignInForm";

type SignInProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SignIn({ searchParams }: SignInProps) {
  const params = await searchParams;
  const message = params.message ? String(params.message) : null;

  return (
    <div className="bg-background min-h-screen grid lg:grid-cols-2">
      {/* Brand side */}
      <div className="hidden lg:flex flex-col justify-between brand-gradient p-10 text-white">
        <div className="flex items-center gap-2">
          <span className="inline-block h-8 w-8 rounded-lg bg-white/20" />
          <span className="text-xl font-bold">ShopClone</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight">Welcome back</h1>
          <p className="text-white/80 max-w-md">
            Sign in to access your cart, orders, and personalized recommendations.
          </p>
        </div>
        <p className="text-xs text-white/60">© {new Date().getFullYear()} ShopClone</p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-0 shadow-none lg:shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <SignInForm message={message} />
        </Card>
      </div>
    </div>
  );
}
