# 🗺️ MAPEO COMPLETO DEL PROYECTO - ARG ACADEMY

**Fecha**: Febrero 2026  
**Stack**: NestJS + React + TypeScript + PostgreSQL

---

## 📊 RESUMEN EJECUTIVO

ARG Academy es una plataforma de educación gamificada con:
- **Backend**: API REST en NestJS con autenticación JWT
- **Frontend**: SPA en React con Vite, UI con Radix UI y 3D con Three.js
- **Base de Datos**: PostgreSQL con ORM Drizzle
- **Infraestructura**: Docker + Google Cloud Run
- **IA**: Integración con Google Gemini para tutorías

---

## 📁 ESTRUCTURA RAÍZ

```
arg-academy-fe/
├── backend/                  # 🔧 API NestJS
├── frontend/                 # 🎨 SPA React
├── script/                   # 📜 Módulos de build
├── DEPLOYMENT.md             # 📋 Guía de despliegue
├── DOCKER-QUICK-START.md     # 🐳 Docker setup
├── MANUAL-START.md           # ⚙️ Inicio manual
├── start-docker.ps1          # ▶️ Script PowerShell (inicio)
└── stop-docker.ps1           # ⏹️ Script PowerShell (parada)
```

---

## 🔧 BACKEND - ARCHITECTURE

### Ubicación: `backend/`

### Stack Técnico
- **Framework**: NestJS 11.0.1
- **ORM**: Drizzle 0.45.1
- **Base de Datos**: PostgreSQL (via Neon)
- **Autenticación**: JWT + Passport
- **Email**: Nodemailer
- **Storage**: SFTP (ssh2-sftp-client)
- **IA**: Google Generative AI SDK
- **Utilities**: Bcrypt, XLSX, Zod (validación)

### Estructura de Carpetas

```
backend/
├── src/
│   ├── main.ts                          # 📍 Entry point
│   ├── app.module.ts                    # 🔗 Root module
│   ├── app.controller.ts                # 🎯 Root controller
│   ├── app.service.ts                   # 📦 Root service
│   │
│   ├── database/                        # 🗄️ Database Layer
│   │   ├── database.module.ts
│   │   ├── drizzle.provider.ts
│   │   ├── create_modulo_profesores.ts
│   │   ├── extend_student_profile_v2.ts
│   │   ├── fix_recursos_table.ts
│   │   └── migrate_professors_to_join_table.ts
│   │
│   ├── modules/                         # 🔌 Feature Modules
│   │   ├── auth/                        # 🔐 Authentication
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── guards/
│   │   │
│   │   ├── users/                       # 👥 User Management
│   │   │   ├── users.module.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.controller.ts
│   │   │
│   │   ├── student/                     # 🎓 Student Feature
│   │   │   ├── student.module.ts
│   │   │   ├── student.service.ts
│   │   │   ├── student.controller.ts
│   │   │   ├── services/
│   │   │   │   └── gamification.service.ts
│   │   │   └── controllers/
│   │   │
│   │   ├── professor/                   # 👨‍🏫 Professor Tools
│   │   │   ├── professor.module.ts
│   │   │   ├── professor.service.ts
│   │   │   ├── professor.controller.ts
│   │   │   └── controllers/
│   │   │
│   │   ├── admin/                       # 🛠️ Admin Dashboard
│   │   │   ├── admin.module.ts
│   │   │   ├── admin.service.ts
│   │   │   └── admin.controller.ts
│   │   │
│   │   ├── modules/                     # 📚 Course Modules
│   │   │   ├── modules.module.ts
│   │   │   ├── modules.service.ts
│   │   │   └── modules.controller.ts
│   │   │
│   │   ├── plans/                       # 💳 Subscription Plans
│   │   │   ├── plans.module.ts
│   │   │   └── plans.service.ts
│   │   │
│   │   ├── ai/                          # 🤖 AI Integration (Gemini)
│   │   │   ├── ai.module.ts
│   │   │   └── ai.service.ts
│   │   │
│   │   ├── notifications/               # 🔔 Notifications
│   │   │   ├── notifications.module.ts
│   │   │   └── notifications.service.ts
│   │   │
│   │   ├── premios/                     # 🎁 Rewards System
│   │   │   ├── premios.module.ts
│   │   │   └── premios.service.ts
│   │   │
│   │   ├── storage/                     # 💾 File Storage (SFTP)
│   │   │
│   │   └── index.ts
│   │
│   ├── shared/                          # 📦 Shared Utilities
│   │   └── (interceptors, decorators, etc.)
│   │
│   └── types/                           # 📝 TypeScript Types
│       └── ssh2-sftp-client.d.ts
│
├── drizzle/                             # 🔄 Database Migrations
│   ├── 0000_supreme_the_professor.sql
│   ├── 0001_thankful_mephistopheles.sql
│   ├── 0002_strong_obadiah_stane.sql
│   ├── 0003_add_imagen_url.sql
│   ├── 0004_add_plantillas_pim.sql
│   ├── 0005_bouncy_human_fly.sql
│   ├── 0006_add_profesor_id_to_modulos.sql
│   ├── 0007_hard_venom.sql
│   └── meta/
│
├── migrations/                          # 📋 Custom Migrations
│   └── 001_create_gamification_tables.sql
│
├── scripts/                             # 🛠️ Utility Scripts
│   ├── manual_db_sync.ts
│   └── migrate-3state.js
│
├── test/                                # ✅ Tests
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── uploads/                             # 📁 File Storage
│   └── evidence/
│
├── package.json                         # 📦 Dependencies
├── tsconfig.json                        # 🔧 TypeScript Config
├── tsconfig.build.json
├── nest-cli.json                        # 🎯 NestJS Config
├── drizzle.config.ts                    # 🗄️ Drizzle Config
├── eslint.config.mjs                    # 🔍 Linting
├── Dockerfile                           # 🐳 Docker Container
└── README.md
```

### Scripts NPM del Backend

```bash
npm run build           # Compilar proyecto
npm run start           # Iniciar servidor
npm run start:dev       # Desarrollo con watch
npm run start:debug     # Debug mode
npm run start:prod      # Producción
npm run lint            # ESLint + fix
npm run format          # Prettier
npm run test            # Tests unitarios
npm run test:watch      # Tests en watch
npm run test:cov        # Coverage
npm run test:e2e        # End-to-end tests
npm run seed            # Seed database
```

### Módulos NestJS Principales

| Módulo | Responsabilidad | Controlador |
|--------|-----------------|-------------|
| **AuthModule** | JWT auth, login, registro | `auth.controller.ts` |
| **UsersModule** | Gestión de usuarios | `users.controller.ts` |
| **StudentModule** | Dashboard estudiante, gamification | `student.controller.ts` |
| **ProfessorModule** | Dashboard profesor, creación de cursos | `professor.controller.ts` |
| **AdminModule** | Panel de administración | `admin.controller.ts` |
| **ModulesModule** | Gestión de módulos de curso | `modules.controller.ts` |
| **PlansModule** | Planes de suscripción | (service only) |
| **AiModule** | Integración Gemini | (service only) |
| **NotificationsModule** | Email y push notifications | (service only) |
| **PremiosModule** | Sistema de recompensas | (service only) |

---

## 🎨 FRONTEND - ARCHITECTURE

### Ubicación: `frontend/`

### Stack Técnico
- **Framework**: React 18+ + JSX
- **Build**: Vite
- **Lenguaje**: TypeScript
- **UI**: Radix UI + shadcn/ui (60+ components)
- **Styling**: Tailwind CSS
- **3D**: Three.js + React Three Fiber + Drei
- **Animaciones**: Canvas Confetti
- **Data Fetching**: TanStack React Query v5
- **Forms**: React Hook Form + Zod validation
- **Estado**: React Context
- **Router**: (implícito en estructura pages/)
- **HTTP Client**: Axios/Fetch customizado

### Estructura de Carpetas

```
frontend/
├── src/
│   ├── main.tsx                         # 📍 Entry Point
│   ├── App.tsx                          # 🎯 Root Router
│   ├── index.css                        # 🎨 Global Styles
│   ├── vite-env.d.ts                    # Vite types
│   │
│   ├── pages/                           # 📄 Page Components (routing)
│   │   ├── AdminDashboard.tsx
│   │   ├── AITutor.tsx                  # Tutor de IA
│   │   ├── ArduinoLab.tsx               # Lab de Arduino
│   │   ├── AsistenteWeb.tsx             # Asistente web
│   │   ├── CodingLab.tsx                # Lab de código
│   │   ├── CourseEditor.tsx             # Editor de cursos
│   │   ├── FileSystem.tsx               # Sistema de archivos
│   │   ├── GamerRaffle.tsx              # Rifa de gamificación
│   │   ├── Leaderboard.tsx              # Tabla de posiciones
│   │   ├── MinecraftLab.tsx             # Lab Minecraft
│   │   ├── Missions.tsx                 # Misiones
│   │   ├── ProCourses.tsx               # Cursos Premium
│   │   ├── ProfessorDashboard.tsx       # Dashboard profesor
│   │   ├── Profile.tsx                  # Perfil usuario
│   │   ├── PythonLab.tsx                # Lab Python
│   │   ├── StudentDashboard3D.tsx       # Dashboard 3D
│   │   └── not-found.tsx                # 404 page
│   │
│   ├── features/                        # ⚙️ Feature Modules (Domain-driven)
│   │   │
│   │   ├── student/                     # 🎓 Student Experience
│   │   │   ├── components/
│   │   │   │   ├── StudentDashboard.tsx
│   │   │   │   ├── StudentDashboard3D.tsx
│   │   │   │   ├── LevelViewer.tsx
│   │   │   │   └── WorldMap3D.tsx
│   │   │   ├── services/
│   │   │   │   └── student.api.ts
│   │   │   ├── types/
│   │   │   │   └── student.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── admin/                       # 🛠️ Admin Tools
│   │   │   ├── components/
│   │   │   │   └── AdminDashboard.tsx
│   │   │   ├── services/
│   │   │   │   └── admin.api.ts
│   │   │   ├── types/
│   │   │   │   └── admin.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── professor/                   # 👨‍🏫 Professor Tools
│   │   │   ├── components/
│   │   │   │   ├── ProfessorDashboard.tsx
│   │   │   │   ├── CourseEditor.tsx
│   │   │   │   └── FileSystem.tsx
│   │   │   ├── services/
│   │   │   │   └── professor.api.ts
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   │
│   │   ├── auth/                        # 🔐 Authentication
│   │   │   ├── components/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── OnboardingWizard.tsx
│   │   │   ├── services/
│   │   │   │   └── auth.api.ts
│   │   │   ├── types/
│   │   │   │   └── auth.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── labs/                        # 🔬 Labs & Coding
│   │   │   ├── components/
│   │   │   │   ├── CodingLab.tsx
│   │   │   │   ├── PythonLab.tsx
│   │   │   │   ├── ArduinoLab.tsx
│   │   │   │   └── MinecraftLab.tsx
│   │   │   ├── services/
│   │   │   │   └── labs.api.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── courses/                     # 📚 Course Management
│   │   │   ├── components/
│   │   │   │   ├── ProCourses.tsx
│   │   │   │   └── CourseEditor.tsx
│   │   │   ├── services/
│   │   │   │   └── courses.api.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── gamification/                # 🎮 Gamification System
│   │   │   ├── components/
│   │   │   │   ├── GamerRaffle.tsx
│   │   │   │   ├── Missions.tsx
│   │   │   │   ├── Prizes.tsx
│   │   │   │   └── Rewards.tsx
│   │   │   ├── services/
│   │   │   │   └── gamification.api.ts
│   │   │   ├── types/
│   │   │   │   └── gamification.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── leaderboard/                 # 📊 Leaderboard
│   │   │   ├── components/
│   │   │   │   └── Leaderboard.tsx
│   │   │   ├── services/
│   │   │   │   └── leaderboard.api.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── profile/                     # 👤 User Profile
│   │   │   ├── components/
│   │   │   │   └── Profile.tsx
│   │   │   ├── services/
│   │   │   │   └── profile.api.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── asistente-web/               # 🤖 AI Web Assistant
│   │   │   ├── components/
│   │   │   │   ├── AITutor.tsx
│   │   │   │   └── AsistenteWeb.tsx
│   │   │   ├── services/
│   │   │   │   └── ai.api.ts
│   │   │   └── index.ts
│   │   │
│   │   └── onboarding/                  # 🚀 Onboarding Flow
│   │       ├── components/
│   │       │   └── OnboardingWizard.tsx
│   │       ├── services/
│   │       │   └── onboarding.api.ts
│   │       └── index.ts
│   │
│   ├── components/                      # 🧩 Shared Components
│   │   ├── layout/                      # Layout Components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── ui/                          # shadcn/ui Components (60+)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── accordion.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── context-menu.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ... (muchos más)
│   │   │
│   │   ├── common/                      # Common UI Elements
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── NotFound.tsx
│   │   │
│   │   └── level/                       # Level Components (3D)
│   │       ├── LevelViewer.tsx
│   │       └── WorldMap3D.tsx
│   │
│   ├── services/                        # 🌐 Global Services
│   │   ├── api.client.ts                # HTTP Client (Axios/Fetch)
│   │   └── notification.service.ts      # Toast notifications
│   │
│   ├── hooks/                           # 🎣 Custom Hooks
│   │   ├── use-mobile.tsx               # Mobile detection
│   │   ├── use-toast.ts                 # Toast hook
│   │   ├── use-auth.ts                  # Auth context
│   │   └── use-query.ts                 # React Query wrapper
│   │
│   ├── lib/                             # 📚 Utilities
│   │   ├── queryClient.ts               # React Query setup
│   │   └── utils.ts                     # General utilities
│   │
│   ├── config/                          # ⚙️ Configuration
│   │   ├── env.ts                       # Environment variables
│   │   └── api.config.ts                # API endpoints
│   │
│   ├── types/                           # 📝 TypeScript Types
│   │   ├── common.types.ts
│   │   ├── api.types.ts
│   │   └── index.ts
│   │
│   └── assets/                          # 🎨 Static Assets
│       ├── avatars/
│       ├── gamification/
│       ├── generated_images/
│       └── backgrounds/
│
├── public/                              # 📁 Static Files
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── sw.js                            # Service Worker
│   └── assets/
│
├── test/                                # ✅ Tests
│   └── (test files)
│
├── package.json                         # 📦 Dependencies
├── tsconfig.json                        # 🔧 TypeScript Config
├── tsconfig.node.json
├── vite.config.ts                       # ⚙️ Vite Config
├── vite.config.d.ts
├── vite-env.d.ts
├── postcss.config.js                    # 🎨 PostCSS Config
├── eslint.config.mjs                    # 🔍 ESLint Config
├── Dockerfile                           # 🐳 Docker Container
├── nginx.conf                           # 🌐 Nginx Config
├── index.html                           # HTML Entry Point
└── ARCHITECTURE.md
```

### Scripts NPM del Frontend

```bash
npm run dev              # Desarrollo (Vite dev server)
npm run build            # Compilar para producción
npm run lint             # ESLint check
npm run preview          # Preview de build
```

### Features Principales

| Feature | Descripción |
|---------|-------------|
| **Student** | Dashboard 3D, niveles, misiones, gamificación |
| **Professor** | Editor de cursos, gestión de estudiantes |
| **Admin** | Panel de control administrativo |
| **Labs** | Coding, Python, Arduino, Minecraft |
| **AI** | Tutor inteligente con Gemini |
| **Gamification** | Puntos, insignias, tabla de posiciones, premios |
| **Leaderboard** | Ranking de estudiantes |
| **Onboarding** | Flujo de registro y configuración |

---

## 🗄️ BASE DE DATOS - SCHEMA

### Tecnología
- **Sistema**: PostgreSQL
- **Hospedaje**: Neon (serverless)
- **ORM**: Drizzle

### Migraciones Principales

1. `0000_supreme_the_professor.sql` - Schema base
2. `0001_thankful_mephistopheles.sql` - Usuarios y auth
3. `0002_strong_obadiah_stane.sql` - Módulos y cursos
4. `0003_add_imagen_url.sql` - Campos de imagen
5. `0004_add_plantillas_pim.sql` - Plantillas PIM
6. `0005_bouncy_human_fly.sql` - Actualización de recursos
7. `0006_add_profesor_id_to_modulos.sql` - Relación profesor-módulo
8. `0007_hard_venom.sql` - Gamification tables
9. `001_create_gamification_tables.sql` - Sistema de gamificación

### Tablas Principales

- `users` - Usuarios del sistema
- `professors` - Datos de profesores
- `students` - Datos de estudiantes
- `modules` - Módulos de cursos
- `lessons` - Lecciones dentro de módulos
- `resources` - Recursos educativos
- `gamification_*` - Puntos, insignias, misiones
- `notifications` - Registro de notificaciones
- `subscriptions` - Planes de suscripción

---

## 🚀 DEPLOYMENT & DEVOPS

### Archivos de Configuración

```
project-root/
├── Dockerfile              # (en backend y frontend)
├── docker-compose.yml      # (implícito en scripts)
├── DEPLOYMENT.md           # 📋 Google Cloud Run
├── DOCKER-QUICK-START.md   # 🐳 Docker setup
├── MANUAL-START.md         # ⚙️ Manual setup
├── start-docker.ps1        # ▶️ PowerShell start
└── stop-docker.ps1         # ⏹️ PowerShell stop
```

### Stack de Deployment
- **Containerización**: Docker
- **Orquestación**: Google Cloud Run (serverless)
- **Base de Datos**: Neon PostgreSQL (serverless)
- **Proxy Inverso**: Nginx
- **CI/CD**: (Setup requerido)

### Flujo de Despliegue
1. ✅ Backend → Google Cloud Run
2. ✅ Frontend → Google Cloud Run (con URL de backend)
3. ✅ Base de Datos → Neon PostgreSQL

---

## 🔑 VARIABLES DE ENTORNO

### Backend (.env)
```
# Database
DATABASE_URL=postgresql://...
NEON_DATABASE_URL=...

# JWT
JWT_SECRET=<generated-secret>

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...

# AI (Gemini)
GOOGLE_AI_API_KEY=...

# Storage (SFTP)
SFTP_HOST=...
SFTP_PORT=22
SFTP_USER=...
SFTP_PASS=...

# Server
PORT=3000
NODE_ENV=production
```

### Frontend (.env)
```
# API
VITE_API_URL=https://backend-url.com
VITE_API_KEY=...

# Environment
VITE_ENV=production
```

---

## 📚 FLUJOS PRINCIPALES

### 1️⃣ Autenticación
```
[Cliente] --POST /auth/login--> [Backend]
[Backend] --JWT token--> [Cliente]
[Cliente] --Authorization: Bearer <token>--> [Backend]
```

### 2️⃣ Gamificación
```
[Estudiante completa lección] 
  --> [Student Service calcula puntos]
  --> [Gamification Service actualiza stats]
  --> [Leaderboard se actualiza]
  --> [UI muestra progreso]
```

### 3️⃣ Tutor IA
```
[Usuario pregunta] 
  --> [AsistenteWeb.tsx]
  --> [ai.api.ts] 
  --> [AI Module (NestJS)]
  --> [Google Gemini API]
  --> [Respuesta generada]
  --> [UI renderiza respuesta]
```

### 4️⃣ Descarga de Archivos (SFTP)
```
[Profesor sube recurso]
  --> [FileSystem.tsx]
  --> [professor.api.ts]
  --> [Storage Module]
  --> [SFTP Client]
  --> [Almacenamiento en servidor]
```

---

## 🎯 PUNTOS CLAVE DE ARQUITECTURA

### Frontend
✅ **Feature-based organization** - Code splittin por funcionalidad  
✅ **Radix UI + shadcn** - 60+ componentes pre-built  
✅ **React Query** - Manejo de estado de datos  
✅ **Three.js** - Renderizado 3D de mundos de aprendizaje  
✅ **TypeScript strict** - Type safety total  

### Backend
✅ **NestJS modular** - Escalable, testeable  
✅ **JWT auth** - Stateless, seguro  
✅ **Drizzle ORM** - Type-safe queries  
✅ **Service-based** - Lógica de negocio centralizada  
✅ **Controllers** - Mapeo de rutas HTTP  

### Base de Datos
✅ **PostgreSQL serverless** - Neon  
✅ **Drizzle migrations** - Versionado de schema  
✅ **Normalized design** - Integridad referencial  

### Infrastructure
✅ **Docker** - Reproducibilidad  
✅ **Cloud Run** - Serverless, escalable  
✅ **Environment-based config** - DEV/PROD separation  

---

## 📊 DEPENDENCIAS CRÍTICAS

### Backend
- `@nestjs/*` - Framework
- `drizzle-orm` - ORM
- `@google/generative-ai` - IA Integration
- `passport-jwt` - Authentication
- `nodemailer` - Email
- `ssh2-sftp-client` - File storage

### Frontend
- `react` - UI Framework
- `@tanstack/react-query` - State management
- `@radix-ui/*` - Component library
- `@react-three/fiber` - 3D graphics
- `react-hook-form` - Form handling
- `zod` - Validation

---

## 🔍 SUMARIO DE CARPETAS IMPORTANTES

| Carpeta | Propósito | Contenido |
|---------|-----------|----------|
| `/backend/src/modules` | Módulos de negocio | Auth, Student, Professor, Admin, etc. |
| `/frontend/src/features` | Features por dominio | student, admin, labs, gamification, etc. |
| `/frontend/src/components/ui` | UI library | 60+ componentes shadcn |
| `/backend/drizzle` | Migraciones DB | SQL migrations versionadas |
| `/script` | Build utils | TypeScript build scripts |
| `/uploads` | Almacenamiento local | Evidence, resources |

---

## 🚀 PRÓXIMOS PASOS COMUNES

1. **Agregar nueva feature**: Crear carpeta en `/features`
2. **Crear nuevo módulo backend**: Generar con `nest g module`
3. **Añadir componente UI**: Usar `shadcn-ui add <component>`
4. **Migrar DB**: Crear SQL en `/drizzle` y ejecutar
5. **Desplegar**: Seguir `DEPLOYMENT.md`

---

**Última actualización**: Febrero 2026  
**Creado por**: GitHub Copilot
