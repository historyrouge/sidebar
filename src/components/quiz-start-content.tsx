
"use client";
import { useEffect, useState } from "react";
import QuizInterface from "./quiz-interface";
import { GenerateQuizzesOutput } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

type QuizData = {
    quizzes: GenerateQuizzesOutput['quizzes'];
    options: {
        difficulty: string;
        numQuestions: number;
        timeLimit: number;
    }
}

export function QuizStartContent() {
    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        try {
            const savedQuiz = localStorage.getItem('currentQuiz');
            if (savedQuiz) {
                const parsedData: QuizData = JSON.parse(savedQuiz);
                // Trim the quiz to the selected number of questions
                parsedData.quizzes = parsedData.quizzes.slice(0, parsedData.options.numQuestions);
                setQuizData(parsedData);
            } else {
                router.push('/quiz');
                toast({ title: "No quiz found.", description: "Please generate a quiz first.", variant: "destructive" });
            }
        } catch (error) {
            router.push('/quiz');
            toast({ title: "Failed to load quiz.", description: "The quiz data appears to be corrupted.", variant: "destructive" });
        }
    }, [router, toast]);

    const handleAnswer = (answer: string) => {
        // Here you would handle the answer logic, e.g., check if correct, store score, etc.
        console.log(`Answered with: ${answer}`);
        // For now, just move to the next question.
        if (quizData && currentQuestionIndex < quizData.quizzes.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Quiz finished
            alert("Quiz finished!");
            // You might want to navigate to a results page here.
        }
    };
    
    const handleTimeUp = () => {
        alert("Time's up!");
        // Navigate to results page or show score.
    }

    if (!quizData) {
        return <div className="flex h-screen w-full items-center justify-center">Loading Quiz...</div>;
    }

    const currentQuestion = quizData.quizzes[currentQuestionIndex];

    return (
        <QuizInterface 
            subject={quizData.options.difficulty}
            durationSec={quizData.options.timeLimit}
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={quizData.quizzes.length}
            questionText={currentQuestion.question}
            options={currentQuestion.options}
            onAnswer={handleAnswer}
            onTimeUp={handleTimeUp}
            autoStart
        />
    )
}
