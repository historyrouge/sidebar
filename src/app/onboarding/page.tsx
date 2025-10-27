"use client";

import { AuthLayout } from "@/components/auth-layout";
import { OnboardingForm } from "@/components/onboarding-form";

export default function OnboardingPage() {
  return (
    <AuthLayout>
      <OnboardingForm />
    </AuthLayout>
  );
}
