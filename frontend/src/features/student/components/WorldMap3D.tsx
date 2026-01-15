
import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float, Stars, Sparkles, Environment, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

// --- Types ---
interface LevelNodeProps {
    position: [number, number, number];
    isLocked: boolean;
    isCompleted: boolean;
    label: string;
    onClick: () => void;
    delay?: number;
}

// --- Components ---

function LevelNode({ position, isLocked, isCompleted, label, onClick, delay = 0 }: LevelNodeProps) {
    const meshRef = useRef<THREE.Group>(null);
    const [hovered, setHover] = useState(false);

    // Animation: Gentle floating
    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.elapsedTime;
        // Float Float
        meshRef.current.position.y = position[1] + Math.sin(t * 1.5 + delay) * 0.15;
        // Slow rotation
        if (!isLocked) {
            meshRef.current.rotation.y = Math.sin(t * 0.5) * 0.2;
        }
    });

    // Premium Colors
    const activeColor = "#8b5cf6"; // Violet Neon
    const completedColor = "#10b981"; // Emerald Neon
    const lockedColor = "#1e293b"; // Slate Dark
    const hoverColor = "#d8b4fe"; // Violet Light

    const mainColor = isLocked ? lockedColor : (isCompleted ? completedColor : activeColor);
    const emissiveColor = isLocked ? "#000000" : (isCompleted ? completedColor : activeColor);

    return (
        <group ref={meshRef} position={position}>
            {/* Label (HTML Overlay) */}
            <Html position={[0, 1.4, 0]} center distanceFactor={12} style={{ pointerEvents: 'none' }}>
                <div className={`
          flex flex-col items-center gap-1 transition-all duration-500
          ${hovered && !isLocked ? 'scale-110 -translate-y-2' : ''}
          ${isLocked ? 'opacity-40 grayscale' : 'opacity-100'}
        `}>
                    <div className={`
             px-4 py-1.5 rounded-xl font-bold text-xs tracking-wider uppercase backdrop-blur-md border shadow-[0_0_15px_rgba(0,0,0,0.5)]
             ${isCompleted
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100 shadow-emerald-500/20'
                            : isLocked
                                ? 'bg-slate-900/80 border-slate-700 text-slate-500'
                                : 'bg-violet-600/20 border-violet-500/50 text-violet-100 shadow-violet-500/30'
                        }
           `}>
                        {label}
                    </div>
                    {!isLocked && (
                        <div className="w-1 h-8 bg-gradient-to-b from-white/50 to-transparent" />
                    )}
                </div>
            </Html>

            {/* Interactive Hit Box (Invisible but grabs events) */}
            <mesh
                position={[0, 0, 0]}
                onClick={(e) => { e.stopPropagation(); if (!isLocked) onClick(); }}
                onPointerOver={(e) => { e.stopPropagation(); if (!isLocked) setHover(true); }}
                onPointerOut={(e) => { e.stopPropagation(); if (!isLocked) setHover(false); }}
                visible={false}
            >
                <cylinderGeometry args={[0.8, 0.8, 1, 6]} />
            </mesh>

            {/* 3D Visuals */}
            <group scale={hovered && !isLocked ? 1.1 : 1} transition-all>

                {/* Main Crystal Platform */}
                <mesh castShadow receiveShadow>
                    <cylinderGeometry args={[0.7, 0.6, 0.3, 6]} />
                    <meshPhysicalMaterial
                        color={mainColor}
                        emissive={emissiveColor}
                        emissiveIntensity={isLocked ? 0 : 0.5}
                        metalness={0.9}
                        roughness={0.1}
                        clearcoat={1}
                        clearcoatRoughness={0.1}
                    />
                </mesh>

                {/* Glass Top Layer */}
                {!isLocked && (
                    <mesh position={[0, 0.16, 0]}>
                        <cylinderGeometry args={[0.65, 0.65, 0.05, 6]} />
                        <meshPhysicalMaterial
                            color="white"
                            transmission={0.95}
                            opacity={1}
                            metalness={0}
                            roughness={0}
                            ior={1.5}
                            thickness={0.5}
                        />
                    </mesh>
                )}

                {/* Bottom Glow Ring */}
                {!isLocked && (
                    <mesh position={[0, -0.2, 0]}>
                        <torusGeometry args={[0.6, 0.02, 16, 32]} />
                        <meshBasicMaterial color="white" />
                    </mesh>
                )}

                {/* Energy Rings (Active only) */}
                {!isLocked && !isCompleted && (
                    <mesh position={[0, 0, 0]}>
                        <ringGeometry args={[0.8, 0.85, 32]} />
                        <meshBasicMaterial color={activeColor} side={THREE.DoubleSide} transparent opacity={0.5} />
                    </mesh>
                )}
            </group>
        </group>
    );
}

function PathLine({ start, end, active }: { start: [number, number, number], end: [number, number, number], active: boolean }) {
    const points = useMemo(() => {
        const p1 = new THREE.Vector3(...start);
        const p2 = new THREE.Vector3(...end);
        const curve = new THREE.CatmullRomCurve3([
            p1,
            new THREE.Vector3().lerpVectors(p1, p2, 0.5).add(new THREE.Vector3(0, 1.5, 0)), // Higher Arch
            p2
        ]);
        return curve.getPoints(25);
    }, [start, end]);

    return (
        <group>
            {/* Core Line */}
            <line>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={points.length}
                        array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial color={active ? "#a78bfa" : "#334155"} linewidth={2} transparent opacity={active ? 0.8 : 0.2} />
            </line>

            {/* Moving Particles on Path */}
            {active && (
                <Sparkles
                    count={15}
                    scale={1}
                    size={2}
                    speed={2}
                    opacity={0.8}
                    color="#a78bfa"
                    position={[
                        (start[0] + end[0]) / 2,
                        (start[1] + end[1]) / 2 + 0.5,
                        (start[2] + end[2]) / 2
                    ]}
                />
            )}
        </group>
    );
}

export default function WorldMap3D() {
    const levels = [
        { id: 1, pos: [-2.5, -0.5, 0] as [number, number, number], label: "Nivel 1: El Comienzo", locked: false, completed: true },
        { id: 2, pos: [-0.8, 0.2, -1.2] as [number, number, number], label: "Nivel 2: Fundamentos", locked: false, completed: false },
        { id: 3, pos: [1.2, 0.8, -0.5] as [number, number, number], label: "Nivel 3: Algoritmos", locked: true, completed: false },
        { id: 4, pos: [2.8, 1.5, 0.8] as [number, number, number], label: "Nivel 4: Maestría", locked: true, completed: false },
    ];

    return (
        <div className="w-full h-full min-h-[400px] bg-[#020617] relative overflow-hidden">

            {/* Cinematic Title Overlay */}
            <div className="absolute top-8 left-8 z-10 pointer-events-none">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500 drop-shadow-sm font-display tracking-tighter">
                    MUNDO GENIOS
                </h1>
                <p className="text-blue-200/50 text-sm font-medium tracking-widest uppercase mt-1">Exploración Interactiva v1.0</p>
            </div>

            <Canvas shadows camera={{ position: [-2, 4, 9], fov: 40 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}>
                {/* Cinematic Environment */}
                <color attach="background" args={['#020617']} />
                <fog attach="fog" args={['#020617', 5, 25]} />

                {/* Lighting */}
                <ambientLight intensity={0.4} />
                <pointLight position={[-10, 10, 10]} intensity={1} color="#4f46e5" />
                <pointLight position={[10, 5, -10]} intensity={1} color="#c026d3" />
                <Environment preset="city" />

                {/* Background Effects */}
                <Stars radius={80} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
                <Sparkles size={3} scale={[12, 10, 12]} position-y={1} speed={0.2} count={80} color="#60a5fa" opacity={0.4} />

                {/* Reflective Floor */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
                    <planeGeometry args={[50, 50]} />
                    <MeshReflectorMaterial
                        blur={[300, 100]}
                        resolution={1024}
                        mixBlur={1}
                        mixStrength={40}
                        roughness={1}
                        depthScale={1.2}
                        minDepthThreshold={0.4}
                        maxDepthThreshold={1.4}
                        color="#050505"
                        metalness={0.5}
                        mirror={0} // Fixed mirror property
                    />
                </mesh>

                {/* World Content */}
                <group position={[0, -0.5, 0]}>
                    {levels.map((level, i) => (
                        <React.Fragment key={level.id}>
                            <LevelNode
                                position={level.pos}
                                isLocked={level.locked}
                                isCompleted={level.completed}
                                label={level.label}
                                onClick={() => console.log(`Clicked Level ${level.id}`)}
                                delay={i * 0.8}
                            />
                            {i < levels.length - 1 && (
                                <PathLine
                                    start={level.pos}
                                    end={levels[i + 1].pos}
                                    active={!level.locked && (level.completed || !levels[i + 1].locked)}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </group>

                {/* Controls */}
                <OrbitControls
                    enableZoom={true}
                    maxDistance={15}
                    minDistance={5}
                    enablePan={false}
                    maxPolarAngle={Math.PI / 2.1}
                    autoRotate
                    autoRotateSpeed={0.3}
                    dampingFactor={0.05}
                />
            </Canvas>
        </div>
    );
}
