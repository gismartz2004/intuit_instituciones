export type AvatarEmotion = 'neutral' | 'happy' | 'thinking' | 'celebrating' | 'waiting' | 'sad' | 'alert';

export interface ResponseOption {
    label: string;
    variant?: 'default' | 'secondary' | 'success' | 'danger';
    onSelect: () => void;
}

export interface AvatarState {
    isVisible: boolean;
    emotion: AvatarEmotion;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    responseOptions?: ResponseOption[];
}

export interface GamificationState {
    points: number;
    level: number;
    streak: number;
    xp: number;
    xpToNextLevel: number;
    lastAward?: {
        amount: number;
        reason: string;
    };
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: Date;
    progress?: number;
    maxProgress?: number;
}

export interface StudentLevel {
    level: number;
    title: string;
    minXP: number;
    color: string;
}

export const STUDENT_LEVELS: StudentLevel[] = [
    { level: 1, title: "Inicial", minXP: 0, color: "sky" },
    { level: 2, title: "Aprendiz", minXP: 500, color: "indigo" },
    { level: 3, title: "Estudiante", minXP: 1500, color: "emerald" },
    { level: 4, title: "Avanzado", minXP: 3000, color: "violet" },
    { level: 5, title: "Experto", minXP: 5000, color: "orange" },
    { level: 6, title: "Maestro", minXP: 8000, color: "rose" },
    { level: 7, title: "Leyenda", minXP: 12000, color: "amber" },
];

export function calculateLevel(xp: number): StudentLevel {
    for (let i = STUDENT_LEVELS.length - 1; i >= 0; i--) {
        if (xp >= STUDENT_LEVELS[i].minXP) {
            return STUDENT_LEVELS[i];
        }
    }
    return STUDENT_LEVELS[0];
}

export function getXPToNextLevel(currentXP: number): number {
    const currentLevel = calculateLevel(currentXP);
    const nextLevelIndex = STUDENT_LEVELS.findIndex(l => l.level === currentLevel.level) + 1;

    if (nextLevelIndex >= STUDENT_LEVELS.length) {
        return 0; // Max level reached
    }

    return STUDENT_LEVELS[nextLevelIndex].minXP - currentXP;
}

export function pointsToXP(points: number): number {
    // 1 point = 1 XP (can be adjusted)
    return points;
}
