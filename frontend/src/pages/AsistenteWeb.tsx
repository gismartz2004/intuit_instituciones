import { motion } from "framer-motion";
import { Bot, Sparkles, Shield, Zap, HelpCircle } from "lucide-react";
import ChatBot from "@/features/asistente-web/components/ChatBot";
import { Seo } from "@/components/common/Seo";

export default function AsistenteWeb() {
    return (
        <div className="min-h-screen w-full bg-[#020617] relative overflow-hidden">
            <Seo
                title="Asistente Virtual - Intuit Model Education"
                description="Obtén ayuda instantánea con nuestro asistente virtual. Preguntas frecuentes sobre login, navegación, progreso estudiantil y soporte técnico."
                keywords="asistente virtual, ayuda, FAQ, soporte, Intuit Model, preguntas frecuentes"
            />

            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Circuit Grid */}
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(34, 211, 238, 0.4) 1px, transparent 0)`,
                        backgroundSize: "40px 40px",
                    }}
                />

                {/* Animated Orbs */}
                <motion.div
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{
                        x: [0, -40, 0],
                        y: [0, -60, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full"
                />
            </div>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
                    <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
                        <div className="flex items-center justify-between">
                            {/* Logo & Title */}
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                                    <Bot className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg md:text-2xl font-black text-white tracking-tight">
                                        Asistente Virtual
                                    </h1>
                                    <p className="text-xs md:text-sm text-slate-400 font-medium">
                                        Intuit Model Education
                                    </p>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 md:px-4 py-1.5 md:py-2 rounded-full">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-xs md:text-sm text-emerald-400 font-bold">Online</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Chat Container */}
                <div className="flex-1 container mx-auto px-4 md:px-6 py-4 md:py-8 flex flex-col">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex-1 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        <ChatBot className="h-full" />
                    </motion.div>
                </div>

                {/* Footer Info */}
                <footer className="border-t border-white/10 bg-slate-900/50 backdrop-blur-xl py-4 md:py-6">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            {/* Feature 1 */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm md:text-base font-bold text-white mb-1">
                                        Respuestas Instantáneas
                                    </h3>
                                    <p className="text-xs md:text-sm text-slate-400">
                                        Obtén ayuda inmediata las 24/7
                                    </p>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm md:text-base font-bold text-white mb-1">
                                        Información Segura
                                    </h3>
                                    <p className="text-xs md:text-sm text-slate-400">
                                        Tus consultas son privadas y seguras
                                    </p>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm md:text-base font-bold text-white mb-1">
                                        Siempre Actualizado
                                    </h3>
                                    <p className="text-xs md:text-sm text-slate-400">
                                        Base de conocimiento en constante mejora
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Copyright */}
                        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-2">
                            <p className="text-xs text-slate-500 font-medium">
                                © 2026 Intuit Model Education. Todos los derechos reservados.
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <HelpCircle className="w-3 h-3" />
                                <span>¿Necesitas más ayuda? Contacta: soporte@intuitmodel.education</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
