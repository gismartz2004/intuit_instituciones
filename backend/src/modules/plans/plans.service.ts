import { Injectable } from '@nestjs/common';

// Plan feature definitions
const PLAN_FEATURES = {
    1: { // Genio Digital (Basic)
        name: 'Genio Digital',
        features: ['dashboard', 'profile'],
        sidebar: [
            { id: 'dashboard', label: 'Aprende', icon: 'BookOpen', path: '/dashboard' },
            { id: 'profile', label: 'Perfil', icon: 'User', path: '/profile' }
        ]
    },
    2: { // Genio Plata (Silver) - All current features
        name: 'Genio Plata',
        features: ['dashboard', 'profile', 'leaderboard', 'quests'],
        sidebar: [
            { id: 'dashboard', label: 'Aprender', icon: 'BookOpen', path: '/dashboard' },
            { id: 'leaderboard', label: 'Clasificación', icon: 'Trophy', path: '/leaderboard' },
            { id: 'quests', label: 'Misiones', icon: 'Target', path: '/quests' },
            { id: 'profile', label: 'Perfil', icon: 'User', path: '/profile' }
        ]
    },
    3: { // Genio Pro (Premium) - All current features + exclusives
        name: 'Genio Pro',
        features: ['dashboard', 'profile', 'leaderboard', 'quests', 'ai-tutor', 'courses', 'raffle'],
        sidebar: [
            { id: 'dashboard', label: 'Aprender', icon: 'BookOpen', path: '/dashboard' },
            { id: 'leaderboard', label: 'Clasificación', icon: 'Trophy', path: '/leaderboard' },
            { id: 'quests', label: 'Misiones', icon: 'Target', path: '/quests' },
            { id: 'ai-tutor', label: 'Tutor IA', icon: 'Bot', path: '/ai-tutor' },
            { id: 'courses', label: 'Cursos Pro', icon: 'GraduationCap', path: '/pro-courses' },
            { id: 'raffle', label: 'Sorteo Gamer', icon: 'Gift', path: '/gamer-raffle' },
            { id: 'profile', label: 'Perfil', icon: 'User', path: '/profile' }
        ]
    }
};

@Injectable()
export class PlansService {
    getPlanFeatures(planId: number) {
        return PLAN_FEATURES[planId as keyof typeof PLAN_FEATURES] || PLAN_FEATURES[1];
    }

    getAllPlans() {
        return Object.entries(PLAN_FEATURES).map(([id, data]) => ({
            id: parseInt(id),
            ...data
        }));
    }
}
