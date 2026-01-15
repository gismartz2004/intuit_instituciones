# 🎯 ARG Academy Frontend - Arquitectura por Features

## 📂 Estructura del Proyecto

```
frontend/src/
├── features/                    # ✅ Funcionalidades organizadas por dominio
│   ├── admin/                   # Dashboard y gestión administrativa
│   │   ├── components/          # Componentes de UI
│   │   │   └── AdminDashboard.tsx
│   │   ├── services/            # API calls
│   │   │   └── admin.api.ts
│   │   ├── types/               # TypeScript types
│   │   │   └── admin.types.ts
│   │   └── index.ts             # Exports públicos
│   │
│   ├── student/                 # Experiencia del estudiante
│   │   ├── components/
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── StudentDashboard3D.tsx
│   │   │   ├── LevelViewer.tsx
│   │   │   └── WorldMap3D.tsx
│   │   ├── services/
│   │   │   └── student.api.ts
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── professor/               # Herramientas para profesores
│   │   ├── components/
│   │   │   ├── ProfessorDashboard.tsx
│   │   │   ├── CourseEditor.tsx
│   │   │   └── FileSystem.tsx
│   │   ├── services/
│   │   │   └── professor.api.ts
│   │   └── index.ts
│   │
│   ├── auth/                    # Autenticación y onboarding
│   │   ├── components/
│   │   │   ├── Login.tsx
│   │   │   └── OnboardingWizard.tsx
│   │   ├── services/
│   │   │   └── auth.api.ts
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── labs/                    # Laboratorios de código
│   │   ├── components/
│   │   │   ├── CodingLab.tsx
│   │   │   └── ArduinoLab.tsx
│   │   └── index.ts
│   │
│   ├── leaderboard/             # Tabla de posiciones
│   ├── profile/                 # Perfil de usuario
│   ├── courses/                 # Cursos avanzados (Pro, AI Tutor)
│   └── gamification/            # Elementos de gamificación
│
├── components/                  # 🔧 Componentes compartidos
│   ├── layout/                  # Sidebar, Navigation
│   │   ├── Sidebar.tsx
│   │   └── MobileNav.tsx
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ... (60+ componentes)
│
├── services/                    # 🌐 Servicios compartidos
│   └── api.client.ts            # Cliente HTTP con env vars
│
├── config/                      # ⚙️ Configuración
│   └── env.ts                   # Variables de entorno centralizadas
│
├── hooks/                       # 🪝 Custom hooks compartidos
│   ├── use-mobile.tsx
│   └── use-toast.ts
│
├── lib/                         # 📚 Utilidades compartidas
│   ├── queryClient.ts
│   └── utils.ts
│
├── types/                       # 📝 Tipos compartidos
│   └── common.types.ts
│
├── assets/                      # 🎨 Recursos estáticos
│   ├── avatars/
│   ├── gamification/
│   └── generated_images/
│
├── App.tsx                      # Router principal
└── main.tsx                     # Entry point
```

---

## 🔑 Mejoras Implementadas

### 1. **Organización por Features**
- ✅ Cada funcionalidad tiene su propia carpeta con todo lo necesario
- ✅ Fácil de escalar y mantener
- ✅ Código relacionado está agrupado lógicamente

### 2. **Centralización de API Calls**
- ✅ Todas las URLs están centralizadas en servicios
- ✅ No hay más `fetch()` hardcodeados en componentes
- ✅ Cliente HTTP reutilizable (`api.client.ts`)

### 3. **Variables de Entorno**
- ✅ Configuración centralizada en `config/env.ts`
- ✅ Fácil cambio entre desarrollo y producción
- ✅ `.env.example` actualizado con todas las variables

### 4. **Exports Limpios**
- ✅ Cada feature tiene su `index.ts`
- ✅ Imports más legibles: `import { AdminDashboard } from '@/features/admin'`
- ✅ Barrel exports para mejor DX

---

## 🚀 Cómo Usar

### Desarrollo Local

1. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env.local
   # Edita .env.local con tus valores
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar dev server:**
   ```bash
   npm run dev
   ```

### Producción

1. **Configurar .env.production:**
   ```env
   VITE_API_BASE_URL=https://tu-backend.com
   VITE_APP_NAME=ARG Academy
   ```

2. **Build:**
   ```bash
   npm run build
   ```

---

## 📖 Guía de Desarrollo

### Crear una Nueva Feature

1. Crear la estructura:
   ```bash
   mkdir -p src/features/mi-feature/{components,services,types}
   ```

2. Crear el servicio API (`services/mi-feature.api.ts`):
   ```typescript
   import apiClient from '@/services/api.client';

   export const miFeatureApi = {
     async getData() {
       return apiClient.get('/api/mi-feature');
     }
   };
   ```

3. Crear tipos (`types/mi-feature.types.ts`):
   ```typescript
   export interface MiData {
     id: number;
     name: string;
   }
   ```

4. Crear componente (`components/MiFeature.tsx`):
   ```typescript
   import { miFeatureApi } from '../services/mi-feature.api';
   
   export default function MiFeature() {
     // Tu componente
   }
   ```

5. Exportar en `index.ts`:
   ```typescript
   export { default as MiFeature } from './components/MiFeature';
   export * from './services/mi-feature.api';
   export * from './types/mi-feature.types';
   ```

### Usar una Feature en App.tsx

```typescript
import { MiFeature } from '@/features/mi-feature';

// En el router
<Route path="/mi-ruta" component={MiFeature} />
```

---

## 🔧 Configuración de API

Todas las llamadas a la API ahora usan el cliente centralizado que lee las variables de entorno:

```typescript
// ❌ ANTES (No hacer)
fetch('http://localhost:3000/api/usuarios')

// ✅ AHORA (Hacer)
import apiClient from '@/services/api.client';
apiClient.get('/api/usuarios')
```

---

## 📝 Variables de Entorno Disponibles

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | URL del backend | `http://localhost:3000` |
| `VITE_APP_NAME` | Nombre de la app | `ARG Academy` |
| `VITE_ENABLE_ANALYTICS` | Habilitar analytics | `false` |

---

## ✅ Checklist de Migración Completada

- [x] Crear estructura de carpetas por features
- [x] Mover todos los componentes a sus features
- [x] Crear servicios API para cada feature
- [x] Centralizar configuración de entorno
- [x] Actualizar todos los imports en App.tsx
- [x] Remover URLs hardcodeadas
- [x] Crear cliente HTTP reutilizable
- [x] Documentar nueva estructura

---

## 🎯 Próximos Pasos Recomendados

1. **Tests por Feature**: Agregar tests unitarios en cada carpeta feature
2. **Lazy Loading**: Implementar code splitting por feature
3. **Custom Hooks**: Extraer lógica repetida a hooks personalizados
4. **Tipos TypeScript**: Completar tipado en todos los componentes
5. **Error Boundaries**: Agregar manejo de errores por feature

---

## 📚 Recursos

- [Documentación de Vite](https://vitejs.dev/)
- [Variables de Entorno en Vite](https://vitejs.dev/guide/env-and-mode.html)
- [Feature-Sliced Design](https://feature-sliced.design/)

---

**Estructura creada el:** 14 de Enero de 2026  
**Arquitectura:** Feature-Based Organization  
**Mantenibilidad:** ⭐⭐⭐⭐⭐
