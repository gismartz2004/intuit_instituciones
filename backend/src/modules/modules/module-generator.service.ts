import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../shared/schema';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ModuleGenerationRequest {
  nombre: string;
  descripcion: string;
  profesorId: number;
  cursoId: number;
}

interface GeneratedModule {
  nombreModulo: string;
  duracionDias: number;
  niveles: Array<{
    titulo: string;
    descripcion: string;
    objetivos: string[];
    retos: Array<{
      titulo: string;
      descripcion: string;
      tipo: 'code' | 'design' | 'theory' | 'project';
      dificultad: 'fácil' | 'media' | 'difícil';
      archivosBase: Array<{
        nombre: string;
        contenido: string;
        lenguaje?: string;
      }>;
      criteria: {
        descripcion: string;
        puntos: number;
      }[];
    }>;
  }>;
}

@Injectable()
export class ModuleGeneratorService {
  private genAI: GoogleGenerativeAI;

  constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateModule(
    request: ModuleGenerationRequest,
  ): Promise<GeneratedModule> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `
    Genera un módulo educativo completo basado en esta solicitud:
    
    Nombre: ${request.nombre}
    Descripción: ${request.descripcion}
    
    Responde SOLO en formato JSON válido (sin markdown, sin explicaciones adicionales) con esta estructura exacta:
    {
      "nombreModulo": "Nombre del módulo",
      "duracionDias": número entre 7 y 60,
      "niveles": [
        {
          "titulo": "Título del nivel",
          "descripcion": "Descripción breve",
          "objetivos": ["objetivo1", "objetivo2", "objetivo3"],
          "retos": [
            {
              "titulo": "Título del reto",
              "descripcion": "Descripción detallada del reto",
              "tipo": "code" | "design" | "theory" | "project",
              "dificultad": "fácil" | "media" | "difícil",
              "archivosBase": [
                {
                  "nombre": "archivo.js",
                  "contenido": "código inicial o plantilla",
                  "lenguaje": "javascript"
                }
              ],
              "criteria": [
                {
                  "descripcion": "Criterio de evaluación",
                  "puntos": 10
                }
              ]
            }
          ]
        }
      ]
    }
    
    REGLAS:
    - Genera 3-5 niveles progresivos
    - Cada nivel debe tener 2-3 retos
    - Los archivos base deben ser código real y ejecutable
    - Los criterios sumados = 100 puntos por reto
    - Varía los tipos de retos para mantener el interés
    - Asegúrate de que sea educativo y práctico
    `;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Limpia markdown si viene envuelto
      const jsonText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const generatedStructure = JSON.parse(jsonText) as GeneratedModule;
      return generatedStructure;
    } catch (error) {
      console.error('Error generating module:', error);
      throw new Error('Failed to generate module structure with AI');
    }
  }

  async saveGeneratedModule(
    generatedModule: GeneratedModule,
    request: ModuleGenerationRequest,
  ) {
    try {
      // 1. Crear módulo
      const [newModule] = await this.db
        .insert(schema.modulos)
        .values({
          cursoId: request.cursoId,
          nombreModulo: generatedModule.nombreModulo,
          duracionDias: generatedModule.duracionDias,
          profesorId: request.profesorId,
          categoria: 'standard',
        })
        .returning();

      // 2. Crear niveles y retos
      for (let i = 0; i < generatedModule.niveles.length; i++) {
        const nivelData = generatedModule.niveles[i];
        const [newLevel] = await this.db
          .insert(schema.niveles)
          .values({
            moduloId: newModule.id,
            tituloNivel: nivelData.titulo,
            orden: i + 1,
          })
          .returning();

        // 3. Crear contenidos (retos)
        for (const reto of nivelData.retos) {
          await this.db.insert(schema.contenidos).values({
            nivelId: newLevel.id,
            tituloEjercicio: reto.titulo,
            descripcionEjercicio: reto.descripcion,
            tipo: reto.tipo,
            dificultad: reto.dificultad,
            archivosBase: reto.archivosBase,
            criterios: reto.criteria,
            lenguaje: reto.archivosBase?.[0]?.lenguaje || 'javascript',
          });
        }
      }

      return newModule;
    } catch (error) {
      console.error('Error saving generated module:', error);
      throw new Error('Failed to save generated module');
    }
  }

  async generateModuleFromPrompt(prompt: string, request: ModuleGenerationRequest) {
    // Versión más simple: solo un prompt de usuario
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const fullPrompt = `
    El usuario solicita crear un módulo educativo con este prompt:
    "${prompt}"
    
    Genera un módulo basado en la solicitud. Responde SOLO en formato JSON válido (sin markdown) con esta estructura:
    {
      "nombreModulo": "Nombre derivado del prompt",
      "duracionDias": número,
      "niveles": [
        {
          "titulo": "Nivel 1",
          "descripcion": "Descripción",
          "objetivos": ["objetivo1", "objetivo2"],
          "retos": [
            {
              "titulo": "Reto",
              "descripcion": "Descripción",
              "tipo": "code" | "design" | "theory" | "project",
              "dificultad": "fácil" | "media" | "difícil",
              "archivosBase": [{"nombre": "archivo.ext", "contenido": "código", "lenguaje": "language"}],
              "criteria": [{"descripcion": "criterio", "puntos": 25}]
            }
          ]
        }
      ]
    }
    `;

    const result = await model.generateContent(fullPrompt);
    const jsonText = result.response
      .text()
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return JSON.parse(jsonText) as GeneratedModule;
  }
}
