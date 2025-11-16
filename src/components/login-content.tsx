
"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.599-1.521,12.455-4.112l-6.46-4.853C28.205,35.66,26.214,36,24,36c-5.222,0-9.619-3.317-11.28-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.46,4.853C39.818,34.426,44,29.564,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
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
    const { signInWithGoogle, signInWithGitHub, signInWithEmail, signUpWithEmail } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<null | 'google' | 'github' | 'email'>(null);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { toast } = useToast();

    const handleGoogleSignIn = async () => {
        setIsLoading('google');
        const user = await signInWithGoogle();
        if (user) {
            router.push('/');
        } else {
            setIsLoading(null);
        }
    };
    
    const handleGitHubSignIn = async () => {
        setIsLoading('github');
        const user = await signInWithGitHub();
        if (user) {
            router.push('/');
        } else {
            setIsLoading(null);
        }
    };
    
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast({ title: "Email and password are required.", variant: "destructive" });
            return;
        }
        setIsLoading('email');
        const action = isSignUp ? signUpWithEmail : signInWithEmail;
        const user = await action(email, password);
        
        if (user) {
            router.push('/');
        } else {
            // Error is handled in useAuth, toast will be shown
            setIsLoading(null);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-black p-4">
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
            <div id="stars"></div>
            <div id="stars2"></div>
            <div id="stars3"></div>
            <div className="z-10 flex flex-col items-center text-center text-white">
                <AppLogo />
                <h1 className="mt-6 text-4xl font-bold tracking-tight">Welcome to SearnAI</h1>
                <p className="mt-2 text-lg text-white/80">Your AI-powered study companion.</p>
                
                <div className={cn("mt-10 w-full max-w-xs space-y-4 transition-all duration-300", showEmailForm && "opacity-0 pointer-events-none -translate-y-4")}>
                     <Button onClick={handleGoogleSignIn} className="w-full h-12 text-base bg-white/90 text-black hover:bg-white" disabled={!!isLoading}>
                        {isLoading === 'google' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <GoogleIcon className="mr-2" />}
                        Continue with Google
                    </Button>
                     <Button onClick={handleGitHubSignIn} className="w-full h-12 text-base bg-neutral-800/80 text-white hover:bg-neutral-700" disabled={!!isLoading}>
                        {isLoading === 'github' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <GithubIcon className="mr-2" />}
                        Continue with GitHub
                    </Button>
                    <Button variant="outline" onClick={() => setShowEmailForm(true)} className="w-full h-12 text-base bg-transparent text-white border-white/50 hover:bg-white/10" disabled={!!isLoading}>
                        Continue with Email
                    </Button>
                </div>
                
                <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xs space-y-4 transition-all duration-300", !showEmailForm && "opacity-0 pointer-events-none translate-y-4")}>
                    <h2 className="text-xl font-semibold">{isSignUp ? 'Create an Account' : 'Sign In'}</h2>
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="h-12 bg-black/30 text-white border-white/30" required />
                        <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="h-12 bg-black/30 text-white border-white/30" required />
                        <Button type="submit" className="w-full h-12" disabled={isLoading === 'email'}>
                            {isLoading === 'email' && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            {isSignUp ? 'Sign Up' : 'Sign In'}
                        </Button>
                    </form>
                    <Button variant="link" className="text-white/70" onClick={() => setIsSignUp(!isSignUp)}>
                        {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                    </Button>
                     <Button variant="link" className="text-white/70" onClick={() => setShowEmailForm(false)}>
                        Back to other login options
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
