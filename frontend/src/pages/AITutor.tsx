import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Sparkles, BookOpen, Calculator, FlaskConical } from "lucide-react";

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function AITutor() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: '¡Hola! Soy tu Tutor IA de Genios AI 🤖. Estoy aquí para ayudarte con tus tareas y resolver tus dudas. ¿En qué puedo ayudarte hoy?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const quickQuestions = [
        { icon: Calculator, text: "Ayuda con matemáticas", query: "¿Puedes ayudarme con un problema de matemáticas?" },
        { icon: BookOpen, text: "Explicar un tema", query: "¿Puedes explicarme un tema de forma simple?" },
        { icon: FlaskConical, text: "Ciencias", query: "Tengo una pregunta sobre ciencias" }
    ];

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        // Simulate AI response (replace with actual API call)
        setTimeout(() => {
            const aiMessage: Message = {
                role: 'assistant',
                content: `Entiendo tu pregunta sobre "${input}". Como tu Tutor IA, te ayudaré paso a paso. Esta es una respuesta de demostración. En producción, aquí se integraría con una API de IA real para proporcionar ayuda personalizada con tus tareas.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            setLoading(false);
        }, 1500);
    };

    const handleQuickQuestion = (query: string) => {
        setInput(query);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 rounded-xl">
                    <Bot className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Tutor IA - Genios AI</h1>
                    <p className="text-slate-500">Tu asistente personal para tareas y aprendizaje</p>
                </div>
                <div className="ml-auto">
                    <div className="bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full border-2 border-purple-200">
                        <p className="text-sm font-bold text-purple-700 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Genio Pro Exclusivo
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Questions */}
            {messages.length <= 1 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickQuestions.map((q, idx) => (
                        <Card
                            key={idx}
                            className="cursor-pointer hover:shadow-lg transition-all hover:border-purple-300"
                            onClick={() => handleQuickQuestion(q.query)}
                        >
                            <CardContent className="pt-6 flex items-center gap-3">
                                <div className="bg-purple-100 p-3 rounded-lg">
                                    <q.icon className="w-5 h-5 text-purple-600" />
                                </div>
                                <p className="font-medium text-slate-700">{q.text}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Chat Area */}
            <Card className="border-2">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Bot className="w-5 h-5 text-purple-600" />
                        Conversación
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[500px] p-6">
                        <div className="space-y-4">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-100 text-slate-800'
                                            }`}
                                    >
                                        <p className="text-sm">{msg.content}</p>
                                        <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                                            {msg.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-100 rounded-2xl px-4 py-3">
                                        <div className="flex gap-2">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="border-t-2 p-4 bg-slate-50">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Escribe tu pregunta o tarea aquí..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                className="flex-1"
                            />
                            <Button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                            💡 Tip: Sé específico con tus preguntas para obtener mejores respuestas
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
