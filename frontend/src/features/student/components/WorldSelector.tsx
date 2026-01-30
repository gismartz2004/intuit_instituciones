import { useState, useEffect, Suspense, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
    Float,
    OrbitControls,
    Html,
    Stars,
    PerspectiveCamera,
    Environment,
    Text,
    ContactShadows
} from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import {
    Rocket,
    Zap,
    ChevronRight,
    Target,
    Activity,
    Compass,
    MousePointer2
} from "lucide-react";
import { studentApi } from "../services/student.api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// --- Sub-components 3D ---

function Planet({ position, color, name, progress, onClick, index: idx }: any) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const groupRef = useRef<THREE.Group>(null!);
    const [hovered, setHovered] = useState(false);

    // Dynamic rotation and floating
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
            meshRef.current.rotation.x += 0.002;
        }
        if (groupRef.current && !hovered) {
            groupRef.current.position.y = position[1] + Math.sin(t + idx * 0.5) * 0.2;
        }
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Hover Detector Layer - Invisible but larger to avoid flickering */}
            <mesh
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onClick={onClick}
                visible={false}
            >
                <sphereGeometry args={[1.5, 16, 16]} />
            </mesh>

            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <mesh ref={meshRef}>
                    <sphereGeometry args={[1, 64, 64]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={hovered ? 0.6 : 0.1}
                        roughness={0.2}
                        metalness={0.7}
                    />

                    {/* Atmospheric Layer */}
                    <mesh scale={1.15}>
                        <sphereGeometry args={[1, 64, 64]} />
                        <meshStandardMaterial
                            color={color}
                            transparent
                            opacity={0.1}
                            side={THREE.BackSide}
                        />
                    </mesh>
                </mesh>
            </Float>

            {/* Selection Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
                <ringGeometry args={[1.2, 1.25, 64]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={hovered ? 0.6 : 0.1}
                />
            </mesh>

            {/* Information UI (Floating HTML Overlay) */}
            <Html
                position={[0, 1.8, 0]}
                center
                distanceFactor={12}
                occlude
                className="pointer-events-none select-none"
            >
                <div className={cn(
                    "flex flex-col items-center gap-2 transition-all duration-500 transform w-[220px]",
                    hovered ? "scale-105 opacity-100" : "scale-90 opacity-60"
                )}>
                    <div className="bg-slate-950/80 backdrop-blur-2xl border border-white/10 p-4 rounded-[1.5rem] shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden relative">
                        {/* Status Light */}
                        <div className={cn(
                            "absolute top-3 right-3 w-1.5 h-1.5 rounded-full animate-pulse",
                            hovered ? "bg-cyan-400" : "bg-white/20"
                        )} />

                        <div className="mb-2">
                            <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.4em]">Node_{idx.toString().padStart(3, '0')}</span>
                        </div>

                        <h3 className="text-sm font-black text-white uppercase tracking-tight mb-3 leading-tight truncate">
                            {name}
                        </h3>

                        {/* Energy Bar */}
                        <div className="w-full space-y-1.5">
                            <div className="flex justify-between items-center px-0.5">
                                <span className="text-[7px] font-black text-white/30 uppercase tracking-widest">Level</span>
                                <span className="text-[9px] font-black text-cyan-400/80">{progress}%</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className={cn(
                                        "h-full shadow-[0_0_10px_rgba(34,211,238,0.5)]",
                                        idx % 2 === 0 ? "bg-cyan-500" : "bg-blue-500"
                                    )}
                                />
                            </div>
                        </div>

                        {/* Action Hint */}
                        {hovered && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-3 pt-3 border-t border-white/5 flex items-center justify-center gap-1.5 text-[8px] font-black text-cyan-400 uppercase tracking-widest"
                            >
                                <Rocket className="w-2.5 h-2.5" /> Launch Mission
                            </motion.div>
                        )}
                    </div>
                </div>
            </Html>
        </group>
    );
}

function Scene({ modules, onSelect }: any) {
    const orbitRef = useRef<any>(null!);

    // Positions in a spiral or circular formation
    const planetPositions = useMemo(() => {
        const radius = 9;
        return modules.map((_: any, i: number) => {
            const angle = (i / modules.length) * Math.PI * 2;
            return [
                Math.sin(angle) * radius,
                Math.cos(angle * 2) * 0.5,
                Math.cos(angle) * radius
            ];
        });
    }, [modules.length]);

    const colors = ["#0ea5e9", "#6366f1", "#06b6d4", "#8b5cf6", "#3b82f6"];

    return (
        <>
            <OrbitControls
                ref={orbitRef}
                enablePan={false}
                enableZoom={true}
                minDistance={10}
                maxDistance={25}
                enableDamping={true}
                dampingFactor={0.05}
                autoRotate={!false} // Let it rotate slowly for "alive" feel
                autoRotateSpeed={0.3}
                maxPolarAngle={Math.PI / 1.5}
                minPolarAngle={Math.PI / 4}
            />

            <ambientLight intensity={0.4} />
            <pointLight position={[15, 15, 15]} intensity={1} color="#ffffff" />
            <pointLight position={[-15, -15, -15]} intensity={0.5} color="#3b82f6" />

            <Stars
                radius={150}
                depth={60}
                count={8000}
                factor={6}
                saturation={0}
                fade
                speed={1.5}
            />

            <group position={[0, 0, 0]}>
                {modules.map((mod: any, i: number) => (
                    <Planet
                        key={mod.id}
                        index={i}
                        position={planetPositions[i]}
                        color={colors[i % colors.length]}
                        name={mod.nombreModulo}
                        progress={Math.floor(Math.random() * 40) + 30} // Simulated progress
                        onClick={() => onSelect(mod.id)}
                    />
                ))}

                {/* Galactic Grid / HUD floor */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
                    <ringGeometry args={[8.5, 12, 64]} />
                    <meshStandardMaterial color="#3b82f6" transparent opacity={0.05} side={THREE.DoubleSide} />
                </mesh>

                <gridHelper
                    args={[30, 10, "#3b82f6", "#1e293b"]}
                    position={[0, -2.1, 0]}
                    onUpdate={(self: any) => {
                        self.material.transparent = true;
                        self.material.opacity = 0.1;
                    }}
                />
            </group>

            <Environment preset="night" />
        </>
    );
}

// --- Main Component ---

export default function WorldSelector({ user }: WorldSelectorProps) {
    const [, setLocation] = useLocation();
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const data = await studentApi.getModules(user.id);
                setModules(data);
            } catch (error) {
                console.error("Error loading worlds:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchModules();
    }, [user.id]);

    if (loading) {
        return (
            <div className="h-screen w-full bg-[#030712] flex flex-col items-center justify-center text-white relative">
                <div className="absolute inset-0 opacity-10 bg-[url('/assets/images/galactic_bg.png')] bg-cover bg-center blur-lg scale-110" />
                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-2 border-cyan-500/20 rounded-full animate-ping absolute inset-0" />
                        <div className="w-20 h-20 border-2 border-t-cyan-500 border-l-transparent border-r-transparent border-b-transparent rounded-full animate-spin" />
                    </div>
                    <p className="font-black tracking-[0.8em] uppercase text-[9px] text-cyan-400/60 mt-10 animate-pulse">Sincronizando Galaxia...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-[#01040a] relative flex flex-col overflow-hidden select-none font-sans">

            {/* Cinematic Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0 bg-[url('/assets/images/galactic_bg.png')] bg-cover bg-center opacity-30 scale-105"
                    style={{ filter: 'brightness(0.4) contrast(1.1)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#01040a]/40 to-[#01040a]" />
                <div className="absolute inset-0 bg-radial-at-t from-cyan-500/10 via-transparent to-transparent" />
            </div>

            {/* Header HUD overlay */}
            <div className="absolute top-0 left-0 w-full z-20 p-12 pointer-events-none flex justify-between items-start">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-3"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20 backdrop-blur-md">
                            <Rocket className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.5em] leading-none mb-1.5">Sector Actual</p>
                            <h2 className="text-xl font-black text-white tracking-widest leading-none">ALPHA-7_SYS</h2>
                        </div>
                    </div>
                </motion.div>

                <div className="absolute left-1/2 -translate-x-1/2 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/5 border border-white/10 px-6 py-2 rounded-full backdrop-blur-md mb-4 inline-flex items-center gap-2"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.4em]">Arg Learning Galaxy</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl md:text-7xl font-black text-white leading-none tracking-tighter uppercase italic"
                    >
                        MUNDOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">3D</span>
                    </motion.h1>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col items-end gap-3 pointer-events-auto"
                >
                    <div className="flex items-center gap-4 bg-slate-950/60 border border-white/10 px-8 py-4 rounded-2xl backdrop-blur-2xl shadow-2xl group hover:border-cyan-500/30 transition-all cursor-default">
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">XP Power</span>
                            <span className="text-2xl font-black text-white leading-none">1.240 <span className="text-cyan-500">XP</span></span>
                        </div>
                        <div className="p-2.5 bg-orange-500/10 rounded-xl">
                            <Zap className="w-6 h-6 text-orange-400 group-hover:animate-bounce" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* 3D Scene */}
            <div className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing">
                <Canvas shadows dpr={[1, 2]}>
                    <PerspectiveCamera makeDefault position={[0, 8, 18]} fov={45} />
                    <Suspense fallback={null}>
                        <Scene
                            modules={modules}
                            onSelect={(id: any) => setLocation(`/dashboard/module/${id}`)}
                        />
                    </Suspense>
                </Canvas>
            </div>

            {/* Controls Info HUD */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-8 items-center bg-slate-950/40 backdrop-blur-2xl border border-white/5 px-10 py-4 rounded-full">
                <div className="flex items-center gap-3 group">
                    <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                        <MousePointer2 className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Orbitar Cámara</span>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex items-center gap-3 group">
                    <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                        <Target className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Seleccionar Destino</span>
                </div>
            </div>

            {/* Bottom Info HUD */}
            <footer className="absolute bottom-0 left-0 w-full z-20 px-12 py-10 flex justify-between items-end pointer-events-none">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col gap-5"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                        <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em]">Transmisión Encriptada Activa</span>
                    </div>

                    <div className="flex gap-1.5">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="w-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ height: ["20%", "80%", "20%"] }}
                                    transition={{ duration: 0.5 + Math.random(), repeat: Infinity }}
                                    className="w-full bg-cyan-500/40"
                                />
                            </div>
                        ))}
                    </div>
                </motion.div>

                <div className="flex gap-6 pointer-events-auto">
                    <Button variant="outline" className="h-14 px-8 rounded-2xl font-black text-white/60 hover:text-cyan-400 uppercase text-[10px] tracking-[0.3em] bg-[#020617]/40 border-white/5 hover:border-cyan-500/30 backdrop-blur-xl transition-all">
                        <Compass className="w-5 h-5 mr-3" /> Base de Comando
                    </Button>
                </div>
            </footer>
        </div>
    );
}

interface WorldSelectorProps {
    user: {
        name: string;
        id: string;
        avatar?: string;
    };
}
