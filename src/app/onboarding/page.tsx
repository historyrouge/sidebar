
"use client";

import { OnboardingForm } from "@/components/onboarding-form";
import { ProtectedRoute } from "@/components/protected-route";

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <OnboardingForm />
      </div>
    </ProtectedRoute>
  );
}
