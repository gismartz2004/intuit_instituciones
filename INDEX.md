# 📖 ÍNDICE RÁPIDO DE REFERENCIA - ARG Academy

## 🚀 INICIO RÁPIDO

### Cardinales del Proyecto

```
📍 Raíz: c:\Users\OSCURIDAD\Documents\arg-academy-fe

Carpetas principales:
  ├── backend/          API NestJS en Puerto 3000
  ├── frontend/         React + Vite en Puerto 5173
  └── script/           Build utilities

Documentos importantes:
  ├── DEPLOYMENT.md          → Desplegar a Google Cloud
  ├── DOCKER-QUICK-START.md  → Correr con Docker
  ├── MANUAL-START.md        → Setup manual
  ├── PROJECT_MAP.md         → Mapeo extenso (este)
  └── DATA_FLOWS.md          → Flujos de datos
```

### Arrancar el Proyecto (3 opciones)

**Opción 1: Docker (Más fácil)**
```powershell
cd c:\Users\OSCURIDAD\Documents\arg-academy-fe
.\start-docker.ps1    # Inicia ambos servicios
# Frontend: http://localhost:80
# Backend: http://localhost:3000
```

**Opción 2: Manual (Más control)**
```bash
# Terminal 1: Backend
cd backend
npm install
npm run start:dev
# Escucha en http://localhost:3000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
# Servidor en http://localhost:5173
```

**Opción 3: Producción (Google Cloud)**
```bash
Ver DEPLOYMENT.md para instrucciones detalladas
```

---

## 📂 MAPEO DE CARPETAS - REFERENCIA RÁPIDA

### Backend `/backend/src/`

| Carpeta | Propósito | Archivos Clave |
|---------|-----------|-----------------|
| `modules/auth/` | Autenticación JWT | `auth.service.ts`, `jwt.strategy.ts` |
| `modules/student/` | Dashboard estudiante | `student.service.ts`, `gamification.service.ts` |
| `modules/professor/` | Herramientas profesor | `professor.service.ts`, `courses management` |
| `modules/admin/` | Panel administrador | `admin.service.ts` |
| `modules/users/` | Gestión de usuarios | `users.service.ts` |
| `modules/ai/` | Integración Gemini | `ai.service.ts` |
| `modules/notifications/` | Email & push | `notifications.service.ts` |
| `modules/premios/` | Sistema de recompensas | `premios.service.ts` |
| `modules/plans/` | Planes de suscripción | `plans.service.ts` |
| `modules/storage/` | SFTP storage | `storage.service.ts` |
| `database/` | ORM & Migrations | `drizzle.provider.ts`, schema.ts |
| `shared/` | Utilidades compartidas | guards, decorators, pipes |
| `types/` | Typescript types | `ssh2-sftp-client.d.ts` |

### Frontend `/frontend/src/`

| Carpeta | Propósito | Componentes Clave |
|---------|-----------|-------------------|
| `pages/` | Pages (routing) | AdminDashboard.tsx, StudentDashboard3D.tsx |
| `features/student/` | Experiencia estudiante | StudentDashboard, LevelViewer, WorldMap3D |
| `features/professor/` | Herramientas profesor | ProfessorDashboard, CourseEditor, FileSystem |
| `features/admin/` | Admin tools | AdminDashboard |
| `features/auth/` | Autenticación | Login, OnboardingWizard |
| `features/labs/` | Laboratorios | CodingLab, PythonLab, ArduinoLab, MinecraftLab |
| `features/asistente-web/` | Tutor IA | AITutor, AsistenteWeb |
| `features/gamification/` | Gamificación | Missions, Prizes, Leaderboard |
| `features/courses/` | Gestión de cursos | CourseEditor, ProCourses |
| `components/ui/` | UI library (60+) | shadcn/ui components |
| `components/layout/` | Layout | Sidebar, Header, Footer |
| `services/` | HTTP client | api.client.ts |
| `hooks/` | Custom hooks | use-mobile, use-toast |
| `lib/` | Utilidades | queryClient, utils |
| `config/` | Configuración | env.ts, api.config.ts |
| `types/` | TypeScript types | common.types.ts |

---

## 🔑 ARCHIVOS MÁS IMPORTANTES

### Backend

```
/backend/
├── src/
│   ├── main.ts                 ⭐ Entry point
│   ├── app.module.ts           ⭐ Root module (importa todos)
│   ├── database/drizzle.provider.ts    ⭐ DB connection
│   ├── modules/auth/auth.service.ts    ⭐ JWT logic
│   ├── modules/student/student.service.ts  ⭐ Student logic
│   └── shared/                 ⭐ Guards, decorators
├── drizzle.config.ts           ⭐ DB config
├── package.json                ⭐ Dependencies
└── Dockerfile                  ⭐ Container
```

### Frontend

```
/frontend/
├── src/
│   ├── main.tsx                ⭐ Entry
│   ├── App.tsx                 ⭐ Router root
│   ├── services/api.client.ts  ⭐ HTTP client
│   ├── features/*/             ⭐ Funcionalidades
│   ├── components/ui/          ⭐ Component library
│   └── lib/queryClient.ts      ⭐ React Query setup
├── vite.config.ts              ⭐ Build config
├── package.json                ⭐ Dependencies
└── tailwind.config.js          ⭐ Styling
```

---

## 🌐 ENDPOINTS MÁS USADOS

### Autenticación
```
POST   /auth/login              Iniciar sesión
POST   /auth/register           Registrar usuario
POST   /auth/refresh            Refrescar token
POST   /auth/logout             Cerrar sesión
```

### Estudiante
```
GET    /student/dashboard       Dashboard data
POST   /student/lessons/:id/complete    Completar lección
GET    /student/progress        Ver progreso
GET    /student/achievements    Ver logros
```

### Profesor
```
GET    /professor/dashboard     Dashboard profesor
POST   /professor/modules       Crear módulo
POST   /professor/upload        Subir recurso
GET    /professor/students      Listar estudiantes
```

### Admin
```
GET    /admin/users             Listar usuarios
DELETE /admin/users/:id         Eliminar usuario
GET    /admin/analytics         Analíticas globales
```

### Gamificación
```
GET    /leaderboard/top100      Top 100 estudiantes
GET    /gamification/points/:userId    Puntos usuario
GET    /gamification/missions   Misiones disponibles
POST   /gamification/missions/:id/complete    Completar
```

### IA
```
POST   /ai/ask                  Preguntar al tutor
GET    /ai/models               Modelos disponibles
```

---

## 🛠️ TAREAS COMUNES

### Agregar Nueva Feature

```
1. Crear carpeta en frontend/src/features/NuevaFeature/
   ├── components/
   ├── services/
   ├── types/
   └── index.ts

2. Crear componente principal en components/
3. Crear servicio API en services/
4. Agregar tipos en types/
5. Conectar en App.tsx router
6. Si requiere backend:
   a. Crear módulo: nest g module NuevaFeature
   b. Generar service: nest g service NuevaFeature
   c. Generar controller: nest g controller NuevaFeature
```

### Crear Nuevo Módulo NestJS

```bash
cd backend

# Generar estructura
nest g module modules/nuevomodulo
nest g service modules/nuevomodulo
nest g controller modules/nuevomodulo

# Agregar endpoints en controller.ts
# Agregar lógica en service.ts
# Importar en app.module.ts
```

### Agregar Componente UI

```bash
cd frontend

# Con shadcn-cli (si instalado)
npx shadcn-ui add button   # Agrega shadcn component

# O copiar manualmente desde components/ui/
```

### Migrar Base de Datos

```bash
cd backend

# Crear nueva migración
npm run db:generate   # Genera SQL basado en schema

# Aplicar migración
npm run db:push       # Pushea cambios a DB

# Ver estado
npm run db:studio     # Abre Drizzle Studio
```

### Desplegar a Producción

```bash
# Ver DEPLOYMENT.md para instrucciones paso a paso

# Resumen rápido:
1. Backend → gcloud run deploy backend
2. Frontend → gcloud run deploy frontend --with-backend-url
3. Actualizar CORS en backend con URL frontend
```

---

## 📚 STACK TÉCNICO - QUICK REFERENCE

### Backend
```
Framework:        NestJS 11.0.1
Language:         TypeScript
ORM:              Drizzle 0.45.1
Database:         PostgreSQL (Neon Cloud)
Auth:             JWT + Passport
Email:            Nodemailer
Storage:          SFTP (ssh2-sftp-client)
AI:               Google Generative AI
Validation:       Zod
```

### Frontend
```
Framework:        React 18+
Build:            Vite
Language:         TypeScript
Styling:          Tailwind CSS
UI Components:    Radix UI + shadcn (60+)
3D Graphics:      Three.js + React Three Fiber
Data Fetching:    TanStack React Query v5
Forms:            React Hook Form + Zod
Animations:       Canvas Confetti
HTTP:             Axios/Fetch
```

### Infrastructure
```
Containerization: Docker
Cloud Hosting:    Google Cloud Run (serverless)
Database:         Neon PostgreSQL (serverless)
Reverse Proxy:    Nginx
CI/CD:            (Needs setup)
```

---

## 🗄️ VARIABLES DE ENTORNO NECESARIAS

### Backend `.env`

```env
# Database
DATABASE_URL=postgresql://user:pass@host/dbname

# JWT
JWT_SECRET=<your-secret-key>
JWT_EXPIRATION=24h

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Google AI
GOOGLE_AI_API_KEY=<your-gemini-api-key>

# SFTP Storage
SFTP_HOST=storage.example.com
SFTP_PORT=22
SFTP_USER=sftp_user
SFTP_PASS=sftp_password
SFTP_REMOTE_PATH=/uploads

# Server
PORT=3000
NODE_ENV=development
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

---

## 🚨 TROUBLESHOOTING RÁPIDO

### Frontend no se conecta al backend
```
✅ Verificar VITE_API_URL en .env
✅ Backend corre en puerto 3000
✅ CORS habilitado en backend (app.enableCors())
✅ Token JWT válido en localStorage
```

### Database connection error
```
✅ DATABASE_URL correcto en .env
✅ PostgreSQL server accesible
✅ Neon connection string correcta
✅ npm run db:push ejecutado
```

### Gmail SMTP no envía emails
```
✅ Usar App Password (no contraseña de cuenta)
✅ 2FA habilitado en Google Account
✅ Configurar para apps menos seguras
✅ Verificar SMTP_HOST y SMTP_PORT
```

### SFTP upload fallando
```
✅ Servidor SFTP accesible
✅ Credenciales correctas
✅ Permisos de escritura en carpeta
✅ Puerto 22 abierto (si es necesario)
```

### Gemini API error
```
✅ API Key válida
✅ Proyecto GCP tiene acceso
✅ Billing habilitado
✅ Rate limits no excedidos
```

---

## 📊 ESTADÍSTICAS DEL PROYECTO

```
Backend
├─ Módulos:        10+
├─ Controllers:    10+
├─ Services:       15+
├─ Migraciones:    8 SQL + 1 custom
├─ líneas código:  ~10,000+
└─ Dependencias:   50+

Frontend
├─ Pages:          17
├─ Features:       11
├─ Components:     60+ (shadcn)
├─ líneas código:  ~15,000+
└─ Dependencias:   100+

Base de Datos
├─ Tablas:         20+
├─ Relaciones:     15+
└─ Stored Functions: (si hay)
```

---

## 🔗 RECURSOS ÚTILES

### Documentación Oficial
- NestJS: https://docs.nestjs.com
- React: https://react.dev
- Drizzle: https://orm.drizzle.team
- Vite: https://vitejs.dev
- Radix UI: https://radix-ui.com
- Three.js: https://threejs.org
- Google Gemini: https://ai.google.dev

### Herramientas
- Drizzle Studio: `npm run db:studio` (backend)
- React Query DevTools (Frontend)
- NestJS CLI: `npm install -g @nestjs/cli`
- Docker Desktop: Para correr contenedores

### Comandos Frecuentes

```bash
# Backend
npm run start:dev              Desarrollo con hot reload
npm run build && npm start     Producción
npm run test                   Tests
npm run lint --fix             Fix linting

# Frontend
npm run dev                    Desarrollo
npm run build                  Build production
npm run preview                Preview build
npm run lint --fix             Fix linting

# Database
npm run db:push               Aplicar migraciones
npm run db:studio             Abrir visualizador
npm run db:generate           Generar SQL

# Docker
./start-docker.ps1            Iniciar contenedores
./stop-docker.ps1             Parar contenedores
docker-compose logs backend    Ver logs backend
docker-compose logs frontend   Ver logs frontend
```

---

## 🎯 PRÓXIMOS OBJETIVOS SUGERIDOS

- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Agregar Redis caching
- [ ] Implementar WebSockets para notificaciones reales
- [ ] Agregar tests unitarios (Jest)
- [ ] Configurar E2E tests (Cypress)
- [ ] Optimizar imágenes  
- [ ] Agregar PWA features
- [ ] Mejorar Dark mode
- [ ] Agregar i18n (múltiples idiomas)
- [ ] Implementar Rate limiting
- [ ] Agregar 2FA (Two-factor auth)

---

**Última actualización**: Febrero 2026  
**Creado por**: GitHub Copilot  
**Versión**: 1.0

💡 **Tip**: Visualiza estos documentos (PROJECT_MAP.md, DATA_FLOWS.md, INDEX.md) en tu editor para una referencia rápida mientras desarrollas.
