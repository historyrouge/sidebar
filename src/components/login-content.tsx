
"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.599-1.521,12.455-4.112l-6.46-4.853C28.205,35.66,26.214,36,24,36c-5.222,0-9.619-3.317-11.28-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.46,4.853C39.818,34.426,44,29.564,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);

const AppLogo = () => (
    <svg
      className="h-10 w-10 text-white"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "rgba(255,255,255,0.8)", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "rgba(255,255,255,0.2)", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path
        d="M50 2.88675L93.3013 26.4434V73.5566L50 97.1132L6.69873 73.5566V26.4434L50 2.88675Z"
        stroke="url(#logoGradient)"
        strokeWidth="4"
      />
      <path
        d="M63 40.5C63 36.3579 59.6421 33 55.5 33H44.5C40.3579 33 37 36.3579 37 40.5V43.5C37 47.6421 40.3579 51 44.5 51H55.5C59.6421 51 63 54.3579 63 58.5V61.5C63 65.6421 59.6421 69 55.5 69H44.5C40.3579 69 37 65.6421 37 61.5"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

export function LoginContent() {
    const { signInWithGoogle } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        const user = await signInWithGoogle();
        if (user) {
            router.push('/');
        } else {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-black p-4">
            <Image
                src="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop"
                alt="Starry sky background"
                fill
                className="z-0 object-cover opacity-50 blur-sm"
                data-ai-hint="starry sky"
            />
            <div className="z-10 flex flex-col items-center text-center text-white">
                <AppLogo />
                <h1 className="mt-6 text-4xl font-bold tracking-tight">Welcome to SearnAI</h1>
                <p className="mt-2 text-lg text-white/80">Your AI-powered study companion.</p>
                <div className="mt-10 w-full max-w-xs space-y-4">
                     <Button onClick={handleGoogleSignIn} className="w-full h-12 text-base bg-white/90 text-black hover:bg-white" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <GoogleIcon className="mr-2" />}
                        Continue with Google
                    </Button>
                    <Button variant="outline" className="w-full h-12 text-base bg-transparent text-white border-white/50 hover:bg-white/10" disabled={true}>
                        Continue with Email
                    </Button>
                </div>
                 <div className="mt-8 max-w-xs text-xs text-white/60">
                    <p>
                        By signing up, you agree to our{' '}
                        <Link href="/terms" className="underline hover:text-white">
                            Terms and Conditions
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="underline hover:text-white">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
