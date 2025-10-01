"use client";

import { MainLayout } from "@/components/main-layout";
import AdvancedFeaturesShowcase from "@/components/advanced-features-showcase";
import { useAuth } from "@/hooks/use-auth";

export default function FeaturesPage() {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Advanced Features</h1>
          <p className="text-muted-foreground">
            Explore the cutting-edge capabilities that make SearnAI the most advanced AI study platform.
          </p>
        </div>
        
        <AdvancedFeaturesShowcase userId={user?.uid || 'demo'} />
      </div>
    </MainLayout>
  );
}