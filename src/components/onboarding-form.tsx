
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { updateUserProfile } from "@/app/actions";

export function OnboardingForm() {
  const { user, updateUserProfileInAuth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(user?.displayName || "");
  const [college, setCollege] = useState("");
  const [favoriteSubject, setFavoriteSubject] = useState("");

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      if (step === 1 && !name.trim()) {
        toast({ title: "Please enter your name.", variant: "destructive" });
        return;
      }
      if (step === 2 && !college.trim()) {
        toast({ title: "Please enter your class or college.", variant: "destructive" });
        return;
      }
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!favoriteSubject.trim()) {
      toast({ title: "Please enter your favorite subject.", variant: "destructive" });
      return;
    }
    
    if (!user) {
        toast({ title: "User not found. Please log in again.", variant: "destructive" });
        router.push("/login");
        return;
    }

    setLoading(true);

    try {
        // Update Firebase Auth profile displayName if it has changed
        if (user.displayName !== name) {
           await updateUserProfileInAuth(name);
        }

        // Update Firestore profile
        const result = await updateUserProfile({
            name: name,
            college: college,
            favoriteSubject: favoriteSubject
        });

        if (result.error) {
            toast({ title: "Failed to save profile", description: result.error, variant: "destructive" });
        } else {
            toast({ title: "Profile saved!", description: "Welcome to ScholarSage!" });
            router.push("/");
        }
    } catch (error: any) {
        toast({ title: "An error occurred", description: error.message, variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  const progress = (step / totalSteps) * 100;

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome to ScholarSage!</CardTitle>
        <CardDescription>Let's set up your profile.</CardDescription>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
            <div className="space-y-2">
                <Label htmlFor="name">What's your name?</Label>
                <Input id="name" placeholder="e.g., Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
                <p className="text-sm text-muted-foreground">So we know what to call you!</p>
            </div>
        )}
        {step === 2 && (
            <div className="space-y-2">
                <Label htmlFor="college">What's your class or college?</Label>
                <Input id="college" placeholder="e.g., Grade 12 or Harvard University" value={college} onChange={(e) => setCollege(e.target.value)} />
                <p className="text-sm text-muted-foreground">This helps us personalize your experience.</p>
            </div>
        )}
        {step === 3 && (
          <div className="space-y-2">
            <Label htmlFor="subject">What's your favorite subject?</Label>
            <Input id="subject" placeholder="e.g., Computer Science" value={favoriteSubject} onChange={(e) => setFavoriteSubject(e.target.value)} />
             <p className="text-sm text-muted-foreground">We're curious!</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {step > 1 ? (
          <Button variant="outline" onClick={handleBack} disabled={loading}>Back</Button>
        ) : <div />}
        {step < totalSteps ? (
          <Button onClick={handleNext}>Next</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Finish
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
