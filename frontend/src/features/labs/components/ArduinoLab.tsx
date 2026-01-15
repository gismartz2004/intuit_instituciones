import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import {
    Cpu,
    Play,
    Save,
    Settings,
    Trash2,
    Zap,
    Code2,
    Box,
    ArrowLeft,
    Maximize2,
    Terminal,
    Grid,
    PanelLeftClose,
    PanelRightClose,
    PanelLeftOpen,
    PanelRightOpen,
    MousePointer2,
    Minimize2,
    Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

// --- Types ---
type ComponentType = "arduino" | "led" | "resistor" | "servo" | "sensor_ultra" | "breadboard" | "button" | "potentiometer";

interface Pin {
    id: string; // unique within component
    x: number; // offset relative to component
    y: number;
    label?: string;
    type?: "power" | "ground" | "digital" | "analog";
}

interface PlacedComponent {
    id: string;
    type: ComponentType;
    x: number;
    y: number;
}

interface Wire {
    id: string;
    startCompId: string;
    startPinId: string;
    endCompId: string;
    endPinId: string;
    color: string;
}

// --- Component Definitions (Visuals & Logic) ---
const COMPONENT_DEFS: Record<ComponentType, { label: string, w: number, h: number, pins: Pin[], icon: any }> = {
    arduino: {
        label: "Arduino Uno", w: 300, h: 420, icon: Cpu,
        pins: [
            // Digital Header
            { id: "d13", x: 60, y: 15, label: "13" }, { id: "d12", x: 75, y: 15, label: "12" }, { id: "d11", x: 90, y: 15, label: "~11" },
            { id: "d10", x: 105, y: 15, label: "~10" }, { id: "d9", x: 120, y: 15, label: "~9" }, { id: "d8", x: 135, y: 15, label: "8" },
            { id: "d7", x: 155, y: 15, label: "7" }, { id: "d6", x: 170, y: 15, label: "~6" }, { id: "d5", x: 185, y: 15, label: "~5" },
            { id: "d4", x: 200, y: 15, label: "4" }, { id: "d3", x: 215, y: 15, label: "~3" }, { id: "d2", x: 230, y: 15, label: "2" },
            { id: "gnd_d", x: 245, y: 15, label: "GND" },
            // Power Header
            { id: "vin", x: 160, y: 395, label: "Vin" }, { id: "gnd1", x: 175, y: 395, label: "GND" }, { id: "gnd2", x: 190, y: 395, label: "GND" },
            { id: "5v", x: 205, y: 395, label: "5V" }, { id: "3v3", x: 220, y: 395, label: "3.3V" },
            // Analog Header
            { id: "a0", x: 240, y: 395, label: "A0" }, { id: "a1", x: 255, y: 395, label: "A1" }, { id: "a2", x: 270, y: 395, label: "A2" },
            { id: "a3", x: 285, y: 395, label: "A3" }, { id: "a4", x: 300, y: 395, label: "A4" }, { id: "a5", x: 315, y: 395, label: "A5" },
        ]
    },
    breadboard: {
        label: "Protoboard", w: 500, h: 160, icon: Grid,
        pins: [] // Pins would be generated programmatically in a real app (rows/cols)
    },
    led: {
        label: "LED", w: 40, h: 80, icon: Zap,
        pins: [
            { id: "anode", x: 10, y: 75, label: "A" },
            { id: "cathode", x: 30, y: 65, label: "C" }
        ]
    },
    resistor: {
        label: "Resistencia", w: 100, h: 30, icon: Box,
        pins: [
            { id: "t1", x: 5, y: 15, label: "" },
            { id: "t2", x: 95, y: 15, label: "" }
        ]
    },
    servo: {
        label: "Servo Motor", w: 120, h: 100, icon: Settings,
        pins: [
            { id: "sig", x: 10, y: 90, label: "Sig" },
            { id: "vcc", x: 30, y: 90, label: "Vcc" },
            { id: "gnd", x: 50, y: 90, label: "GND" }
        ]
    },
    sensor_ultra: {
        label: "Ultrasonido", w: 140, h: 60, icon: Activity,
        pins: [
            { id: "vcc", x: 20, y: 55, label: "Vcc" },
            { id: "trig", x: 50, y: 55, label: "Trig" },
            { id: "echo", x: 80, y: 55, label: "Echo" },
            { id: "gnd", x: 110, y: 55, label: "GND" }
        ]
    },
    button: {
        label: "Pulsador", w: 50, h: 50, icon: MousePointer2,
        pins: [
            { id: "1a", x: 5, y: 5, label: "" },
            { id: "1b", x: 45, y: 5, label: "" },
            { id: "2a", x: 5, y: 45, label: "" },
            { id: "2b", x: 45, y: 45, label: "" }
        ]
    },
    potentiometer: {
        label: "Potenciómetro", w: 60, h: 60, icon: Settings,
        pins: [
            { id: "1", x: 10, y: 55, label: "" },
            { id: "2", x: 30, y: 55, label: "" },
            { id: "3", x: 50, y: 55, label: "" }
        ]
    }
};

export default function ArduinoLab() {
    const [components, setComponents] = useState<PlacedComponent[]>([]);
    const [wires, setWires] = useState<Wire[]>([]);
    const [code, setCode] = useState<string>(`void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}`);
    const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);

    // UI State
    const [showToolbox, setShowToolbox] = useState(true);
    const [showEditor, setShowEditor] = useState(true);
    const [isDrawingWire, setIsDrawingWire] = useState<{ compId: string, pinId: string } | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDrawingWire && canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isDrawingWire]);

    const addComponent = (type: ComponentType) => {
        const newComp: PlacedComponent = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            x: 300, // Default centerish placement
            y: 200
        };
        setComponents([...components, newComp]);
    };

    const removeComponent = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setComponents(components.filter(c => c.id !== id));
        setWires(wires.filter(w => w.startCompId !== id && w.endCompId !== id));
    };

    const handlePinClick = (e: React.MouseEvent, compId: string, pinId: string) => {
        e.stopPropagation();
        if (isDrawingWire) {
            if (isDrawingWire.compId === compId && isDrawingWire.pinId === pinId) {
                setIsDrawingWire(null); // Cancel
                return;
            }
            // Create Wire
            const newWire: Wire = {
                id: Math.random().toString(36).substr(2, 9),
                startCompId: isDrawingWire.compId,
                startPinId: isDrawingWire.pinId,
                endCompId: compId,
                endPinId: pinId,
                color: ['#ff0000', '#000000', '#00ff00', '#0000ff'][Math.floor(Math.random() * 4)] // Random wire color for MVP
            };
            setWires([...wires, newWire]);
            setIsDrawingWire(null);
        } else {
            setIsDrawingWire({ compId, pinId });
        }
    };

    const runSimulation = () => {
        setIsRunning(true);
        setConsoleOutput(prev => [...prev, "> Compilando sketch...", "> Verificando conexiones...", "> Subiendo..."]);

        // Check connections logic (Mock)
        const arduino = components.find(c => c.type === 'arduino');
        if (arduino) {
            const pin13Connections = wires.filter(w =>
                (w.startCompId === arduino.id && w.startPinId === 'd13') ||
                (w.endCompId === arduino.id && w.endPinId === 'd13')
            );
            if (pin13Connections.length > 0) {
                setTimeout(() => setConsoleOutput(prev => [...prev, "> Conexión a Pin 13 detectada."]), 800);
            }
        }

        setTimeout(() => {
            setConsoleOutput(prev => [...prev, "[SERIAL] Iniciando Loop..."]);
            setIsRunning(false);
        }, 2500);
    };

    const [dragId, setDragId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const handleDragStart = (e: React.DragEvent, id: string, startX: number, startY: number) => {
        setDragId(id);
        const rect = (e.target as Element).getBoundingClientRect();
        setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDrop = (e: React.DragEvent) => {
        if (!dragId || !canvasRef.current || !dragOffset) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - dragOffset.x;
        const y = e.clientY - rect.top - dragOffset.y;

        setComponents(prev => prev.map(c =>
            c.id === dragId ? { ...c, x, y } : c
        ));
        setDragId(null);
    };

    const getPinPos = (compId: string, pinId: string) => {
        const comp = components.find(c => c.id === compId);
        if (!comp) return { x: 0, y: 0 };
        const def = COMPONENT_DEFS[comp.type];
        const pin = def.pins.find(p => p.id === pinId);
        if (!pin) return { x: 0, y: 0 };
        return { x: comp.x + pin.x, y: comp.y + pin.y };
    };

    return (
        <div className="flex h-screen bg-[#1e1e1e] text-slate-100 font-sans overflow-hidden">
            {/* Header */}
            <div className="fixed top-0 w-full h-12 bg-[#252526] border-b border-[#333] flex items-center justify-between px-4 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white h-8">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                        </Button>
                    </Link>
                    <div className="h-4 w-[1px] bg-[#444]" />
                    <div className="flex items-center gap-2">
                        <Cpu className="text-[#00979d]" />
                        <span className="font-bold tracking-tight">Arduino Lab <Badge variant="secondary" className="ml-2 text-xs bg-[#00979d] text-white hover:bg-[#008187]">Pro</Badge></span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setShowToolbox(!showToolbox)} className={!showToolbox ? 'text-slate-500' : 'text-[#00979d]'}>
                        <PanelLeftOpen className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setShowEditor(!showEditor)} className={!showEditor ? 'text-slate-500' : 'text-[#00979d]'}>
                        <Code2 className="w-5 h-5" />
                    </Button>
                    <div className="h-6 w-[1px] bg-[#444] mx-2" />
                    <Button
                        onClick={runSimulation}
                        className={`font-bold h-8 text-xs ${isRunning ? 'bg-amber-600' : 'bg-[#00979d] hover:bg-[#008187]'}`}
                    >
                        {isRunning ? '...' : <Play className="w-3 h-3 mr-2" />} {isRunning ? 'Ejecutando' : 'Iniciar'}
                    </Button>
                </div>
            </div>

            {/* Main Layout using Grid or Flex */}
            <div className="flex w-full mt-12 h-[calc(100vh-48px)]">

                {/* Left Toolbox - Collapsible */}
                <div className={`${showToolbox ? 'w-64' : 'w-0'} bg-[#252526] border-r border-[#333] flex flex-col transition-all duration-300 overflow-hidden`}>
                    <div className="p-3 border-b border-[#333] bg-[#2d2d2e]">
                        <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Componentes</h3>
                    </div>
                    <ScrollArea className="flex-1 p-3">
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(COMPONENT_DEFS).map(([type, def]) => (
                                type !== 'breadboard' && type !== 'arduino' ? (
                                    <div
                                        key={type}
                                        onClick={() => addComponent(type as ComponentType)}
                                        className="flex flex-col items-center justify-center p-2 bg-[#333] hover:bg-[#444] rounded-md cursor-pointer transition-all border border-transparent hover:border-[#00979d] group h-20"
                                    >
                                        <def.icon className="w-6 h-6 text-slate-400 group-hover:text-white mb-1" />
                                        <span className="text-[10px] text-center font-medium leading-tight">{def.label}</span>
                                    </div>
                                ) : null
                            ))}
                            {/* Special large buttons for main boards */}
                            <div onClick={() => addComponent('arduino')} className="col-span-2 flex items-center p-2 bg-[#333] hover:bg-[#444] rounded-md cursor-pointer border border-transparent hover:border-[#00979d]">
                                <Cpu className="w-5 h-5 text-[#00979d] mr-2" />
                                <span className="text-xs font-bold">Arduino Uno R3</span>
                            </div>
                            <div onClick={() => addComponent('breadboard')} className="col-span-2 flex items-center p-2 bg-[#333] hover:bg-[#444] rounded-md cursor-pointer border border-transparent hover:border-[#00979d]">
                                <Grid className="w-5 h-5 text-slate-400 mr-2" />
                                <span className="text-xs font-bold">Protoboard</span>
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                {/* Center Canvas */}
                <div className="flex-1 bg-[#1e1e1e] relative overflow-hidden flex flex-col select-none group/canvas">
                    {/* Grid Background */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(#4a4a4a 1px, transparent 1px), linear-gradient(90deg, #4a4a4a 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }}
                    />

                    <div
                        ref={canvasRef}
                        className="flex-1 relative cursor-crosshair"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        {/* Wires Layer (SVG) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            {wires.map(wire => {
                                const start = getPinPos(wire.startCompId, wire.startPinId);
                                const end = getPinPos(wire.endCompId, wire.endPinId);
                                return (
                                    <line
                                        key={wire.id}
                                        x1={start.x} y1={start.y}
                                        x2={end.x} y2={end.y}
                                        stroke={wire.color}
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        className="opacity-80 drop-shadow-md"
                                    />
                                );
                            })}
                            {isDrawingWire && canvasRef.current && (() => {
                                const start = getPinPos(isDrawingWire.compId, isDrawingWire.pinId);
                                return (
                                    <line
                                        x1={start.x} y1={start.y}
                                        x2={mousePos.x} y2={mousePos.y}
                                        stroke="#00ff00"
                                        strokeWidth="2"
                                        strokeDasharray="5,5"
                                        className="opacity-60"
                                    />
                                );
                            })()}
                        </svg>

                        {components.map((comp) => {
                            const def = COMPONENT_DEFS[comp.type];
                            return (
                                <div
                                    key={comp.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, comp.id, comp.x, comp.y)}
                                    style={{
                                        left: comp.x,
                                        top: comp.y,
                                        width: def.w,
                                        height: def.h
                                    }}
                                    className="absolute z-10 group"
                                >
                                    {/* Component Visual */}
                                    <div className={`w-full h-full relative transition-transform ${isDrawingWire ? 'pointer-events-none' : ''}`}>
                                        {comp.type === 'arduino' ? (
                                            <div className="w-full h-full bg-[#00979d] rounded-sm shadow-xl border-2 border-[#007f85] relative">
                                                <div className="absolute top-2 left-2 text-white font-bold text-[10px]">ARDUINO</div>
                                                <div className="absolute bottom-2 right-2 text-white/50 font-bold text-[40px] leading-none">UNO</div>
                                                <div className="absolute top-[350px] left-[60px] w-20 h-8 bg-black/80 rounded border border-white/20" /> {/* Chip */}
                                                <div className="absolute top-[10px] right-[10px] w-8 h-8 bg-amber-400 rounded-full border-4 border-[#00979d]" /> {/* Reset Btn */}
                                            </div>
                                        ) : comp.type === 'breadboard' ? (
                                            <div className="w-full h-full bg-[#f3f3f3] rounded shadow-lg border-b-4 border-[#ddd] relative overflow-hidden">
                                                <div className="absolute inset-0 opacity-10" style={{ backgroundSize: '10px 10px', backgroundImage: 'radial-gradient(black 1px, transparent 1px)' }} />
                                            </div>
                                        ) : comp.type === 'led' ? (
                                            <div className="w-full h-full flex flex-col items-center relative">
                                                <div className={`w-8 h-8 rounded-full border border-red-900 ${code.includes('HIGH') && isRunning ? 'bg-red-500 shadow-[0_0_15px_red]' : 'bg-red-800'}`} />
                                                <div className="flex gap-2 h-full">
                                                    <div className="w-1 bg-gray-400 h-full" />
                                                    <div className="w-1 bg-gray-400 h-[80%]" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full bg-[#333] rounded border border-white/20 flex items-center justify-center shadow-lg">
                                                <def.icon className="text-white opacity-50" />
                                            </div>
                                        )}

                                        {/* Delete Handle */}
                                        <div
                                            onClick={(e) => removeComponent(comp.id, e)}
                                            className="absolute -top-3 -right-3 bg-red-500/80 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity z-50"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </div>

                                        {/* Pins */}
                                        {def.pins.map(pin => {
                                            let pinColor = "bg-[#1e1e1e] border-white/50";
                                            // Explicit pin coloring
                                            if (pin.type === 'power') pinColor = "bg-red-800 border-red-500";
                                            if (pin.type === 'ground') pinColor = "bg-black border-slate-500";
                                            if (pin.type === 'digital') pinColor = "bg-emerald-900 border-emerald-500";
                                            if (pin.type === 'analog') pinColor = "bg-blue-900 border-blue-500";

                                            // Highlight when drawing wire from this pin
                                            const isSelected = isDrawingWire?.pinId === pin.id && isDrawingWire?.compId === comp.id;

                                            return (
                                                <div
                                                    key={pin.id}
                                                    onClick={(e) => handlePinClick(e, comp.id, pin.id)}
                                                    className={`absolute w-3.5 h-3.5 border rounded-full cursor-crosshair z-20 hover:scale-125 transition-all ${isSelected ? 'bg-yellow-400 border-yellow-200 shadow-[0_0_10px_yellow]' : pinColor}`}
                                                    style={{ left: pin.x - 7, top: pin.y - 7 }}
                                                >
                                                    <TooltipProvider delayDuration={0}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild><div className="w-full h-full opacity-0 hover:opacity-100 absolute inset-0 bg-transparent" /></TooltipTrigger>
                                                            <TooltipContent side="top" className="text-xs font-bold py-1 px-2 border-slate-700 bg-slate-900 text-white z-50">
                                                                {pin.label}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Editor - Collapsible */}
                <div className={`${showEditor ? 'w-[500px]' : 'w-0'} bg-[#1e1e1e] border-l border-[#333] flex flex-col transition-all duration-300`}>
                    {showEditor && (
                        <Tabs defaultValue="code" className="w-full flex-1 flex flex-col">
                            <div className="border-b border-[#333] px-2 flex justify-between items-center bg-[#252526]">
                                <TabsList className="bg-transparent h-10">
                                    <TabsTrigger value="blocks" className="text-xs data-[state=active]:bg-[#333] data-[state=active]:text-white text-slate-400">
                                        <Box className="w-3 h-3 mr-2" /> Bloques
                                    </TabsTrigger>
                                    <TabsTrigger value="code" className="text-xs data-[state=active]:bg-[#333] data-[state=active]:text-white text-slate-400">
                                        <Code2 className="w-3 h-3 mr-2" /> C++
                                    </TabsTrigger>
                                </TabsList>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => setShowEditor(false)}>
                                    <Minimize2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <TabsContent value="code" className="flex-1 p-0 m-0 relative">
                                <Textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="absolute inset-0 w-full h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm p-4 resize-none border-0 focus-visible:ring-0 rounded-none leading-relaxed"
                                    spellCheck={false}
                                />
                            </TabsContent>

                            <TabsContent value="blocks" className="flex-1 p-0 m-0 bg-[#e5e7eb] relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center opacity-50 pointer-events-none">
                                    <div className="text-center text-slate-400">
                                        <Box className="w-16 h-16 mx-auto mb-2" />
                                        <p className="font-bold">Espacio de Trabajo Blockly</p>
                                    </div>
                                </div>
                                {/* Mock Blockly Area */}
                            </TabsContent>

                            <div className="h-40 bg-[#252526] border-t border-[#333] flex flex-col">
                                <div className="px-3 py-1 border-b border-[#333] flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Salida Serial</span>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setConsoleOutput([])}>
                                            <Trash2 className="w-3 h-3 text-slate-500" />
                                        </Button>
                                    </div>
                                </div>
                                <ScrollArea className="flex-1 p-2 font-mono text-xs">
                                    {consoleOutput.length === 0 && <span className="text-slate-600 italic">...</span>}
                                    {consoleOutput.map((line, i) => (
                                        <div key={i} className="text-emerald-400 mb-0.5">{line}</div>
                                    ))}
                                </ScrollArea>
                            </div>
                        </Tabs>
                    )}
                </div>
            </div>
        </div>
    );
}
