# 🔄 FLUJOS DE DATOS Y DEPENDENCIAS - ARG Academy

---

## 🔌 FLUJOS DE AUTENTICACIÓN

### Login Flow

```
1. Usuario ingresa credenciales
   └─> [Frontend: Login.tsx]
   
2. Submit del formulario
   └─> [auth.api.ts POST /auth/login]
   
3. Backend valida credenciales
   └─> [AuthService.login()]
       └─> [UsersService.findByEmail()]
       └─> [bcrypt.compare(password, hash)]
   
4. JWT generation
   └─> [jwt.sign({ userId, email, role })]
   
5. Token devuelto al frontend
   └─> localStorage.setItem('token', token)
   
6. Requests posteriores
   └─> Authorization: Bearer <token>
   └─> [JwtStrategy valida token]
   └─> [Request autenticado en backend]
```

### Protección de Rutas

```
┌─ [App.tsx Router]
├─ Public Routes: /login, /register
├─ Protected Routes (requires token):
│  ├─ /student - StudentDashboard
│  ├─ /professor - ProfessorDashboard
│  ├─ /admin - AdminDashboard
│  └─ /profile - UserProfile
└─ Error: /not-found
```

---

## 🎮 FLUJO DE GAMIFICACIÓN

```
[Estudiante] 
  └─> Completa lección
      └─> StudentService.completeLesson()
          └─> Calcula puntos basado en:
              ├─ Speed bonus
              ├─ Quality score
              ├─ Difficulty multiplier
              └─ Streak bonus
          
          └─> GamificationService.awardPoints()
              ├─ Actualiza tabla: student_points
              ├─ Verifica badges alcanzados
              │  └─ Si alcanza nuevo nivel
              │     └─> badge_earned insert
              ├─ Actualiza leaderboard
              │  └─ SELECT ranking FROM students
              └─ Notifica al usuario
  
  └─> Frontend recibe update
      └─> Muestra:
          ├─ +50 XP animation
          ├─ Confetti effect
          ├─ New badge notification
          └─ Leaderboard actualizado
```

### Niveles de Gamificación

```
LEVEL 1: Beginner
├─ 0-1000 XP
├─ Badges: First Step, Hello World
└─ Reward: Discord role

LEVEL 2: Explorer
├─ 1001-5000 XP
├─ Badges: Explorer, Problem Solver
└─ Reward: Course discount

LEVEL 3: Master
├─ 5001-15000 XP
├─ Badges: Master, Speedrunner
└─ Reward: Premium features

LEVEL 4: Legendary
├─ 15001+ XP
├─ Badges: Legendary, Hall of Fame
└─ Reward: Mentor status
```

---

## 🤖 FLUJO DE IA - ASISTENTE WEB / TUTOR

```
[Usuario en AsistenteWeb.tsx]
  └─> Escribe pregunta
      └─> useMutation(useAIQuery)
          └─> POST /ai/ask (con context)
              └─> AiService.generateAnswer()
                  ├─ Recopila contexto:
                  │  ├─ Módulo actual
                  │  ├─ Nivel del usuario
                  │  └─ Historial previo
                  │
                  └─> Google Generative AI SDK
                      └─> generativeModel.generateContent()
                          ├─ Streaming response
                          ├─ Token counting
                          └─ Rate limiting
          
          └─> Respuesta en tiempo real
              └─> Renderiza markdown
              └─> Syntax highlighting
              └─> Follow-up suggestions
```

### Modelos Gemini disponibles

```
- gemini-2.0-flash      (fastest)
- gemini-1.5-pro        (most capable)
- gemini-1.5-flash      (balanced)
- gemini-pro            (legacy)
- gemini-pro-vision     (with images)
```

---

## 📁 FLUJO DE ALMACENAMIENTO (SFTP)

```
[Profesor en FileSystem.tsx]
  └─> Clic en "Subir Recurso"
      └─> showUploadDialog()
          └─> File input selection
          
      └─> FormData con archivo
          └─> POST /professor/upload
              └─ Validación: tipo, tamaño
              
              └─> StorageService.uploadToSFTP()
                  ├─ Instancia SSH2Client
                  ├─ Conecta a servidor SFTP
                  ├─ mkdir -p /uploads/resources
                  ├─ Sube archivo en stream
                  ├─ Genera URL pública
                  └─ Cierra conexión
              
              └─> Guarda metadata en DB
                  └─> INSERT INTO resources
                      ├─ sftp_path
                      ├─ public_url
                      ├─ uploaded_by (professor_id)
                      └─ created_at

[Estudiante]
  └─> Descarga recurso
      └─> GET /uploads/resources/{id}
          └─> Nginx sirve archivo
              └─> O redirect a URL SFTP
```

### Estructura de Uploads

```
uploads/
├── resources/
│   └── modulo_{id}/
│       ├── lecture_{lesson_id}/
│       │   ├── presentation.pdf
│       │   ├── code.zip
│       │   └── metadata.json
│       └── assignment_{assignment_id}/
│           └── guide.docx
│
└── evidence/
    └── student_{student_id}/
        └── assignment_{assignment_id}/
            ├── submission_{attempt}.zip
            └── verification.json
```

---

## 👨‍🏫 FLUJO DE PROFESOR - CREAR CURSO

```
[Profesor en CourseEditor.tsx]
  
  1. Crear nuevo módulo
     └─> POST /professor/modules
         └─ CREATE MODULE EN DB
  
  2. Agregar lecciones
     └─> POST /professor/modules/{id}/lessons
         └─ INSERT LESSONS
         
  3. Subir recursos
     └─> POST /professor/upload
         └─ SFTP upload (ver flujo arriba)
  
  4. Configurar gamificación
     └─> PUT /professor/modules/{id}/gamification
         ├─ Points distribution
         ├─ Badges rules
         ├─ Difficulty level
         └─ Estimated time
  
  5. Publicar módulo
     └─> PATCH /professor/modules/{id}/publish
         └─ published_at = NOW()
         └─ Notifica a estudiantes suscritos

[Estudiante]
  └─> Ve nuevo módulo en dashboard
      └─> Puede acceder
      └─> Comienza a ganar puntos
```

---

## 📊 FLUJO DE LEADERBOARD EN TIEMPO REAL

```
Cada 1 minuto (polling)
└─> Dashboard ejecuta query
    └─> getLeaderboard()
        └─> SELECT u.*, 
             COUNT(p.points) as total_points,
             RANK() OVER (ORDER BY....) as rank
             FROM users u
             LEFT JOIN points p ON u.id = p.user_id
             GROUP BY u.id
             ORDER BY total_points DESC
             LIMIT 100

        └─> React Query caches resultado
            └─> Actualiza UI si hay cambios
            └─> Mostrar cambios de posición
            └─> Animación de transición
```

### Datos en Leaderboard

```
┌─────────────────────────────────────┐
│ Rank │ User      │ Points │ Level   │
├─────────────────────────────────────┤
│  1   │ Juan      │ 15,250 │ Master  │
│  2   │ María     │ 14,890 │ Master  │
│  3   │ Carlos    │ 12,500 │ Explorer│
│  ...                               │
└─────────────────────────────────────┘
```

---

## 🎓 FLUJO DE ESTUDIANTE - COMPLETAR LECCIÓN

```
[Estudiante en StudentDashboard3D.tsx]
  
  1. Selecciona módulo/lección
     └─> WorldMap3D renderiza mundo
         └─> Three.js + React Three Fiber
  
  2. Entra a lección
     └─> LevelViewer carga contenido
         ├─ Descripción
         ├─ Recursos (PDF, video)
         ├─ Ejercicios
         └─ Quiz
  
  3. Completa quiz/ejercicio
     └─> Validación frontend
         └─> POST /student/lessons/{id}/complete
             └─> StudentService.completeLesson()
                 ├─ Valida tiempo mínimo
                 ├─ Calcula score (0-100)
                 ├─ Award gamification points
                 ├─ Check new badges
                 └─ Update student progress
  
  4. Recibe feedback
     └─> Confetti animation
         └─ +50 XP
         └─ New badge: "Speedrunner" 🏃
         └─ Next level available
  
  5. Progresa en mapa
     └─> Desbloquea siguiente lección
         └─> 3D animation de progreso
         └─> Notificación push
```

---

## 🎁 FLUJO DE PREMIOS Y MISIONES

```
Misiones Diarias
├─ Log in al sistema             → + 5 XP
├─ Completar 1 lección           → + 10 XP
├─ Ver 3 lecciones               → + 15 XP
└─ Ayudar a 2 compañeros         → + 20 XP

Misiones Semanales
├─ Completar 5 lecciones         → + 50 XP + Badge
├─ Mantener streak de 3 días    → + 30 XP
├─ Subir de nivel                → + 100 XP + Reward
└─ Resolver 10 problemas         → + 75 XP

Eventos Especiales
├─ Hackathon mensual             → Prizes + Coins
├─ Seasonal challenges           → Badges limitados
└─ Leaderboard rewards season     → Premios físicos

Sistema de Moneda Virtual
├─ Coins ganados por XP (1 XP = 1 Coin)
├─ Canjeable en:
│  ├─ Premium features
│  ├─ Cosmetics
│  ├─ Discounts en courses
│  └─ Exclusive badges
└─ Transferible entre usuarios (?)
```

---

## 🔔 FLUJO DE NOTIFICACIONES

### Push Notifications

```
Backend Event
└─> Estudiante completa lección
    └─> Profesor publica nuevo curso
    └─> Leaderboard rank cambió
    └─> Nueva misión disponible
    
    └─> NotificationsService.notify()
        ├─ Guarda en DB: notifications table
        ├─ Si usuario online:
        │  └─ WebSocket push (si implementado)
        └─ Si usuario offline:
           └─ Email notification (Nodemailer)
           └─ Push notification (Firebase?)

Frontend
└─> Lee notifications
    └─> GET /notifications/unread
        └─> useQuery(['notifications'], ...)
            └─> Toast UI component muestra
```

### Email Notifications

```
SMTP Configuration
├─ Host: smtp.gmail.com
├─ Port: 587 (TLS)
└─ Auth: Gmail app password

Plantillas de Email
├─ Welcome email
├─ Reset password
├─ Course published
├─ Achievement unlocked
└─ Weekly digest
```

---

## 🔐 FLUJO DE SEGURIDAD

### JWT Token Lifecycle

```
1. Login
   └─> Credenciales → Backend
       └─> Valida en DB
       └─> jwt.sign({userId, email, role})
       └─> Token → Frontend

2. Almacenamiento
   └─> localStorage.setItem('token', token)
   └─ O sessionStorage (mejor)

3. Uso
   └─> Cada request HTTP
       └─> Authorization: Bearer <token>
       └─> Interceptor añade header

4. Validación
   └─> Backend: JwtStrategy
       └─> jwt.verify(token, secret)
       └─> Extrae userId, email, role
       └─ O 401 Unauthorized

5. Expiridad (si implementado)
   └─> Token expira en 24h (configurable)
   └─> Refresh token para renovar
       └─> POST /auth/refresh
           └─> Devuelve nuevo token
```

### Password Security

```
1. Registro
   └─> Usuario ingresa password
   └─> bcrypt.hash(password, 10)
   └─ hash guardado en DB, nunca plain text

2. Login
   └─> bcrypt.compare(inputPassword, dbHash)
   └─ Match o error

3. Reset
   └─> Genera token temporal (JWT)
   └─ Link con token → Email
   └─ Usuario crea nuevo password
   └─ Nueva salt + hash
```

---

## 📡 DIAGRAMA DAR ALTO NIVEL DE APIS

### Backend API Routes

```
/auth
├─ POST   /login            - Autenticación
├─ POST   /register         - Registro
├─ POST   /refresh          - Refresh token
└─ POST   /logout           - Logout

/users/{id}
├─ GET    /                 - Obtener perfil
├─ PUT    /                 - Actualizar perfil
└─ DELETE /account          - Eliminar cuenta

/modules
├─ GET    /                 - Listar módulos
├─ POST   / (profesor)      - Crear módulo
├─ GET    /{id}             - Detalle módulo
├─ PUT    /{id} (profesor)  - Editar módulo
└─ DELETE /{id} (profesor)  - Eliminar módulo

/student
├─ GET    /dashboard        - Dashboard data
├─ POST   /lessons/{id}/complete - Completar lección
├─ GET    /progress         - Progreso del estudiante
└─ GET    /achievements     - Logros obtenidos

/professor
├─ GET    /dashboard        - Dashboard profesor
├─ POST   /upload           - Subir recurso
├─ GET    /students         - Listar estudiantes
├─ POST   /grades           - Calificar
└─ GET    /analytics        - Analíticas

/admin
├─ GET    /users            - Listar usuarios
├─ DELETE /users/{id}       - Eliminar usuario
├─ PUT    /users/{id}/role  - Cambiar rol
├─ GET    /analytics        - Analíticas globales
└─ POST   /backup           - Backup DB

/leaderboard
├─ GET    /top100           - Top 100 estudiantes
├─ GET    /myrank           - Mi posición
└─ GET    /weekly           - Rankings semanales

/ai
├─ POST   /ask              - Preguntar al tutor
├─ GET    /models           - Listar modelos disponibles
└─ POST   /context          - Enviar contexto adicional

/gamification
├─ GET    /points/{userId}  - Puntos del usuario
├─ GET    /badges           - Insignias
├─ GET    /missions         - Misiones disponibles
└─ POST   /missions/{id}/complete - Completar misión
```

---

## 🎯 RESUMEN DE INTEGRACIONES EXTERNAS

| Servicio | Uso | Librería |
|----------|-----|----------|
| **Google Gemini** | Tutor IA | `@google/generative-ai` |
| **Neon PostgreSQL** | Base de datos | `postgres`, `pg` |
| **SFTP Server** | File storage | `ssh2-sftp-client` |
| **Gmail SMTP** | Email notifications | `nodemailer` |
| **JWT** | Autenticación | `passport-jwt`, `@nestjs/jwt` |
| **Google Cloud Run** | Hosting backend/frontend | Docker |

---

## 🔄 CICLO DE DESARROLLO LOCAL

### Backend

```bash
# 1. Setup
cd backend
npm install

# 2. Variables de entorno
echo "DATABASE_URL=..." > .env.local

# 3. Migraciones
npm run db:migrate

# 4. Desarrollo
npm run start:dev

# Server escucha en: http://localhost:3000
```

### Frontend

```bash
# 1. Setup
cd frontend
npm install

# 2. Variables de entorno
echo "VITE_API_URL=http://localhost:3000" > .env.local

# 3. Desarrollo
npm run dev

# Dev server en: http://localhost:5173
```

### Docker Compose (Opcionalmente)

```bash
# Desde raíz del proyecto
./start-docker.ps1    # Windows PowerShell

# O manual
docker-compose up -d
# Ambos contenedores corren
# Backend: http://localhost:3000
# Frontend: http://localhost:80
```

---

## 📈 ESCALABILIDAD Y RENDIMIENTO

### Frontend Optimization
- Code splitting por features
- Lazy loading de componentes
- React Query caching
- Image optimization en assets
- Service Worker para offline

### Backend Optimization
- Database indexing en campos frecuentes
- Redis caching (si implementado)
- Pagination en endpoints
- Rate limiting en /ai
- Connection pooling (Drizzle)

### Infrastructure
- Autoscaling en Cloud Run
- CDN para assets estáticos
- Compression gzip
- Database read replicas (si needed)

---

**Última actualización**: Febrero 2026
