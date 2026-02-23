// ─── Minecraft World Types ────────────────────────────────────────────────────

export type BlockType =
    | "air"
    | "grass"
    | "dirt"
    | "stone"
    | "wood"
    | "leaves"
    | "sand"
    | "water"
    | "lava"
    | "brick"
    | "gold"
    | "diamond"
    | "tnt"
    | "glass"
    | "snow"
    | "path";

export type BiomeType = "forest" | "desert" | "snow" | "ocean";

export interface Parcel {
    id: string;
    row: number;
    col: number;
    studentId?: string;
    studentName?: string;
    biome: BiomeType;
    isLocked: boolean;
    grid: BlockType[][];  // PARCEL_SIZE x PARCEL_SIZE
    program: BlockInstruction[];
    month?: number; // 1-12, which month this parcel is assigned
    projectId?: string;
    agentPos?: { x: number; y: number };
    targetPos?: { x: number; y: number };
}

export interface World {
    id: string;
    name: string;
    description: string;
    rows: number;    // Number of parcel rows
    cols: number;    // Number of parcel columns
    parcels: Parcel[];
    createdBy: string; // professor id
    assignedTo?: string[]; // student ids
    month?: number;
    projectDescription?: string;
}

// ─── Block Programmer Types ──────────────────────────────────────────────────

export type BlockCategory = "event" | "movement" | "blocks" | "variables" | "control" | "functions";

export interface BlockInstruction {
    id: string;
    type: string;
    category: BlockCategory;
    label: string;
    params: Record<string, string | number | boolean>;
    children?: BlockInstruction[];  // for loops/if blocks
}

export const PARCEL_SIZE = 12; // 12x12 grid per parcel

export const BLOCK_COLORS: Record<BlockType, string> = {
    air: "transparent",
    grass: "#4CAF50",
    dirt: "#8B5E3C",
    stone: "#8E8E8E",
    wood: "#A0522D",
    leaves: "#2D8B4E",
    sand: "#F4D03F",
    water: "#3498DB",
    lava: "#E74C3C",
    brick: "#CB4335",
    gold: "#F39C12",
    diamond: "#1ABC9C",
    tnt: "#C0392B",
    glass: "#AED6F1",
    snow: "#EBF5FB",
    path: "#BDC3C7",
};

export const BLOCK_LABELS: Record<BlockType, string> = {
    air: "Aire",
    grass: "Hierba",
    dirt: "Tierra",
    stone: "Piedra",
    wood: "Madera",
    leaves: "Hojas",
    sand: "Arena",
    water: "Agua",
    lava: "Lava",
    brick: "Ladrillo",
    gold: "Oro",
    diamond: "Diamante",
    tnt: "TNT",
    glass: "Cristal",
    snow: "Nieve",
    path: "Camino",
};

export const BLOCK_EMOJIS: Record<BlockType, string> = {
    air: "🌫",
    grass: "🟩",
    dirt: "🟫",
    stone: "⬜",
    wood: "🪵",
    leaves: "🍃",
    sand: "🟨",
    water: "🔵",
    lava: "🔴",
    brick: "🧱",
    gold: "🟡",
    diamond: "💎",
    tnt: "💣",
    glass: "🪟",
    snow: "❄️",
    path: "🩶",
};
