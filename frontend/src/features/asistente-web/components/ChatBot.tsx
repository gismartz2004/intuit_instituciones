import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, HelpCircle, Lock, Compass, TrendingUp, Wrench, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import faqData from "../data/faq-data.json";

interface Message {
    id: string;
    type: "user" | "bot";
    content: string;
    timestamp: Date;
    relatedQuestions?: string[];
}

interface ChatBotProps {
    className?: string;
}

export default function ChatBot({ className = "" }: ChatBotProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Send welcome message on mount
        const welcomeMsg: Message = {
            id: Date.now().toString(),
            type: "bot",
            content: faqData.welcomeMessage,
            timestamp: new Date(),
        };
        setMessages([welcomeMsg]);
    }, []);

    const getCategoryIcon = (iconName: string) => {
        const icons: Record<string, any> = {
            Lock,
            Compass,
            TrendingUp,
            Wrench,
            User: UserIcon,
            HelpCircle,
        };
        return icons[iconName] || HelpCircle;
    };

    const findBestMatch = (query: string): any => {
        const lowerQuery = query.toLowerCase();
        let bestMatch: any = null;
        let highestScore = 0;

        faqData.categories.forEach((category) => {
            category.questions.forEach((question) => {
                let score = 0;

                // Check keywords
                question.keywords.forEach((keyword: string) => {
                    if (lowerQuery.includes(keyword.toLowerCase())) {
                        score += 3;
                    }
                });

                // Check question text
                if (lowerQuery.includes(question.question.toLowerCase())) {
                    score += 5;
                }

                // Partial matches
                const queryWords = lowerQuery.split(" ");
                queryWords.forEach((word) => {
                    if (word.length > 3) {
                        question.keywords.forEach((keyword: string) => {
                            if (keyword.toLowerCase().includes(word)) {
                                score += 1;
                            }
                        });
                    }
                });

                if (score > highestScore) {
                    highestScore = score;
                    bestMatch = question;
                }
            });
        });

        return highestScore >= 2 ? bestMatch : null;
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        // Simulate typing delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const match = findBestMatch(input);
        const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            type: "bot",
            content: match ? match.answer : faqData.defaultResponse,
            timestamp: new Date(),
            relatedQuestions: match?.relatedQuestions || [],
        };

        setIsTyping(false);
        setMessages((prev) => [...prev, botResponse]);
    };

    const handleQuickAction = (questionId: string) => {
        const question = faqData.categories
            .flatMap((cat) => cat.questions)
            .find((q) => q.id === questionId);

        if (question) {
            const userMessage: Message = {
                id: Date.now().toString(),
                type: "user",
                content: question.question,
                timestamp: new Date(),
            };

            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                type: "bot",
                content: question.answer,
                timestamp: new Date(),
                relatedQuestions: question.relatedQuestions || [],
            };

            setMessages((prev) => [...prev, userMessage, botResponse]);
        }
    };

    const handleRelatedQuestion = (questionId: string) => {
        handleQuickAction(questionId);
    };

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                <AnimatePresence initial={false}>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"
                                    }`}
                            >
                                {/* Avatar */}
                                <div
                                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === "bot"
                                        ? "bg-gradient-to-br from-cyan-600 to-blue-700"
                                        : "bg-gradient-to-br from-purple-600 to-pink-600"
                                        }`}
                                >
                                    {message.type === "bot" ? (
                                        <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                    ) : (
                                        <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div
                                    className={`rounded-2xl p-4 ${message.type === "bot"
                                        ? "bg-slate-800/50 border border-white/10"
                                        : "bg-gradient-to-br from-cyan-600 to-blue-700"
                                        }`}
                                >
                                    <div className="text-sm md:text-base text-white whitespace-pre-line leading-relaxed">
                                        {message.content}
                                    </div>

                                    {/* Related Questions */}
                                    {message.type === "bot" && message.relatedQuestions && message.relatedQuestions.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-white/10">
                                            <p className="text-xs text-slate-400 mb-2 font-semibold">Preguntas relacionadas:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {message.relatedQuestions.map((qId) => {
                                                    const relatedQ = faqData.categories
                                                        .flatMap((cat) => cat.questions)
                                                        .find((q) => q.id === qId);
                                                    return relatedQ ? (
                                                        <button
                                                            key={qId}
                                                            onClick={() => handleRelatedQuestion(qId)}
                                                            className="text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 px-3 py-1.5 rounded-full transition-colors border border-cyan-500/30"
                                                        >
                                                            {relatedQ.question}
                                                        </button>
                                                    ) : null;
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                    >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-4">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions (only show when no messages or just welcome) */}
            {messages.length <= 1 && (
                <div className="px-4 md:px-6 pb-4">
                    <p className="text-xs text-slate-400 mb-3 font-semibold">Acciones rápidas:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {faqData.quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => handleQuickAction(action.questionId)}
                                className="text-left text-sm bg-slate-800/30 hover:bg-slate-800/50 border border-white/10 hover:border-cyan-500/30 text-white px-4 py-3 rounded-xl transition-all"
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="border-t border-white/10 p-4 md:p-6 bg-slate-900/50">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex gap-2"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escribe tu pregunta aquí..."
                        className="flex-1 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 rounded-xl h-12"
                    />
                    <Button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white border-0 rounded-xl px-6 h-12"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
                <p className="text-xs text-slate-500 mt-2 text-center">
                    Presiona Enter para enviar • Powered by Intuit Model AI
                </p>
            </div>
        </div>
    );
}
