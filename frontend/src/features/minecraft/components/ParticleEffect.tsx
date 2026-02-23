import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Particle {
  id: string;
  x: number;
  y: number;
  emoji: string;
  duration: number;
}

interface ParticleEffectProps {
  trigger?: boolean;
  x: number;
  y: number;
  emoji?: string;
  count?: number;
}

export function useParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  const addParticles = (x: number, y: number, emoji = "✨", count = 8) => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      x,
      y,
      emoji,
      duration: 0.8,
    }));
    setParticles(prev => [...prev, ...newParticles]);
  };

  const removeParticle = (id: string) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  };

  return { particles, addParticles, removeParticle };
}

export function ParticleEffectRenderer({ particles, removeParticle }: { 
  particles: Particle[]; 
  removeParticle: (id: string) => void;
}) {
  return (
    <>
      {particles.map(particle => {
        const angle = (Math.random() * Math.PI * 2);
        const distance = 60 + Math.random() * 40;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        return (
          <motion.div
            key={particle.id}
            initial={{ x: particle.x, y: particle.y, opacity: 1, scale: 1 }}
            animate={{ x: particle.x + tx, y: particle.y + ty, opacity: 0, scale: 0 }}
            transition={{ duration: particle.duration, ease: "easeOut" }}
            onAnimationComplete={() => removeParticle(particle.id)}
            className="fixed pointer-events-none text-2xl font-bold"
            style={{ left: 0, top: 0 }}
          >
            {particle.emoji}
          </motion.div>
        );
      })}
    </>
  );
}
