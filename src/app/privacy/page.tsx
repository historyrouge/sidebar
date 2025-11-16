
"use client";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BackButton } from "@/components/back-button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function PrivacyPage() {
    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-muted/40">
                <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="lg:hidden" />
                        <BackButton />
                        <h1 className="text-xl font-semibold tracking-tight">Privacy Policy</h1>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="mx-auto max-w-3xl">
                        <Card>
                            <CardHeader>
                                <CardTitle>Privacy Policy for SearnAI</CardTitle>
                                <CardDescription>Last Updated: July 26, 2024</CardDescription>
                            </CardHeader>
                            <CardContent className="prose dark:prose-invert max-w-none">
                                <p>
                                    Welcome to SearnAI. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
                                </p>

                                <h3>1. Information We Collect</h3>
                                <p>
                                    When you sign in using Google, we may collect the following information from your Google account:
                                </p>
                                <ul>
                                    <li><strong>Personal Information:</strong> Your name, email address, and profile picture.</li>
                                    <li><strong>Usage Data:</strong> We may collect information on how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</li>
                                </ul>

                                <h3>2. How We Use Your Information</h3>
                                <p>We use the information we collect for various purposes:</p>
                                <ul>
                                    <li>To provide and maintain our Service.</li>
                                    <li>To personalize your experience.</li>
                                    <li>To provide customer support.</li>
                                    <li>To gather analysis or valuable information so that we can improve our Service.</li>
                                    <li>To monitor the usage of our Service.</li>
                                    <li>To detect, prevent and address technical issues.</li>
                                </ul>

                                <h3>3. Data Security</h3>
                                <p>
                                    The security of your data is important to us. We use your Google account for authentication, and we store basic profile information in our secure Firebase database. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.
                                </p>

                                <h3>4. Third-Party Services</h3>
                                <p>
                                   Our application uses Firebase for authentication and database services. We also use various AI models (SambaNova, Google Genkit) to power our features. These services have their own privacy policies, and we encourage you to review them. We are not responsible for the practices of third-party services.
                                </p>
                                
                                <h3>5. Children's Privacy</h3>
                                <p>
                                    Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13.
                                </p>

                                <h3>6. Changes to This Privacy Policy</h3>
                                <p>
                                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
                                </p>

                                <h3>7. Contact Us</h3>
                                <p>
                                    If you have any questions about this Privacy Policy, please contact us through the feedback section in the application settings.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </MainLayout>
    );
}
