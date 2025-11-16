
"use client";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BackButton } from "@/components/back-button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function TermsPage() {
    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-muted/40">
                <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="lg:hidden" />
                        <BackButton />
                        <h1 className="text-xl font-semibold tracking-tight">Terms & Conditions</h1>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="mx-auto max-w-3xl">
                        <Card>
                            <CardHeader>
                                <CardTitle>Terms and Conditions</CardTitle>
                                <CardDescription>Last Updated: July 26, 2024</CardDescription>
                            </CardHeader>
                            <CardContent className="prose dark:prose-invert max-w-none">
                                <p>
                                    Please read these Terms and Conditions ("Terms", "Terms and Conditions") carefully before using the SearnAI application (the "Service") operated by us.
                                </p>
                                <p>
                                    Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
                                </p>

                                <h3>1. Acceptance of Terms</h3>
                                <p>
                                    By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
                                </p>

                                <h3>2. Use of Service</h3>
                                <p>
                                    You agree not to use the service for any illegal or unauthorized purpose. You are responsible for all content you create, paste, or upload while using the Service. While the application strives for accuracy, you agree not to hold SearnAI responsible for any inaccuracies in the AI-generated content.
                                </p>
                                
                                <h3>3. User Accounts</h3>
                                <p>
                                    To use certain features of the app, you may be required to sign in with a Google account. You are responsible for safeguarding your account and for any activities or actions under your account.
                                </p>

                                <h3>4. Intellectual Property</h3>
                                <p>
                                    The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of SearnAI and its licensors.
                                </p>

                                <h3>5. Limitation Of Liability</h3>
                                <p>
                                    In no event shall SearnAI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                                </p>
                                
                                <h3>6. Disclaimer</h3>
                                <p>
                                    Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied. The AI-generated content is for informational purposes only and should not be considered a substitute for professional advice.
                                </p>

                                <h3>7. Governing Law</h3>
                                <p>
                                    These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                                </p>
                                
                                <h3>8. Changes</h3>
                                <p>
                                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect.
                                </p>
                                
                                <h3>9. Contact Us</h3>
                                <p>
                                    If you have any questions about these Terms, please contact us.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </MainLayout>
    );
}
