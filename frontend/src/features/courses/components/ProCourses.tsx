import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Clock, Sparkles, Lock } from "lucide-react";

const upcomingCourses = [
    {
        title: "Desarrollo Web Avanzado",
        description: "Aprende React, Node.js y bases de datos modernas",
        duration: "8 semanas",
        level: "Intermedio",
        launchDate: "Marzo 2026"
    },
    {
        title: "Inteligencia Artificial Práctica",
        description: "Crea tus propios modelos de IA desde cero",
        duration: "10 semanas",
        level: "Avanzado",
        launchDate: "Abril 2026"
    },
    {
        title: "Diseño UX/UI Profesional",
        description: "Domina Figma y principios de diseño centrado en el usuario",
        duration: "6 semanas",
        level: "Principiante",
        launchDate: "Marzo 2026"
    }
];

export default function ProCourses() {
    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <GraduationCap className="w-8 h-8 text-purple-600" />
                        Cursos Exclusivos Pro
                    </h1>
                    <p className="text-slate-500 mt-1">Certificaciones gratuitas para miembros Genio Pro</p>
                </div>
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full border-2 border-purple-200">
                    <p className="text-sm font-bold text-purple-700 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Genio Pro Exclusivo
                    </p>
                </div>
            </div>

            {/* Notice Banner */}
            <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-purple-600 p-3 rounded-full">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-slate-800">¡Próximamente!</h3>
                            <p className="text-slate-600">
                                Estos cursos se abrirán en <span className="font-bold text-purple-600">2 meses</span>.
                                Como miembro Pro, tendrás acceso gratuito a todas las certificaciones.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingCourses.map((course, idx) => (
                    <Card key={idx} className="border-2 hover:shadow-lg transition-all hover:border-purple-300">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="bg-purple-100 p-2 rounded-lg">
                                    <GraduationCap className="w-6 h-6 text-purple-600" />
                                </div>
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                    {course.level}
                                </Badge>
                            </div>
                            <CardTitle className="text-lg mt-4">{course.title}</CardTitle>
                            <CardDescription>{course.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Clock className="w-4 h-4" />
                                <span>{course.duration}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-purple-600">
                                <Sparkles className="w-4 h-4" />
                                <span>Lanzamiento: {course.launchDate}</span>
                            </div>
                            <Button
                                className="w-full bg-slate-300 text-slate-500 cursor-not-allowed"
                                disabled
                            >
                                <Lock className="w-4 h-4 mr-2" />
                                Próximamente
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Benefits Section */}
            <Card className="border-2 border-blue-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        Beneficios de Genio Pro
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span className="text-slate-700">✅ Acceso gratuito a todas las certificaciones</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span className="text-slate-700">✅ Prioridad en inscripciones</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span className="text-slate-700">✅ Certificados verificados al completar</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span className="text-slate-700">✅ Soporte prioritario de instructores</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
