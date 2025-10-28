
"use client";

import { AuthLayout } from "@/components/auth-layout";
import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <AuthLayout>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back to SearnAI</CardTitle>
          <CardDescription>
            Your personal AI-powered study partner.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm type="login" />
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
