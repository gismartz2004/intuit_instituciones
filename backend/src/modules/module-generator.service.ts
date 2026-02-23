import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_DB } from '../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ModuleGenerationRequest {
  prompt: string;
  profesorId: number;
  cursoId: number;
}

export interface GeneratedModule {
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
      console.warn('⚠️ GOOGLE_GENERATIVE_AI_API_KEY not configured');
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateModuleFromPrompt(request: ModuleGenerationRequest): Promise<GeneratedModule> {
    if (!this.genAI) {
      throw new Error('AI not configured. Set GOOGLE_GENERATIVE_AI_API_KEY');
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const userPrompt = `Crea un módulo educativo completo para: "${request.prompt}"

Responde EXACTAMENTE en JSON válido (sin markdown, sin explicaciones):
{
  "nombreModulo": "string",
  "duracionDias": number (7-60),
  "niveles": [
    {
      "titulo": "string",
      "descripcion": "string",
      "objetivos": ["objetivo 1", "objetivo 2"],
      "retos": [
        {
          "titulo": "string",
          "descripcion": "string",
          "tipo": "code|design|theory|project",
          "dificultad": "fácil|media|difícil",
          "archivosBase": [
            {"nombre": "archivo.js", "contenido": "código", "lenguaje": "javascript"}
          ],
          "criteria": [
            {"descripcion": "criterio", "puntos": 25}
          ]
        }
      ]
    }
  ]
}

Requisitos:
- 3-4 niveles progresivos
- 2-3 retos por nivel
- Código real y ejecutable
- Suma de puntos = 100 por reto
- Mezcla tipos de retos`;

    try {
      const result = await model.generateContent(userPrompt);
      const responseText = result.response.text();
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

      for (let nivelIdx = 0; nivelIdx < generatedModule.niveles.length; nivelIdx++) {
        const nivelData = generatedModule.niveles[nivelIdx];

        const [newLevel] = await this.db
          .insert(schema.niveles)
          .values({
            moduloId: newModule.id,
            tituloNivel: nivelData.titulo,
            orden: nivelIdx + 1,
          })
          .returning();

        for (const reto of nivelData.retos) {
          await this.db.insert(schema.contenidos).values({
            nivelId: newLevel.id,
            tituloEjercicio: reto.titulo,
            descripcionEjercicio: reto.descripcion,
            tipo: reto.tipo,
            dificultad: reto.dificultad,
            archivosBase: reto.archivosBase as any,
            criterios: reto.criteria as any,
            lenguaje: reto.archivosBase?.[0]?.lenguaje || 'javascript',
          });
        }
      }

      return newModule;
    } catch (error) {
      console.error('Error saving generated module:', error);
      throw error;
    }
  }
}
