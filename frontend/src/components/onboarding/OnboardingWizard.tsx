import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

// Import avatars
import avatarBoy from "@/assets/avatars/avatar_boy.png";
import avatarGirl from "@/assets/avatars/avatar_girl.png";
import avatarRobot from "@/assets/avatars/avatar_robot.png";
import avatarPet from "@/assets/avatars/avatar_pet.png";

const AVATARS = [
    { id: 'avatar_boy', src: avatarBoy, label: "Genio Tech" },
    { id: 'avatar_girl', src: avatarGirl, label: "Cyber Girl" },
    { id: 'avatar_robot', src: avatarRobot, label: "Robo-Amigo" },
    { id: 'avatar_pet', src: avatarPet, label: "Astro Cat" },
];

interface OnboardingWizardProps {
    isOpen: boolean;
    userId: string;
    onComplete: (avatarId: string) => void;
}

export function OnboardingWizard({ isOpen, userId, onComplete }: OnboardingWizardProps) {
    const [step, setStep] = useState(1);
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFinish = async () => {
        setIsSubmitting(true);
        try {
            // Update user in backend
            const res = await fetch(`http://localhost:3000/api/usuarios/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    avatar: selectedAvatar,
                    onboardingCompleted: true
                })
            });

            if (res.ok) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                onComplete(selectedAvatar);
            }
        } catch (error) {
            console.error("Failed to complete onboarding", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-[600px] h-[500px] p-0 overflow-hidden bg-white border-none shadow-2xl">
                <div className="relative w-full h-full flex flex-col">
                    {/* Decorative Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 opacity-10 z-0" />
                    <div className="absolute top-0 right-0 p-8 opacity-20">
                        <Sparkles className="w-32 h-32 text-blue-500" />
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center space-y-6"
                            >
                                <div className="bg-blue-100 p-4 rounded-full mb-4">
                                    <span className="text-4xl">👋</span>
                                </div>
                                <h2 className="text-3xl font-black text-slate-800">¡Bienvenido a Edu-Connect!</h2>
                                <p className="text-lg text-slate-600 max-w-md">
                                    Estás a punto de iniciar una aventura increíble. Aprende programación, electrónica y más mientras exploras nuestra ciudad tecnológica.
                                </p>
                                <Button
                                    size="lg"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                                    onClick={() => setStep(2)}
                                >
                                    ¡Vamos a empezar! <ChevronRight className="ml-2 w-5 h-5" />
                                </Button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="relative z-10 flex flex-col items-center justify-center h-full p-8 space-y-6"
                            >
                                <h2 className="text-2xl font-bold text-slate-800">Elige tu Avatar</h2>
                                <p className="text-slate-500">¿Quién quieres ser en este viaje?</p>

                                <div className="grid grid-cols-4 gap-4 w-full">
                                    {AVATARS.map((avatar) => (
                                        <div
                                            key={avatar.id}
                                            className={`cursor-pointer group relative p-2 rounded-xl border-2 transition-all ${selectedAvatar === avatar.id ? 'border-blue-500 bg-blue-50 scale-105 shadow-md' : 'border-slate-200 hover:border-blue-300'}`}
                                            onClick={() => setSelectedAvatar(avatar.id)}
                                        >
                                            <img src={avatar.src} alt={avatar.label} className="w-full h-auto drop-shadow-sm group-hover:drop-shadow-md transition-all" />
                                            <p className={`text-xs font-bold text-center mt-2 ${selectedAvatar === avatar.id ? 'text-blue-600' : 'text-slate-500'}`}>{avatar.label}</p>
                                            {selectedAvatar === avatar.id && (
                                                <div className="absolute -top-2 -right-2 bg-blue-500 text-white p-1 rounded-full shadow-sm">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button variant="ghost" onClick={() => setStep(1)}>Atrás</Button>
                                    <Button
                                        size="lg"
                                        className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-8 shadow-lg"
                                        onClick={handleFinish}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Guardando..." : "¡Listo para la acción!"}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
