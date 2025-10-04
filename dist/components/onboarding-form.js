"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingForm = OnboardingForm;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const use_auth_1 = require("@/hooks/use-auth");
const navigation_1 = require("next/navigation");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const card_1 = require("@/components/ui/card");
const progress_1 = require("@/components/ui/progress");
const use_toast_1 = require("@/hooks/use-toast");
const lucide_react_1 = require("lucide-react");
const actions_1 = require("@/app/actions");
function OnboardingForm() {
    const { user, updateUserProfileInAuth } = (0, use_auth_1.useAuth)();
    const router = (0, navigation_1.useRouter)();
    const { toast } = (0, use_toast_1.useToast)();
    const [step, setStep] = (0, react_1.useState)(1);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [name, setName] = (0, react_1.useState)(user?.displayName || "");
    const [college, setCollege] = (0, react_1.useState)("");
    const [favoriteSubject, setFavoriteSubject] = (0, react_1.useState)("");
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
            await updateUserProfileInAuth(name);
            const result = await (0, actions_1.updateUserProfile)({
                name: name,
                college: college,
                favoriteSubject: favoriteSubject
            });
            if (result.error) {
                toast({ title: "Failed to save profile", description: result.error, variant: "destructive" });
            }
            else {
                toast({ title: "Profile saved!", description: "Welcome to Easy Learn AI!" });
                router.push("/");
            }
        }
        catch (error) {
            toast({ title: "An error occurred", description: error.message, variant: "destructive" });
        }
        finally {
            setLoading(false);
        }
    };
    const progress = (step / totalSteps) * 100;
    return ((0, jsx_runtime_1.jsxs)(card_1.Card, { className: "w-full max-w-lg", children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { children: [(0, jsx_runtime_1.jsx)(card_1.CardTitle, { className: "text-2xl", children: "Welcome to Easy Learn AI!" }), (0, jsx_runtime_1.jsx)(card_1.CardDescription, { children: "Let's set up your profile." }), (0, jsx_runtime_1.jsx)(progress_1.Progress, { value: progress, className: "mt-2" })] }), (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "space-y-6", children: [step === 1 && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "name", children: "What's your name?" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "name", placeholder: "e.g., Jane Doe", value: name, onChange: (e) => setName(e.target.value) }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-muted-foreground", children: "So we know what to call you!" })] })), step === 2 && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "college", children: "What's your class or college?" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "college", placeholder: "e.g., Grade 12 or Harvard University", value: college, onChange: (e) => setCollege(e.target.value) }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-muted-foreground", children: "This helps us personalize your experience." })] })), step === 3 && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)(label_1.Label, { htmlFor: "subject", children: "What's your favorite subject?" }), (0, jsx_runtime_1.jsx)(input_1.Input, { id: "subject", placeholder: "e.g., Computer Science", value: favoriteSubject, onChange: (e) => setFavoriteSubject(e.target.value) }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-muted-foreground", children: "We're curious!" })] }))] }), (0, jsx_runtime_1.jsxs)(card_1.CardFooter, { className: "flex justify-between", children: [step > 1 ? ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: handleBack, disabled: loading, children: "Back" })) : (0, jsx_runtime_1.jsx)("div", {}), step < totalSteps ? ((0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleNext, children: "Next" })) : ((0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleSubmit, disabled: loading, children: [loading && (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Finish"] }))] })] }));
}
