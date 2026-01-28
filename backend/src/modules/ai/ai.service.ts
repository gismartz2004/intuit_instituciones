import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
    private readonly apiKey: string;
    private readonly apiUrl: string;

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get<string>('AI_API_KEY') || '';
        this.apiUrl = this.configService.get<string>('AI_API_URL') || 'https://api.openai.com/v1/chat/completions';
    }

    async generateResponse(prompt: string): Promise<string> {
        if (!this.apiKey) {
            console.warn('AI_API_KEY no configurada. Usando respuesta mock.');
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(`Soy tu Tutor IA (Modo Mock). Entiendo tu pregunta: "${prompt}". Para darte respuestas reales, configura la AI_API_KEY en el servidor.`);
                }, 1000);
            });
        }

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                }),
            });

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error llamando a la API de IA:', error);
            return 'Lo siento, hubo un error al procesar tu solicitud con el servidor de IA.';
        }
    }
}
