
import { Layers } from "lucide-react";
import Link from "next/link";

export function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
             <div className="absolute top-8 left-8">
                <Link href="/" className="flex items-center gap-2 text-foreground">
                    <Layers className="h-6 w-6" />
                    <span className="text-lg font-semibold">SearnAI</span>
                </Link>
            </div>
            {children}
        </div>
    );
}
