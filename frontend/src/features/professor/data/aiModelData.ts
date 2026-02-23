/**
 * Intuit Modeler - Local Pattern Engine
 * This simulates a neural model by mapping teacher intent to curriculum structures.
 */

export interface AIModelPattern {
    keywords: string[];
    grade: string;
    modules: {
        title: string;
        description: string;
        topics: string[];
        durationMonths: number;
        levels: {
            title: string;
            objective: string;
            type: "rag" | "ha" | "blockly";
            challengeData?: any;
        }[];
    }[];
}

export const ACADEMIC_MODEL_JSON: AIModelPattern[] = [
    {
        keywords: ["septimo", "7mo", "arduino", "electronics"],
        grade: "7mo EGB",
        modules: [
            {
                title: "Arduino: Primeros Circuitos",
                description: "Fundamentos de electrónica y programación de hardware.",
                durationMonths: 3,
                topics: ["LEDs", "Resistencias", "Sensores"],
                levels: [
                    {
                        title: "Encendido Maestro",
                        objective: "Logra encender un LED usando el bloque de 'Digital Write'.",
                        type: "blockly",
                        challengeData: {
                            targetBlocks: ["arduino_setup", "digital_write_high"],
                            toolbox: "arduino_basic"
                        }
                    }
                ]
            }
        ]
    },
    {
        keywords: ["minecraft", "building", "blocks", "agente"],
        grade: "7mo / 8vo EGB",
        modules: [
            {
                title: "Minecraft Modding: El Agente Constructor",
                description: "Automatización de construcción usando lógica de bloques.",
                durationMonths: 3,
                topics: ["Coordenadas", "Bucles de Construcción"],
                levels: [
                    {
                        title: "Muro Automático",
                        objective: "Programa al agente para que construya una pared de 3x3 bloques.",
                        type: "blockly",
                        challengeData: {
                            targetBlocks: ["agent_move", "agent_place", "repeat_loop"],
                            toolbox: "minecraft"
                        }
                    }
                ]
            }
        ]
    },
    {
        keywords: ["bachillerato", "1ro", "web", "html", "javascript"],
        grade: "1ro Bachillerato",
        modules: [
            {
                title: "Desarrollo Web: Mi Primer Sitio",
                description: "Creación de interfaces modernas con HTML/CSS y JS.",
                durationMonths: 4,
                topics: ["Layouts", "DOM", "Eventos"],
                levels: [
                    {
                        title: "Estructura Base",
                        objective: "Crea el esqueleto de una página con un Navbar y un Hero Section.",
                        type: "blockly",
                        challengeData: {
                            targetBlocks: ["html_tag", "body_tag", "div_container"],
                            toolbox: "web_dev"
                        }
                    }
                ]
            }
        ]
    },
    {
        keywords: ["python", "algoritmos", "datos"],
        grade: "Bachillerato",
        modules: [
            {
                title: "Python 101: Lógica Pura",
                description: "Introducción al lenguaje más popular del mundo.",
                durationMonths: 3,
                topics: ["Variables", "Funciones", "Estructuras de Datos"],
                levels: [
                    {
                        title: "Calculadora de Notas",
                        objective: "Crea una función que reciba 3 notas y devuelva el promedio.",
                        type: "blockly",
                        challengeData: {
                            targetBlocks: ["python_def", "math_average", "print_output"],
                            toolbox: "python_lab"
                        }
                    }
                ]
            }
        ]
    }
];
