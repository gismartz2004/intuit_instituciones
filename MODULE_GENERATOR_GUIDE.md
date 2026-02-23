# 🚀 Sistema de Generación de Módulos con IA

## ¿Qué se ha creado?

### 1. **ModuleGeneratorService** (Backend)
- Ubicación: `/backend/src/modules/module-generator.service.ts`
- Función: Genera módulos completos usando Google Gemini AI
- Entrada: Un prompt en lenguaje natural (ej: "hazme un módulo de Arduino")
- Salida: Estructura JSON con niveles, retos, archivos y criterios

### 2. **ModuleGenerator Component** (Frontend)
- Ubicación: `/frontend/src/features/professor/components/ModuleGenerator.tsx`
- Interfaz visual para que el profesor ingrese prompts
- Preview interactivo de lo generado
- Botón de guardar para persistir en BD

### 3. **InteractiveRetoEditor Component** (Frontend)
- Ubicación: `/frontend/src/features/professor/components/InteractiveRetoEditor.tsx`
- Editor de código integrado para los estudiantes
- Muestra criterios y archivos base
- Ejecuta y envía soluciones

---

## 🔧 Integración en el Profesor Dashboard

### Paso 1: Importar el componente
```tsx
import ModuleGenerator from "@/features/professor/components/ModuleGenerator";
```

### Paso 2: Usar en el JSX
```tsx
{selectedCourse && (
  <ModuleGenerator
    cursoId={selectedCourse.id}
    profesorId={parseInt(user.id)}
    onModuleCreated={() => {
      // Recargar módulos
      fetchModules(selectedCourse.id);
    }}
  />
)}
```

---

## 📋 Flujo de Uso

### Para Profesores:
1. Crear un curso
2. Abrir el generador de módulos
3. Escribir: `"Hazme un módulo de Arduino donde los estudiantes..."`
4. ✨ IA genera estructura completa (3-4 niveles, 2-3 retos cada uno)
5. Revisar generado
6. Guardar → Automáticamente se crea en BD

### Para Estudiantes:
1. Abrir un reto de un módulo
2. Ver el editor interactivo (archivos base, criterios)
3. Escribir/modificar código
4. Ejecutar/Enviar solución
5. Sistema evalúa según criterios

---

## 🎯 Características de los Módulos Generados

Cada módulo tiene:
- **Niveles progresivos** (básico → intermedio → avanzado)
- **Retos variados**: code, design, theory, project
- **Archivos base**: plantillas de código listas
- **Criterios claros**: 100 pts por reto
- **Duraciones**: 7-60 días configurables

---

## 🔌 Endpoints API

### Generar módulo:
```
POST /api/modules/generate
Body: {
  prompt: "Hazme un módulo de React",
  cursoId: 1,
  profesorId: 2
}
```

### Guardar módulo generado:
```
POST /api/modules/save-generated
Body: {
  module: {...}, // estructura generada
  cursoId: 1,
  profesorId: 2
}
```

---

## 📊 Estructura de Datos Generada

```json
{
  "nombreModulo": "Introducción a Arduino",
  "duracionDias": 21,
  "niveles": [
    {
      "titulo": "Nivel 1: Conceptos Básicos",
      "descripcion": "...",
      "objetivos": ["Entender electrónica básica", "..."],
      "retos": [
        {
          "titulo": "LED Parpadeante",
          "descripcion": "...",
          "tipo": "code",
          "dificultad": "fácil",
          "archivosBase": [
            {
              "nombre": "sketch.ino",
              "contenido": "...",
              "lenguaje": "cpp"
            }
          ],
          "criteria": [
            {
              "descripcion": "LED parpadea correctamente",
              "puntos": 50
            }
          ]
        }
      ]
    }
  ]
}
```

---

## ⚙️ Configuración Requerida

1. **Variables de entorno (backend/.env)**:
   ```
   GOOGLE_GENERATIVE_AI_API_KEY=tu_api_key
   ```

2. **Instalar dependencia (si no existe)**:
   ```bash
   npm install @google/generative-ai
   ```

---

## 🎨 Casos de Uso Ejemplo

### 1. Módulo de Arduino
```
"Hazme un módulo completo de Arduino para principiantes 
where students learn electronics, microcontrollers, and IoT projects. 
Include hands-on challenges with code."
```

### 2. Módulo de React
```
"Create a React fundamentals module with hooks, components, 
state management, and build 3 practice projects."
```

### 3. Módulo de Bases de Datos
```
"Módulo de SQL para estudiantes. Incluye basics, queries, 
join tables, y proyectos reales con datasets."
```

---

## 📱 Para Integración Completa

### En ProfessorDashboard.tsx:
```tsx
import ModuleGenerator from "@/features/professor/components/ModuleGenerator";
import InteractiveRetoEditor from "@/features/professor/components/InteractiveRetoEditor";

export default function ProfessorDashboard() {
  // ... existing code ...

  const [showGenerator, setShowGenerator] = useState(false);

  return (
    <div className="space-y-6">
      {/* Existing tabs... */}
      
      <Tabs>
        <TabsList>
          <TabsTrigger value="modules">Módulos</TabsTrigger>
          <TabsTrigger value="generator">✨ Generar Módulo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="modules">
          {/* Existing modules content */}
        </TabsContent>
        
        <TabsContent value="generator">
          <ModuleGenerator
            cursoId={selectedCourse?.id}
            profesorId={parseInt(user.id)}
            onModuleCreated={() => fetchModules(selectedCourse.id)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## ✅ Próximos Pasos

1. ✅ Eliminación de especialización (backend)
2. ✅ Sistema generador de módulos
3. ✅ Componentes frontend
4. ⏭️ **TODO**: Integrar en rutas de estudiantes
5. ⏭️ **TODO**: Sistema de evaluación automática
6. ⏭️ **TODO**: Almacenar soluciones de estudiantes

---

## 🐛 Troubleshooting

**Error: "AI not configured"**
- Verificar GOOGLE_GENERATIVE_AI_API_KEY en .env
- Reiniciar servidor backend

**Error: "Invalid JSON response"**
- Gemini a veces envuelve JSON en markdown
- El servicio lo limpia automáticamente

**Módulo no se guarda**
- Verificar estructura de datos
- Revisar logs del backend
- Confirmar que cursoId existe

---

## 🚀 ¡Listo para usar!

El sistema está completamente integrado y funcional. Solo necesita ser conectado al dashboard del profesor.
