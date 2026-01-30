import { useState, useEffect, Suspense, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import { Canvas, useFrame } from "@react-three/fiber";
import {
    Float,
    OrbitControls,
    Html,
    Stars,
    PerspectiveCamera,
    Environment,
    useGLTF,
    ContactShadows,
    Sparkles
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
    MousePointer2,
    ChevronLeft
} from "lucide-react";
import { studentApi } from "../services/student.api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// --- Sub-components 3D ---

/**
 * COMPONENTE PLANETA (USANDO MODELO GLB EXTERNO)
 */
function EarthModel({ color, hovered }: { color: string; hovered: boolean }) {
    // Cargamos el modelo GLB
    const { scene } = useGLTF("/assets/models/Earth.glb");

    // Clonamos la escena para tener instancias independientes y poder rotarlas/escalarlas individualmente
    const clone = useMemo(() => scene.clone(), [scene]);

    // Aplicamos color/emisión para diferenciar los módulos
    useEffect(() => {
        clone.traverse((child: any) => {
            if (child.isMesh) {
                // Si el modelo tiene materiales, podemos aplicarles un color sutil
                // o usar el color original y solo añadir un tinte/emisión
                if (child.material) {
                    child.material.emissive = new THREE.Color(color);
                    child.material.emissiveIntensity = hovered ? 0.4 : 0.05;
                }
            }
        });
    }, [clone, color, hovered]);

    return <primitive object={clone} scale={7.2} />;
}

function Planet({ position, color, name, progress, onClick, index: idx }: any) {
    const groupRef = useRef<THREE.Group>(null!);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.005;
            if (!hovered) {
                groupRef.current.position.y = position[1] + Math.sin(t + idx) * 0.2;
            }
        }
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Detector de interacción */}
            <mesh
                onClick={onClick}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                visible={false}
            >
                <sphereGeometry args={[6.5, 16, 16]} />
            </mesh>

            {/* Modelo Earth GLB */}
            <group scale={hovered ? 1.15 : 1} transition-all duration-500>
                <Suspense fallback={<mesh><sphereGeometry args={[3, 16, 16]} /><meshStandardMaterial color={color} /></mesh>}>
                    <EarthModel color={color} hovered={hovered} />
                </Suspense>

                {/* Aura de atmósfera sutil */}
                <mesh scale={8.4}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial
                        color={color}
                        transparent
                        opacity={hovered ? 0.15 : 0.05}
                        side={THREE.BackSide}
                    />
                </mesh>

                {hovered && (
                    <Sparkles count={50} scale={9} size={5} speed={0.5} color={color} />
                )}
            </group>

            {/* Anillo de Selección Base */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
                <ringGeometry args={[7.0, 7.2, 64]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={hovered ? 1 : 0.2}
                />
            </mesh>

            {/* UI de Información (HTML) - Mejorada para mayor claridad antes de hover */}
            <Html
                position={[0, 9.5, 0]}
                center
                distanceFactor={30}
                className="pointer-events-none select-none"
            >
                <div className={cn(
                    "flex flex-col items-center gap-2 transition-all duration-500 transform w-[220px]",
                    hovered ? "scale-100 opacity-100" : "scale-85 opacity-70 blur-[0.2px]"
                )}>
                    <div className="bg-slate-900/98 backdrop-blur-3xl border-2 border-white/20 p-5 rounded-[2rem] shadow-2xl relative overflow-hidden">
                        <div className={cn(
                            "absolute top-4 right-5 w-2 h-2 rounded-full",
                            hovered ? "bg-green-400 animate-pulse" : "bg-white/10"
                        )} />

                        <div className="mb-1">
                            <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">Módulo {idx + 1}</span>
                        </div>

                        <h3 className="text-sm font-black text-white uppercase tracking-tight mb-3 leading-tight">
                            {name}
                        </h3>

                        <div className="w-full space-y-2">
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-[2px] border border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full"
                                />
                            </div>
                            <div className="flex justify-between items-center text-[7px] font-black text-cyan-400/60 uppercase">
                                <span>Progreso</span>
                                <span>{progress}%</span>
                            </div>
                        </div>

                        {hovered && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-4 flex items-center justify-center gap-2 text-[10px] font-extrabold text-white bg-blue-600 py-2.5 rounded-xl uppercase tracking-widest"
                            >
                                <Rocket className="w-3.5 h-3.5" /> JUGAR
                            </motion.div>
                        )}
                    </div>
                </div>
            </Html>
        </group>
    );
}

function Scene({ modules, onSelect }: any) {
    const planetPositions = useMemo(() => {
        const radius = 28;
        return modules.map((_: any, i: number) => {
            const angle = (i / modules.length) * Math.PI * 2;
            return [
                Math.sin(angle) * radius,
                Math.cos(angle * 2) * 5.0,
                Math.cos(angle) * radius
            ];
        });
    }, [modules.length]);

    const colors = ["#ff3e3e", "#0ea5e9", "#10b981", "#f59e0b", "#a855f7", "#ec4899"];

    return (
        <>
            <OrbitControls
                enablePan={false}
                enableZoom={true}
                minDistance={30}
                maxDistance={80}
                enableDamping={true}
                dampingFactor={0.05}
                autoRotate
                autoRotateSpeed={0.3}
            />

            <ambientLight intensity={1} />
            <directionalLight position={[10, 20, 10]} intensity={2} castShadow />
            <pointLight position={[-15, -10, -15]} intensity={1.5} color="#3b82f6" />

            <Stars
                radius={100}
                depth={50}
                count={3000}
                factor={4}
                saturation={0}
                fade
                speed={1}
            />

            <group>
                {modules.map((mod: any, i: number) => (
                    <Planet
                        key={mod.id}
                        index={i}
                        position={planetPositions[i]}
                        color={colors[i % colors.length]}
                        name={mod.nombreModulo}
                        progress={Math.floor(Math.random() * 60) + 20}
                        onClick={() => onSelect(mod.id)}
                    />
                ))}
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
                console.error("Error loading modules:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchModules();
    }, [user.id]);

    if (loading) {
        return (
            <div className="h-screen w-full bg-[#030712] flex flex-col items-center justify-center text-white">
                <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
                <p className="font-black tracking-[0.5em] uppercase text-[9px] text-cyan-400">CARGANDO...</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-[#01040a] relative flex flex-col overflow-hidden select-none font-sans">

            <div className="absolute inset-0 z-0 bg-[#020617]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#020617] to-[#020617]" />
                <div className="absolute inset-0 bg-radial-at-t from-blue-600/10 via-transparent to-transparent opacity-40" />
            </div>

            {/* HUD Central ESCALADO (Diseño Gaming Elegante) */}
            <div className="absolute inset-0 pointer-events-none z-20 flex flex-col items-center justify-start pt-16">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 px-6 py-2 rounded-full backdrop-blur-3xl mb-4 inline-flex items-center gap-3"
                >
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,1)]" />
                    <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.4em]">ACADEMIA ARG • MÓDULOS DE APRENDIZAJE</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="text-6xl md:text-8xl font-black text-white leading-none tracking-tighter uppercase italic drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                >
                    ELIGE TU CURSO
                </motion.h1>
            </div>

            {/* HUD XP LATERAL */}
            <div className="absolute bottom-10 right-10 z-20 pointer-events-auto">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 bg-slate-900/90 border border-white/10 p-4 px-6 rounded-[2rem] backdrop-blur-3xl shadow-xl group"
                >
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mb-0.5">Energía</span>
                        <span className="text-xl font-black text-white leading-none">1.240 <span className="text-blue-500 text-xs">XP</span></span>
                    </div>
                    <div className="p-2.5 bg-orange-500/20 rounded-xl">
                        <Zap className="w-5 h-5 text-orange-400" />
                    </div>
                </motion.div>
            </div>

            {/* Escena 3D */}
            <div className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing">
                <Canvas shadows dpr={[1, 2]}>
                    <PerspectiveCamera makeDefault position={[0, 25, 65]} fov={45} />
                    <Suspense fallback={null}>
                        <Scene
                            modules={modules}
                            onSelect={(id: any) => setLocation(`/dashboard/module/${id}`)}
                        />
                    </Suspense>
                </Canvas>
            </div>

            {/* Guía Controles */}
            <div className="absolute bottom-10 left-10 z-20 flex gap-4">
                <div className="flex items-center gap-3 bg-slate-900/40 backdrop-blur-2xl border border-white/5 px-5 py-2.5 rounded-full">
                    <MousePointer2 className="w-4 h-4 text-cyan-400" />
                    <span className="text-[8px] font-black text-white/40 tracking-[0.2em] uppercase">Orbitar Cámara</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/40 backdrop-blur-2xl border border-white/5 px-5 py-2.5 rounded-full">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="text-[8px] font-black text-white/40 tracking-[0.2em] uppercase">Seleccionar</span>
                </div>
            </div>
        </div>
    );
}

// Pre-loading the model for optimization
useGLTF.preload("/assets/models/Earth.glb");

interface WorldSelectorProps {
    user: {
        name: string;
        id: string;
        avatar?: string;
    };
}
