import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Sparkles, User, Phone, Briefcase, Mail } from "lucide-react";
import confetti from "canvas-confetti";
import { authApi } from '../services/auth.api';

// Import avatars
import avatarBoy from "@/assets/avatars/avatar_boy.png";
import avatarGirl from "@/assets/avatars/avatar_girl.png";
import avatarRobot from "@/assets/avatars/avatar_robot.png";
import avatarPet from "@/assets/avatars/avatar_pet.png";
import { useToast } from "@/hooks/use-toast";

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
    const { toast } = useToast();

    // Parent Info State
    const [parentInfo, setParentInfo] = useState({
        nombrePadre: '',
        emailPadre: '',
        celularPadre: '',
        trabajoPadre: ''
    });

    // Student Extended Info State
    const [studentInfo, setStudentInfo] = useState({
        identificacion: '',
        fechaNacimiento: '',
        edad: '',
        institucion: '',
        curso: ''
    });

    // Validations
    const isParentStepValid = () => {
        return (
            parentInfo.nombrePadre.trim().length > 3 &&
            parentInfo.celularPadre.trim().length > 5 &&
            parentInfo.trabajoPadre.trim().length > 2
        );
    };

    const isStudentStepValid = () => {
        return (
            studentInfo.identificacion.trim().length > 5 &&
            studentInfo.fechaNacimiento.trim().length > 0 &&
            studentInfo.institucion.trim().length > 3 &&
            studentInfo.curso.trim().length > 0
        );
    };

    const handleFinish = async () => {
        if (!isParentStepValid()) {
            toast({
                title: "Faltan datos",
                description: "Por favor completa toda la información de tu representante.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await authApi.updateUser(userId, {
                avatar: selectedAvatar,
                onboardingCompleted: true,
                nombrePadre: parentInfo.nombrePadre,
                emailPadre: parentInfo.emailPadre,
                celularPadre: parentInfo.celularPadre,
                trabajoPadre: parentInfo.trabajoPadre,
                identificacion: studentInfo.identificacion,
                fechaNacimiento: studentInfo.fechaNacimiento,
                edad: studentInfo.edad ? parseInt(studentInfo.edad) : undefined,
                institucion: studentInfo.institucion,
                curso: studentInfo.curso
            });

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            onComplete(selectedAvatar);
        } catch (error) {
            console.error("Failed to complete onboarding", error);
            toast({
                title: "Error",
                description: "No se pudo guardar la información. Inténtalo de nuevo.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-[600px] h-[600px] p-0 overflow-hidden bg-white border-none shadow-2xl">
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
                                <h2 className="text-3xl font-black text-slate-800">¡Bienvenido a Arg Academy!</h2>
                                <p className="text-lg text-slate-600 max-w-md">
                                    Estás a punto de iniciar una aventura increíble. Antes de comenzar, necesitamos configurar tu perfil.
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
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-8 shadow-lg"
                                        onClick={() => setStep(3)}
                                    >
                                        Siguiente <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="relative z-10 flex flex-col items-center justify-center h-full p-8 space-y-3 w-full max-w-md mx-auto overflow-y-auto"
                            >
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-slate-800">Tus Datos Personales</h2>
                                    <p className="text-sm text-slate-500">Completa tu información de estudiante</p>
                                </div>

                                <div className="w-full space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-600">Número de Cédula</Label>
                                            <Input
                                                placeholder="Ej: 1712345678"
                                                value={studentInfo.identificacion}
                                                onChange={(e) => setStudentInfo({ ...studentInfo, identificacion: e.target.value })}
                                                className="h-9 text-sm bg-slate-50 border-slate-200"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-600">Edad</Label>
                                            <Input
                                                type="number"
                                                placeholder="Ej: 14"
                                                value={studentInfo.edad}
                                                onChange={(e) => setStudentInfo({ ...studentInfo, edad: e.target.value })}
                                                className="h-9 text-sm bg-slate-50 border-slate-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs text-slate-600">Fecha de Nacimiento</Label>
                                        <Input
                                            type="date"
                                            value={studentInfo.fechaNacimiento}
                                            onChange={(e) => setStudentInfo({ ...studentInfo, fechaNacimiento: e.target.value })}
                                            className="h-9 text-sm bg-slate-50 border-slate-200"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs text-slate-600">Unidad Educativa / Institución</Label>
                                        <Input
                                            placeholder="Ej: Colegio San Gabriel"
                                            value={studentInfo.institucion}
                                            onChange={(e) => setStudentInfo({ ...studentInfo, institucion: e.target.value })}
                                            className="h-9 text-sm bg-slate-50 border-slate-200"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs text-slate-600">Curso / Grado</Label>
                                        <Input
                                            placeholder="Ej: 10mo EGB / 2do BGU"
                                            value={studentInfo.curso}
                                            onChange={(e) => setStudentInfo({ ...studentInfo, curso: e.target.value })}
                                            className="h-9 text-sm bg-slate-50 border-slate-200"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-2 w-full justify-center">
                                    <Button variant="ghost" size="sm" onClick={() => setStep(2)}>Atrás</Button>
                                    <Button
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-6 shadow-md"
                                        onClick={() => {
                                            if (isStudentStepValid()) setStep(4);
                                            else toast({ title: "Datos incompletos", description: "Por favor completa los campos obligatorios.", variant: "destructive" });
                                        }}
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="relative z-10 flex flex-col items-center justify-center h-full p-8 space-y-4 w-full max-w-md mx-auto"
                            >
                                <div className="text-center mb-2">
                                    <h2 className="text-2xl font-bold text-slate-800">Datos de tu Representante</h2>
                                    <p className="text-sm text-slate-500">Información de contacto importante</p>
                                </div>

                                <div className="w-full space-y-3">
                                    <div className="space-y-1">
                                        <Label className="flex items-center gap-2 text-slate-600">
                                            <User className="w-4 h-4" /> Nombre Completo del Padre/Madre
                                        </Label>
                                        <Input
                                            placeholder="Ej: María Pérez"
                                            value={parentInfo.nombrePadre}
                                            onChange={(e) => setParentInfo({ ...parentInfo, nombrePadre: e.target.value })}
                                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="flex items-center gap-2 text-slate-600">
                                            <Mail className="w-4 h-4" /> Email del Padre/Madre
                                        </Label>
                                        <Input
                                            placeholder="Ej: maria@perez.com"
                                            type="email"
                                            value={parentInfo.emailPadre}
                                            onChange={(e) => setParentInfo({ ...parentInfo, emailPadre: e.target.value })}
                                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="flex items-center gap-2 text-slate-600">
                                            <Phone className="w-4 h-4" /> Teléfono / Celular
                                        </Label>
                                        <Input
                                            placeholder="Ej: 0991234567"
                                            value={parentInfo.celularPadre}
                                            onChange={(e) => setParentInfo({ ...parentInfo, celularPadre: e.target.value })}
                                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="flex items-center gap-2 text-slate-600">
                                            <Briefcase className="w-4 h-4" /> Profesión / Lugar de Trabajo
                                        </Label>
                                        <Input
                                            placeholder="Ej: Ingeniera Civil / Empresa X"
                                            value={parentInfo.trabajoPadre}
                                            onChange={(e) => setParentInfo({ ...parentInfo, trabajoPadre: e.target.value })}
                                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4 w-full justify-center">
                                    <Button variant="ghost" onClick={() => setStep(3)}>Atrás</Button>
                                    <Button
                                        size="lg"
                                        className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-8 shadow-lg w-full max-w-[200px]"
                                        onClick={handleFinish}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Guardando..." : "¡Finalizar!"}
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
