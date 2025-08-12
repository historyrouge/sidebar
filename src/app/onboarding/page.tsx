
"use client";
import dynamic from 'next/dynamic';

const OnboardingForm = dynamic(() => import('@/components/onboarding-form').then(mod => mod.OnboardingForm), { ssr: false, loading: () => <div className="flex h-screen w-full items-center justify-center">Loading...</div> });

export default function OnboardingPage() {
  return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <OnboardingForm />
      </div>
  );
}
