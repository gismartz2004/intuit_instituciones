import { motion, AnimatePresence } from "framer-motion";
import { Star, Trophy, Zap, Target, Palette, Code2 } from "lucide-react";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  icon?: React.ReactNode;
  points: number;
  unlockedAt?: number;
  category: "speed" | "creativity" | "logic" | "exploration" | "mastery";
}

interface AchievementNotificationProps {
  achievement: Achievement;
  onDismiss: () => void;
}

const ACHIEVEMENT_COLORS: Record<Achievement["category"], string> = {
  speed: "from-blue-600 to-cyan-600",
  creativity: "from-pink-600 to-purple-600",
  logic: "from-yellow-600 to-orange-600",
  exploration: "from-green-600 to-emerald-600",
  mastery: "from-red-600 to-rose-600",
};

const ACHIEVEMENT_ICONS: Record<Achievement["category"], React.ReactNode> = {
  speed: <Zap className="w-5 h-5" />,
  creativity: <Palette className="w-5 h-5" />,
  logic: <Code2 className="w-5 h-5" />,
  exploration: <Target className="w-5 h-5" />,
  mastery: <Trophy className="w-5 h-5" />,
};

export function AchievementNotification({ achievement, onDismiss }: AchievementNotificationProps) {
  return (
    <motion.div
      initial={{ x: 400, opacity: 0, rotate: -10 }}
      animate={{ x: 0, opacity: 1, rotate: 0 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed bottom-6 right-6 rounded-2xl overflow-hidden shadow-2xl border border-white/20 backdrop-blur-md bg-gradient-to-r ${ACHIEVEMENT_COLORS[achievement.category]} p-0.5 z-50`}
    >
      <div className="bg-[#0f1117] rounded-xl p-4 w-80">
        <div className="flex items-start gap-4">
          <div className="text-4xl">{achievement.emoji}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-black text-lg text-white">{achievement.title}</h3>
              <span className="text-yellow-400 font-bold">+{achievement.points}XP</span>
            </div>
            <p className="text-sm text-slate-300 mb-3">{achievement.description}</p>
            <motion.button
              onClick={onDismiss}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
            >
              ¡Increíble! 🎉
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Achievements predefinidos
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_block",
    title: "Primeros Pasos",
    description: "Coloca tu primer bloque",
    emoji: "🧱",
    points: 10,
    category: "exploration",
  },
  {
    id: "speed_builder",
    title: "Constructor Rápido",
    description: "Completa una misión en menos de 30 segundos",
    emoji: "⚡",
    points: 25,
    category: "speed",
  },
  {
    id: "artist",
    title: "Artista Creativo",
    description: "Usa al menos 5 tipos de bloques diferentes",
    emoji: "🎨",
    points: 30,
    category: "creativity",
  },
  {
    id: "logic_master",
    title: "Maestro de la Lógica",
    description: "Crea un programa con bucles y condiciones",
    emoji: "🧠",
    points: 50,
    category: "logic",
  },
  {
    id: "perfect_score",
    title: "Perfección",
    description: "Completa una misión a la primera sin errores",
    emoji: "⭐",
    points: 40,
    category: "mastery",
  },
  {
    id: "ten_missions",
    title: "Experto en Construcción",
    description: "Completa 10 misiones",
    emoji: "🏆",
    points: 100,
    category: "mastery",
  },
  {
    id: "creative_soul",
    title: "Alma Creativa",
    description: "Construye usando gradientes de colores",
    emoji: "🌈",
    points: 35,
    category: "creativity",
  },
  {
    id: "tree_farmer",
    title: "Cultivador de Árboles",
    description: "Planta 5 árboles usando funciones",
    emoji: "🌲",
    points: 20,
    category: "logic",
  },
];
