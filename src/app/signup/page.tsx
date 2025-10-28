
"use client";

import { AuthLayout } from "@/components/auth-layout";
import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <AuthLayout>
        <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Join SearnAI</CardTitle>
          <CardDescription>
            Create an account to unlock your AI study partner.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm type="signup" />
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
