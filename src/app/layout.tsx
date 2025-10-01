
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import { ThemeProvider } from '@/components/theme-provider';
import { PageLoader } from '@/components/page-loader';
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'ScholarSage - AI-Powered Study Companion',
  description: 'Transform your learning with AI-powered flashcards, quizzes, and study tools. Upload documents, generate study materials, and master any subject with intelligent content analysis.',
  keywords: 'AI study tool, flashcards, quiz generator, study companion, learning assistant, education technology',
  authors: [{ name: 'ScholarSage Team' }],
  creator: 'ScholarSage',
  publisher: 'ScholarSage',
  robots: 'index, follow',
  openGraph: {
    title: 'ScholarSage - AI-Powered Study Companion',
    description: 'Transform your learning with AI-powered flashcards, quizzes, and study tools.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScholarSage - AI-Powered Study Companion',
    description: 'Transform your learning with AI-powered flashcards, quizzes, and study tools.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("min-h-screen bg-background font-body antialiased")} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <PageLoader>
              {children}
            </PageLoader>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
