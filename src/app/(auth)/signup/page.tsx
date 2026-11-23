import SignUpForm from "./SignUpForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function SignUp() {
  return (
    <div className="bg-background min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between brand-gradient p-10 text-white">
        <div className="flex items-center gap-2">
          <span className="inline-block h-8 w-8 rounded-lg bg-white/20" />
          <span className="text-xl font-bold">ShopClone</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight">Join ShopClone</h1>
          <p className="text-white/80 max-w-md">
            Create an account to track orders, save favorites, and get personalized recommendations.
          </p>
        </div>
        <p className="text-xs text-white/60">© {new Date().getFullYear()} ShopClone</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-0 shadow-none lg:shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>Enter your details below to create your account</CardDescription>
          </CardHeader>
          <SignUpForm />
        </Card>
      </div>
    </div>
  );
}
