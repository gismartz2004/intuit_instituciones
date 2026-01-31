import { useState, useEffect, Suspense, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import Earth from "@/assets/models/Earth.glb";
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
    Trophy,
    Gamepad2,
    Music,
    MousePointer2,
    Target
} from "lucide-react";
import { studentApi } from "../services/student.api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Fallback component for when the GLB fails to load
function EarthFallback({ color, hovered }: { color: string; hovered: boolean }) {
    return (
        <mesh>
            <sphereGeometry args={[7.2, 32, 32]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={hovered ? 0.6 : 0.2}
                metalness={0.8}
                roughness={0.2}
            />
        </mesh>
    );
}

/**
 * COMPONENTE PLANETA (USANDO MODELO GLB EXTERNO)
 */
function EarthModel({ color, hovered }: { color: string; hovered: boolean }) {
    try {
        const { scene } = useGLTF("src/assets/models/Earth.glb");
        const clone = useMemo(() => scene.clone(), [scene]);

        useEffect(() => {
            clone.traverse((child: any) => {
                if (child.isMesh && child.material) {
                    child.material.emissive = new THREE.Color(color);
                    child.material.emissiveIntensity = hovered ? 0.4 : 0.05;
                }
            });
        }, [clone, color, hovered]);

        return <primitive object={clone} scale={7.2} />;
    } catch (error) {
        console.error("Failed to load Earth.glb, using fallback sphere:", error);
        return <EarthFallback color={color} hovered={hovered} />;
    }
}

/**
 * COMPONENTE EXPLORADOR (Avatar/Dron del Estudiante)
 * Sigue al módulo seleccionado o flota cerca del mouse
 */
function ExplorerDrone({ targetPosition, color }: { targetPosition: [number, number, number]; color: string }) {
    const droneRef = useRef<THREE.Group>(null!);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (droneRef.current) {
            // Suavizado de movimiento hacia el objetivo
            droneRef.current.position.lerp(new THREE.Vector3(
                targetPosition[0] + Math.sin(t * 2) * 0.5,
                targetPosition[1] + 2.5 + Math.cos(t * 1.5) * 0.3,
                targetPosition[2] + Math.cos(t * 2) * 0.5
            ), 0.05);

            // Rotación constante
            droneRef.current.rotation.y += 0.02;
            droneRef.current.rotation.z = Math.sin(t) * 0.1;
        }
    });

    return (
        <group ref={droneRef}>
            {/* Cuerpo del Dron */}
            <mesh castShadow>
                <octahedronGeometry args={[0.4, 0]} />
                <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.1} emissive="#ffffff" emissiveIntensity={0.2} />
            </mesh>
            {/* Ojo/Luz Central */}
            <mesh position={[0, 0, 0.3]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshBasicMaterial color={color} />
            </mesh>
            {/* Anillo de Energía */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.5, 0.02, 16, 100]} />
                <meshBasicMaterial color={color} transparent opacity={0.5} />
            </mesh>
            <pointLight distance={3} intensity={2} color={color} />
        </group>
    );
}

/**
 * MANEJADOR DE CÁMARA CINEMÁTICA
 * Realiza el efecto de "vuelo" hacia el planeta seleccionado
 */
function CameraHandler({ activePosition }: { activePosition: [number, number, number] | null }) {
    const { camera } = useThree();
    const targetCamPos = useRef(new THREE.Vector3());
    const lookAtPos = useRef(new THREE.Vector3());

    useFrame(() => {
        if (activePosition) {
            // Solo cuando hay un planeta seleccionado, la cámara lo sigue
            targetCamPos.current.set(
                activePosition[0] * 1.2,
                activePosition[1] + 15,
                activePosition[2] + 25
            );
            lookAtPos.current.lerp(new THREE.Vector3(...activePosition), 0.1);
            camera.position.lerp(targetCamPos.current, 0.05);
            camera.lookAt(lookAtPos.current);
        }
        // Si no hay posición activa, NO HACEMOS NADA. 
        // Esto permite que OrbitControls mantenga la cámara donde el usuario la dejó.
    });

    return null;
}

function Planet({ id, position, color, name, progress, onClick, index: idx, isActive }: any) {
    const groupRef = useRef<THREE.Group>(null!);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.005;
            if (!hovered && !isActive) {
                groupRef.current.position.y = position[1] + Math.sin(t + idx) * 0.2;
            }
        }
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Detector de interacción */}
            {/* Invisible catch area for easier interaction */}
            <mesh
                visible={false}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <sphereGeometry args={[9, 32, 32]} />
            </mesh>

            {/* Mesh base para hover (visual sutil) */}
            <mesh
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick(id);
                }}
            >
                <sphereGeometry args={[isActive ? 8 : 6.5, 32, 32]} />
                <meshStandardMaterial
                    transparent
                    opacity={0}
                />
            </mesh>

            {/* Modelo Earth GLB */}
            <group scale={isActive ? 1.4 : (hovered ? 1.15 : 1)} transition-all duration-500>
                <Suspense fallback={<mesh><sphereGeometry args={[3, 16, 16]} /><meshStandardMaterial color={color} /></mesh>}>
                    <EarthModel color={color} hovered={hovered || isActive} />
                </Suspense>

                {/* Aura de atmósfera sutil */}
                <mesh scale={8.4}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial
                        color={color}
                        transparent
                        opacity={isActive ? 0.25 : (hovered ? 0.15 : 0.05)}
                        side={THREE.BackSide}
                    />
                </mesh>

                {(hovered || isActive) && (
                    <Sparkles count={80} scale={10} size={idx === 0 ? 6 : 4} speed={0.5} color={color} />
                )}
            </group>

            {/* Anillo de Selección Base */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
                <ringGeometry args={[7.0, 7.2, 64]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={isActive ? 1 : (hovered ? 0.8 : 0.2)}
                />
            </mesh>

            {/* UI de Información (HTML) */}
            <Html
                position={[0, 10, 0]}
                center
                distanceFactor={isActive ? 25 : 35}
                className="pointer-events-none select-none"
            >
                <div className={cn(
                    "flex flex-col items-center gap-4 transition-all duration-700 transform w-[280px]",
                    (hovered || isActive) ? "scale-100 opacity-100" : "scale-80 opacity-50 blur-[0.5px]"
                )}>
                    <div className={cn(
                        "bg-slate-900/98 backdrop-blur-3xl border-2 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden transition-colors",
                        isActive ? "border-cyan-400/50 ring-4 ring-cyan-400/20" : "border-white/20"
                    )}>
                        {/* Status dot */}
                        <div className={cn(
                            "absolute top-5 right-6 w-3 h-3 rounded-full",
                            (hovered || isActive) ? "bg-green-400 animate-pulse" : "bg-white/10"
                        )} />

                        <div className="mb-2">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Sector {idx + 1}</span>
                        </div>

                        <h3 className="text-lg font-black text-white uppercase tracking-tight mb-4 leading-tight">
                            {name}
                        </h3>

                        <div className="w-full space-y-3">
                            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-[2px] border border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                                />
                            </div>
                            <div className="flex justify-between items-center text-[8px] font-black text-cyan-400 uppercase tracking-widest">
                                <span>Progreso</span>
                                <span>{progress}%</span>
                            </div>
                        </div>

                        {(hovered || isActive) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-8 flex flex-col gap-3"
                            >
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onClick();
                                    }}
                                    className={cn(
                                        "w-full py-4 rounded-3xl font-black text-[10px] tracking-[0.3em] uppercase transition-all duration-500 flex items-center justify-center gap-3 active:scale-95 group/btn pointer-events-auto",
                                        isActive
                                            ? "bg-blue-600 text-white shadow-[0_20px_40px_rgba(37,99,235,0.3)] border border-blue-400/50"
                                            : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                                    )}
                                >
                                    <span>{isActive ? "EXPLORANDO..." : "INGRESAR AL SECTOR"}</span>
                                    {!isActive && <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />}
                                </button>

                                <p className="text-[7px] font-bold text-white/20 text-center tracking-[0.2em] uppercase">
                                    {isActive ? "Ya estás aquí" : "Haz clic para viajar"}
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </Html>
        </group>
    );
}

function Scene({ modules, onSelect }: any) {
    const [activeId, setActiveId] = useState<string | null>(null);

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

    const activeModulePos = useMemo(() => {
        const idx = modules.findIndex((m: any) => m.id === activeId);
        return idx !== -1 ? planetPositions[idx] : null;
    }, [activeId, modules, planetPositions]);

    return (
        <>
            <OrbitControls
                enablePan={true}
                enableZoom={true}
                minDistance={10}
                maxDistance={200}
                enableDamping={true}
                dampingFactor={0.08}
                autoRotate={false}
                makeDefault
            />

            <CameraHandler activePosition={activeModulePos} />

            <ExplorerDrone
                targetPosition={activeModulePos || [0, 0, 0]}
                color={activeId ? colors[modules.findIndex((m: any) => m.id === activeId) % colors.length] : "#00f3ff"}
            />

            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 40, 10]} intensity={2.5} castShadow />
            <pointLight position={[-30, -20, -30]} intensity={1.5} color="#3b82f6" />

            <Stars radius={150} depth={60} count={5000} factor={6} fade speed={1.5} />

            <group>
                {modules.map((mod: any, i: number) => (
                    <Planet
                        key={mod.id}
                        id={mod.id}
                        index={i}
                        position={planetPositions[i]}
                        color={colors[i % colors.length]}
                        name={mod.nombreModulo}
                        progress={Math.floor(Math.random() * 60) + 20}
                        isActive={activeId === mod.id}
                        onClick={() => {
                            if (activeId === mod.id) onSelect(mod.id);
                            else setActiveId(mod.id);
                        }}
                    />
                ))}
            </group>

            <Environment preset="night" />
        </>
    );
}

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
