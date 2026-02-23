import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, Loader, CheckCircle, AlertCircle } from "lucide-react";
import apiClient from "@/services/api.client";

interface ModuleGeneratorProps {
  cursoId: number;
  profesorId: number;
  onModuleCreated?: () => void;
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
      tipo: string;
      dificultad: string;
      archivosBase: Array<any>;
      criteria: Array<any>;
    }>;
  }>;
}

export default function ModuleGenerator({
  cursoId,
  profesorId,
  onModuleCreated,
}: ModuleGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<GeneratedModule | null>(null);
  const [status, setStatus] = useState<"idle" | "generating" | "saving" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setStatus("generating");
    setError(null);

    try {
      const response = await apiClient.post<GeneratedModule>("/api/modules/generate", {
        prompt: prompt.trim(),
        cursoId,
        profesorId,
      });
      setGenerated(response);
      setStatus("idle");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al generar módulo");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveModule = async () => {
    if (!generated) return;

    setStatus("saving");
    setLoading(true);

    try {
      await apiClient.post("/api/modules/save-generated", {
        module: generated,
        cursoId,
        profesorId,
      });
      setStatus("success");
      setPrompt("");
      setGenerated(null);
      onModuleCreated?.();

      setTimeout(() => {
        setStatus("idle");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al guardar módulo");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
          <Sparkles className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Generador de Módulos IA</h2>
          <p className="text-sm text-slate-600">Crea módulos completos con un solo prompt</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="space-y-4 mb-6">
        <label className="text-sm font-semibold text-slate-700">
          Describe el módulo que deseas crear
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ejemplo: Hazme un módulo de Arduino desde cero donde los estudiantes aprendan electrónica básica, programación de microcontroladores y proyectos IoT..."
          className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          rows={5}
          disabled={loading}
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className={cn(
            "w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all",
            loading || !prompt.trim()
              ? "bg-slate-300 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
          )}
        >
          {loading && <Loader className="w-5 h-5 animate-spin" />}
          {loading ? "Generando módulo..." : "✨ Generar Módulo"}
        </button>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Module Preview */}
      <AnimatePresence>
        {generated && status !== "success" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6 mb-6 p-6 bg-white border border-slate-200 rounded-xl"
          >
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {generated.nombreModulo}
              </h3>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                  {generated.duracionDias} días
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                  {generated.niveles.length} niveles
                </span>
              </div>
            </div>

            {/* Niveles Preview */}
            <div className="space-y-3">
              {generated.niveles.map((nivel, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-slate-200 rounded-lg bg-slate-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">
                        Nivel {idx + 1}: {nivel.titulo}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {nivel.descripcion}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-slate-200 text-slate-700 rounded font-mono">
                      {nivel.retos.length} retos
                    </span>
                  </div>

                  {/* Retos */}
                  <div className="mt-3 space-y-2">
                    {nivel.retos.map((reto, retoIdx) => (
                      <div
                        key={retoIdx}
                        className="pl-4 pt-2 border-l-2 border-purple-300 text-xs"
                      >
                        <p className="font-medium text-slate-800">
                          {retoIdx + 1}. {reto.titulo}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-mono">
                            {reto.tipo}
                          </span>
                          <span className={cn(
                            "inline-block px-2 py-0.5 rounded text-[10px] font-mono",
                            reto.dificultad === "fácil"
                              ? "bg-green-100 text-green-700"
                              : reto.dificultad === "media"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          )}>
                            {reto.dificultad}
                          </span>
                          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono">
                            {reto.criteria.reduce((sum, c) => sum + c.puntos, 0)} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setGenerated(null)}
                className="flex-1 py-2 px-4 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                ← Regenerar
              </button>
              <button
                onClick={handleSaveModule}
                disabled={loading}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all",
                  loading
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                )}
              >
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                {loading ? "Guardando..." : "✅ Guardar Módulo"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-8"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              ¡Módulo creado exitosamente!
            </h3>
            <p className="text-slate-600 mb-4">
              Tu nuevo módulo está listo para que los estudiantes lo usen
            </p>
            <button
              onClick={() => {
                setGenerated(null);
                setPrompt("");
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Crear otro módulo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
