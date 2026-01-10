import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles, Trophy, Gamepad2, Headphones, Monitor } from "lucide-react";

const prizes = [
    { icon: Gamepad2, name: "PlayStation 5", value: "$500", color: "text-blue-600" },
    { icon: Monitor, name: "Monitor Gaming 144Hz", value: "$350", color: "text-purple-600" },
    { icon: Headphones, name: "Audífonos Gaming", value: "$200", color: "text-pink-600" },
    { icon: Gamepad2, name: "Xbox Series X", value: "$500", color: "text-green-600" },
];

export default function GamerRaffle() {
    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Gift className="w-8 h-8 text-purple-600" />
                        Sorteo Gamer Genio Pro
                    </h1>
                    <p className="text-slate-500 mt-1">Participa automáticamente por artículos gaming premium</p>
                </div>
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full border-2 border-purple-200">
                    <p className="text-sm font-bold text-purple-700 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Genio Pro Exclusivo
                    </p>
                </div>
            </div>

            {/* Participation Status */}
            <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-4 rounded-full">
                            <Trophy className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-xl text-slate-800">¡Estás Participando! 🎉</h3>
                            <p className="text-slate-600 mt-1">
                                Como miembro <span className="font-bold text-purple-600">Genio Pro</span>,
                                automáticamente participas en todos nuestros sorteos mensuales de artículos gaming.
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                    ✓ Participación Activa
                                </Badge>
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                    Próximo sorteo: 15 Feb 2026
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Prizes Grid */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    Premios de Este Mes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {prizes.map((prize, idx) => (
                        <Card key={idx} className="border-2 hover:shadow-xl transition-all hover:border-purple-300 hover:scale-105">
                            <CardHeader className="text-center">
                                <div className="mx-auto bg-slate-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mb-3">
                                    <prize.icon className={`w-12 h-12 ${prize.color}`} />
                                </div>
                                <CardTitle className="text-lg">{prize.name}</CardTitle>
                                <CardDescription className="text-lg font-bold text-purple-600">
                                    {prize.value}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>

            {/* How It Works */}
            <Card className="border-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gift className="w-5 h-5 text-purple-600" />
                        ¿Cómo Funciona?
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                            1
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">Participación Automática</h4>
                            <p className="text-slate-600 text-sm">
                                Al ser miembro Genio Pro, automáticamente entras en todos los sorteos mensuales.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                            2
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">Gana Tickets Extra</h4>
                            <p className="text-slate-600 text-sm">
                                Completa módulos y actividades para ganar tickets adicionales y aumentar tus probabilidades.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                            3
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">Sorteo Mensual</h4>
                            <p className="text-slate-600 text-sm">
                                Cada 15 del mes realizamos el sorteo en vivo. Los ganadores son notificados por email.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardContent className="pt-6 text-center">
                        <p className="text-4xl font-black text-blue-600">5</p>
                        <p className="text-sm text-slate-600 font-medium mt-1">Tickets Actuales</p>
                    </CardContent>
                </Card>
                <Card className="border-2 border-purple-200 bg-purple-50">
                    <CardContent className="pt-6 text-center">
                        <p className="text-4xl font-black text-purple-600">15</p>
                        <p className="text-sm text-slate-600 font-medium mt-1">Días para Sorteo</p>
                    </CardContent>
                </Card>
                <Card className="border-2 border-pink-200 bg-pink-50">
                    <CardContent className="pt-6 text-center">
                        <p className="text-4xl font-black text-pink-600">$1,550</p>
                        <p className="text-sm text-slate-600 font-medium mt-1">Valor Total Premios</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
