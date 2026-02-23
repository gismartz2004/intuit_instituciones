import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Code, FileText, Play, Save, X, Copy, Check } from "lucide-react";

interface FileBase {
  nombre: string;
  contenido: string;
  lenguaje?: string;
}

interface RetoCriteria {
  descripcion: string;
  puntos: number;
}

interface InteractiveRetoEditorProps {
  titulo: string;
  descripcion: string;
  tipo: "code" | "design" | "theory" | "project";
  dificultad: "fácil" | "media" | "difícil";
  archivosBase: FileBase[];
  criteria: RetoCriteria[];
  onSubmit?: (solution: string) => void;
}

const LENGUAJE_ICONS: Record<string, string> = {
  javascript: "JS",
  typescript: "TS",
  python: "PY",
  html: "HTML",
  css: "CSS",
  json: "JSON",
  default: "CODE",
};

export default function InteractiveRetoEditor({
  titulo,
  descripcion,
  tipo,
  dificultad,
  archivosBase,
  criteria,
  onSubmit,
}: InteractiveRetoEditorProps) {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [fileContents, setFileContents] = useState<Record<string, string>>(
    archivosBase.reduce((acc, file) => {
      acc[file.nombre] = file.contenido;
      return acc;
    }, {} as Record<string, string>)
  );
  const [copied, setCopied] = useState<string | null>(null);
  const [showCriteria, setShowCriteria] = useState(false);

  const currentFile = archivosBase[selectedFileIdx];
  const currentContent = fileContents[currentFile.nombre];

  const handleCopy = (text: string, fileId: string) => {
    navigator.clipboard.writeText(text);
    setCopied(fileId);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleContentChange = (newContent: string) => {
    setFileContents(prev => ({
      ...prev,
      [currentFile.nombre]: newContent,
    }));
  };

  const handleSubmit = () => {
    const solution = JSON.stringify(fileContents);
    onSubmit?.(solution);
  };

  const dificultadColor = {
    fácil: "from-green-500 to-emerald-500",
    media: "from-amber-500 to-orange-500",
    difícil: "from-red-500 to-rose-500",
  };

  const tipoIcon = {
    code: <Code className="w-5 h-5" />,
    design: <FileText className="w-5 h-5" />,
    theory: <FileText className="w-5 h-5" />,
    project: <FileText className="w-5 h-5" />,
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden border border-slate-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 border-b border-slate-600">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                {tipoIcon[tipo]}
              </div>
              <h1 className="text-2xl font-bold text-white">{titulo}</h1>
            </div>
            <p className="text-slate-300 text-sm">{descripcion}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-bold text-white",
              `bg-gradient-to-r ${dificultadColor[dificultad]}`
            )}>
              {dificultad.toUpperCase()}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-600 text-slate-100">
              {tipo}
            </span>
          </div>
        </div>

        {/* Puntos */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Puntos máximos:</span>
          <span className="text-lg font-bold text-yellow-400">
            {criteria.reduce((sum, c) => sum + c.puntos, 0)} pts
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-6 h-[600px]">
        {/* Files Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-2 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Archivos
          </p>
          <div className="space-y-2 flex-1 overflow-y-auto">
            {archivosBase.map((file, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedFileIdx(idx)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all",
                  selectedFileIdx === idx
                    ? "bg-blue-600/60 text-white border border-blue-400"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-slate-700 px-1.5 py-0.5 rounded">
                    {LENGUAJE_ICONS[file.lenguaje || "default"]}
                  </span>
                  <span className="truncate">{file.nombre}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Criteria Button */}
          <button
            onClick={() => setShowCriteria(!showCriteria)}
            className="w-full mt-4 pt-4 border-t border-slate-700 px-3 py-2 bg-slate-800/60 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
          >
            {showCriteria ? "✓ Criterios" : "📋 Ver Criterios"}
          </button>
        </div>

        {/* Code Editor */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {/* File header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-mono text-slate-300">
                {currentFile.nombre}
              </span>
            </div>
            <button
              onClick={() => handleCopy(currentContent, currentFile.nombre)}
              className="p-1 hover:bg-slate-700 rounded transition-colors"
            >
              {copied === currentFile.nombre ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-slate-400 hover:text-slate-200" />
              )}
            </button>
          </div>

          {/* Code area */}
          <div className="flex-1 overflow-hidden flex flex-col border border-slate-700 rounded-lg bg-slate-950">
            <textarea
              value={currentContent}
              onChange={(e) => handleContentChange(e.target.value)}
              className="flex-1 bg-slate-950 text-slate-100 font-mono text-sm p-4 resize-none focus:outline-none border-none"
              placeholder="// Escribe tu código aquí..."
              spellCheck="false"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-lg transition-all"
            >
              <Play className="w-4 h-4" />
              Ejecutar / Enviar
            </button>
            <button
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-lg transition-all"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Criteria Modal */}
      <AnimatePresence>
        {showCriteria && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCriteria(false)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 rounded-xl border border-slate-700 p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Criterios de Evaluación</h3>
                <button
                  onClick={() => setShowCriteria(false)}
                  className="p-1 hover:bg-slate-800 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-3">
                {criteria.map((criterion, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-100">
                        {idx + 1}. {criterion.descripcion}
                      </span>
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-bold">
                        +{criterion.puntos}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
                <span className="font-semibold text-slate-400">Total:</span>
                <span className="text-2xl font-bold text-yellow-400">
                  {criteria.reduce((sum, c) => sum + c.puntos, 0)} pts
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
