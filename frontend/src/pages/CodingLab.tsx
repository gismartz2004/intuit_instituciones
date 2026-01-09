import { useState } from "react";
import { Link } from "wouter";
import { 
  Terminal, 
  Play, 
  Cpu, 
  Settings, 
  ChevronRight, 
  RotateCcw,
  Box,
  Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function CodingLab() {
  const [code, setCode] = useState(`def saludar(nombre):
    return f"Hola, {nombre}!"

print(saludar("Mundo"))
`);
  const [output, setOutput] = useState("> Esperando ejecución...");

  const runCode = () => {
    setOutput("> Ejecutando script...\n> Hola, Mundo!\n> Proceso finalizado con código 0");
  };

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-white overflow-hidden">
      {/* Navbar */}
      <div className="h-14 border-b border-[#333] flex items-center justify-between px-4 bg-[#252526]">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              ← Volver
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Code2 className="text-[#00FFFF]" />
            <span className="font-bold">Laboratorio de Python 101</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button 
             onClick={runCode}
             className="bg-[#2da44e] hover:bg-[#2c974b] text-white font-bold border-none"
           >
             <Play className="w-4 h-4 mr-2" /> Ejecutar
           </Button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-[#252526] border-r border-[#333] hidden md:flex flex-col">
          <div className="p-4 border-b border-[#333]">
            <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-2">Instrucciones</h3>
            <p className="text-sm text-gray-300">
              Crea una función llamada <code className="bg-[#333] px-1 rounded">saludar</code> que tome un parámetro nombre y devuelva un saludo.
            </p>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-2">Simulador</h3>
            <div className="bg-[#1e1e1e] rounded p-4 border border-[#333] flex flex-col items-center gap-4 opacity-50 cursor-not-allowed">
              <Box className="w-16 h-16 text-gray-500" />
              <p className="text-xs text-center text-gray-500">Tinkercad API desconectada</p>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <div className="absolute inset-0 p-4 font-mono text-sm leading-6">
              <textarea 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full bg-transparent resize-none focus:outline-none text-[#d4d4d4]"
                spellCheck={false}
              />
            </div>
          </div>
          
          {/* Console */}
          <div className="h-48 bg-[#1e1e1e] border-t border-[#333] p-4 font-mono text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-xs uppercase font-bold">Consola</span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setOutput("")}>
                <RotateCcw className="w-3 h-3 text-gray-400" />
              </Button>
            </div>
            <div className="text-green-400 whitespace-pre-wrap">
              {output}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
