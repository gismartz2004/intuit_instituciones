import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
    private readonly genAI: GoogleGenerativeAI | null = null;
    private readonly model: any = null;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        console.log('AiService: GEMINI_API_KEY present:', !!apiKey);
        if (apiKey && apiKey !== 'your_gemini_api_key_here') {
            this.genAI = new GoogleGenerativeAI(apiKey);
            // Usamos gemini-2.5-flash que es el que hemos confirmado que funciona con esta clave
            this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        }
    }

    async generateResponse(prompt: string): Promise<string> {
        if (!this.genAI || !this.model) {
            console.warn('GEMINI_API_KEY no configurada correctamente. Usando respuesta mock.');
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(`Soy tu Tutor IA (Modo Offline). Entiendo tu pregunta: "${prompt}". Para darte respuestas reales, configura la GEMINI_API_KEY en el servidor.`);
                }, 800);
            });
        }

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error llamando a Gemini API:', error);
            // Fallback for safety
            if (error.message?.includes('API_KEY_INVALID')) {
                return 'Error: La clave de API de Gemini parece no ser válida. Por favor, revísala en el archivo .env.';
            }
            return 'Lo siento, hubo un error al procesar tu solicitud con el servidor de IA de Google.';
        }
    }
}
