import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  Terminal,
  Play,
  Cpu,
  Settings,
  ChevronRight,
  RotateCcw,
  Box,
  Code2,
  Loader2,
  Globe,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const LANGUAGES = [
  { id: "python", name: "Python", version: "3.10.0", starter: 'def saludar(nombre):\n    return f"Hola, {nombre}!"\n\nprint(saludar("Mundo"))' },
  { id: "javascript", name: "JavaScript", version: "18.15.0", starter: 'function saludar(nombre) {\n    return "Hola, " + nombre + "!";\n}\n\nconsole.log(saludar("Mundo"));' },
  { id: "typescript", name: "TypeScript", version: "5.0.3", starter: 'function saludar(nombre: string): string {\n    return `Hola, ${nombre}!`;\n}\n\nconsole.log(saludar("Mundo"));' },
  { id: "c++", name: "C++", version: "10.2.0", starter: '#include <iostream>\n#include <string>\n\nstd::string saludar(std::string nombre) {\n    return "Hola, " + nombre + "!";\n}\n\nint main() {\n    std::cout << saludar("Mundo") << std::endl;\n    return 0;\n}' },
  { id: "go", name: "Go", version: "1.16.2", starter: 'package main\n\nimport "fmt"\n\nfunc saludar(nombre string) string {\n\treturn "Hola, " + nombre + "!"\n}\n\nfunc main() {\n\tfmt.Println(saludar("Mundo"))\n}' }
];

export default function CodingLab() {
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(selectedLang.starter);
  const [output, setOutput] = useState("> Esperando ejecución...");
  const [isRunning, setIsRunning] = useState(false);

  const runCode = async () => {
    setIsRunning(true);
    setOutput("> Compilando y ejecutando...\n");

    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        body: JSON.stringify({
          language: selectedLang.id,
          version: selectedLang.version,
          files: [{ content: code }]
        })
      });

      const data = await response.json();

      if (data.run) {
        let finalOutput = "";
        if (data.run.stdout) finalOutput += data.run.stdout;
        if (data.run.stderr) finalOutput += "\n[ERROR]\n" + data.run.stderr;
        if (!data.run.stdout && !data.run.stderr) finalOutput = "> (Sin salida)";

        setOutput(prev => prev + finalOutput + `\n\n> Proceso finalizado con código ${data.run.code}`);
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
    } catch (error) {
      setOutput(prev => prev + "[ERROR] No se pudo conectar con el motor de ejecución.");
      toast({ title: "Error de ejecución", description: "Verifica tu conexión a internet", variant: "destructive" });
    } finally {
      setIsRunning(false);
    }
  };

  const handleLangChange = (id: string) => {
    const lang = LANGUAGES.find(l => l.id === id);
    if (lang) {
      setSelectedLang(lang);
      setCode(lang.starter);
      setOutput("> Esperando ejecución...");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0d1117] text-slate-100 overflow-hidden">
      {/* IDE Style Navbar */}
      <div className="h-12 border-b border-[#30363d] flex items-center justify-between px-4 bg-[#161b22]">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-[#30363d] h-8">
              ← Volver
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-500/10 rounded-lg">
              <Code2 className="w-4 h-4 text-blue-400" />
            </div>
            <span className="font-bold text-sm tracking-tight hidden sm:inline-block">ARG Coding Lab</span>
          </div>

          <div className="h-6 w-[1px] bg-[#30363d] mx-2" />

          <Select value={selectedLang.id} onValueChange={handleLangChange}>
            <SelectTrigger className="w-[140px] h-8 bg-[#0d1117] border-[#30363d] text-xs">
              <SelectValue placeholder="Lenguaje" />
            </SelectTrigger>
            <SelectContent className="bg-[#161b22] border-[#30363d] text-white">
              {LANGUAGES.map(lang => (
                <SelectItem key={lang.id} value={lang.id} className="text-xs focus:bg-blue-600">
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={runCode}
            disabled={isRunning}
            className="bg-[#238636] hover:bg-[#2ea043] text-white font-bold h-8 text-xs px-4 rounded-md shadow-sm disabled:opacity-50"
          >
            {isRunning ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Play className="w-3 h-3 mr-2 fill-current" />}
            {isRunning ? "Corriendo..." : "Ejecutar"}
          </Button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* IDE Sidebar */}
        <div className="w-64 bg-[#0d1117] border-r border-[#30363d] hidden lg:flex flex-col">
          <div className="p-4 border-b border-[#30363d] bg-[#161b22]/50">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Globe className="w-3 h-3" /> Entorno de Ejecución
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-slate-500 mb-1">Versión Lenguaje</p>
                <Badge variant="outline" className="text-[10px] border-[#30363d] text-blue-400 bg-blue-400/5">
                  {selectedLang.name} {selectedLang.version}
                </Badge>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 mb-1">Motor</p>
                <p className="text-xs font-medium text-slate-300">Piston Code Engine</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Reto Actual</h3>
            <div className="bg-[#161b22] rounded-lg p-3 border border-[#30363d]">
              <p className="text-xs text-slate-300 leading-relaxed">
                Crea una función llamada <code className="bg-[#30363d] px-1 rounded text-blue-400">saludar</code> que tome un parámetro nombre y devuelva un saludo cordial.
              </p>
            </div>
          </div>
        </div>

        {/* Editor & Console */}
        <div className="flex-1 flex flex-col bg-[#0d1117]">
          {/* File Tab */}
          <div className="h-9 bg-[#161b22] border-b border-[#30363d] flex items-center px-4">
            <div className="flex items-center gap-2 bg-[#0d1117] h-full px-4 border-t-2 border-blue-500 text-xs font-medium text-slate-200">
              <span className="text-blue-400">●</span>
              main.{selectedLang.id === 'python' ? 'py' : selectedLang.id === 'javascript' ? 'js' : selectedLang.id === 'typescript' ? 'ts' : selectedLang.id === 'c++' ? 'cpp' : 'go'}
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="absolute inset-0 p-4 font-mono text-sm leading-6">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full bg-transparent resize-none focus:outline-none text-[#e6edf3] selection:bg-blue-500/30"
                spellCheck={false}
                placeholder="Escribe tu código aquí..."
              />
            </div>
          </div>

          {/* Console Section */}
          <div className="h-64 bg-[#010409] border-t border-[#30363d] flex flex-col shadow-2xl">
            <div className="px-4 py-2 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]">
              <div className="flex items-center gap-2">
                <Monitor className="w-3 h-3 text-slate-500" />
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-tighter">Terminal ARG v1.0</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-[#30363d]"
                onClick={() => setOutput("> Consola limpiada\n")}
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4 font-mono text-sm">
              <div className={cn(
                "whitespace-pre-wrap leading-relaxed",
                output.includes("[ERROR]") ? "text-red-400" : "text-emerald-400"
              )}>
                {output}
              </div>
              {isRunning && <span className="text-blue-400 animate-pulse ml-1">_</span>}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
