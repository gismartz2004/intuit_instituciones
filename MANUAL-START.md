
## 🔴 PROBLEMA IDENTIFICADO

El backend NO puede conectarse a la base de datos Neon PostgreSQL desde Docker debido a un error de DNS.

**Error:** `getaddrinfo ENOTFOUND` - El contenedor Docker no puede resolver el hostname de Neon.

## ✅ SOLUCIÓN: Ejecutar SIN Docker (Desarrollo Local)

Para que funcione correctamente, vamos a ejecutar el backend y frontend **directamente** (sin Docker) en modo desarrollo.

---

## 📋 PASO 1: Detener Contenedores Docker

```powershell
# Detener y eliminar contenedores existentes
docker stop arg-backend arg-frontend 2>$null
docker rm arg-backend arg-frontend 2>$null

# Verificar que se detuvieron
docker ps
```

---

## 📋 PASO 2: Configurar Backend

### 2.1 Ir a la carpeta del backend

```powershell
cd c:\Users\OSCURIDAD\Desktop\arg-academy-fe\backend
```

### 2.2 Verificar que el archivo `.env` existe

```powershell
# Ver el contenido del .env
Get-Content .env
```

Debe tener algo como:
```
DATABASE_URL="postgresql://neondb_owner:npg_8DLHWINgfYS3@ep-holy-scene-ad71wis8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET="544b74c3a22abd6bdca8c75cc0ec6c3042448f0e2"
PORT=8080
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 2.3 Instalar dependencias (si no están instaladas)

```powershell
npm install
```

### 2.4 Ejecutar el backend

```powershell
npm run start:dev
```

**Deberías ver:**
```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] AppModule dependencies initialized
Application is running on: http://[::]:8080
```

**⚠️ IMPORTANTE:** Deja esta terminal abierta. El backend debe estar corriendo.

---

## 📋 PASO 3: Configurar Frontend (EN OTRA TERMINAL)

### 3.1 Abrir una NUEVA terminal PowerShell

Presiona `Win + X` → Selecciona "Terminal" o "PowerShell"

### 3.2 Ir a la carpeta del frontend

```powershell
cd c:\Users\OSCURIDAD\Desktop\arg-academy-fe\frontend
```

### 3.3 Verificar archivo `.env.local`

```powershell
# Ver si existe el archivo
Get-Content .env.local
```

Si no existe o no tiene la URL correcta, créalo:

```powershell
# Crear archivo .env.local con la URL del backend
@"
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=ARG Academy
VITE_ENABLE_ANALYTICS=false
"@ | Out-File -FilePath .env.local -Encoding utf8
```

### 3.4 Instalar dependencias (si no están instaladas)

```powershell
npm install
```

### 3.5 Ejecutar el frontend

```powershell
npm run dev
```

**Deberías ver:**
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 📋 PASO 4: Probar la Aplicación

### 4.1 Abrir el navegador

```powershell
Start-Process http://localhost:5173
```

O manualmente abre: **http://localhost:5173**

### 4.2 Intentar hacer login

Usa las credenciales de un usuario existente en la base de datos.

### 4.3 Verificar en DevTools (F12)

1. Presiona `F12` para abrir DevTools
2. Ve a la pestaña **Network**
3. Intenta hacer login
4. Verifica que las peticiones van a `http://localhost:8080/api/...`

---

## 🔍 Verificar que Todo Funcione

### Verificar backend

En una nueva terminal:

```powershell
# Health check del backend
curl http://localhost:8080/api/health
```

Debería responder: `{"status":"ok"}`

### Ver logs del backend

En la terminal donde corre el backend, deberías ver las peticiones:

```
[Nest] POST /api/auth/login +0ms
Validating user: test@test.com
```

---

## 🛑 Detener Todo

### Para detener backend:
- Ve a la terminal del backend
- Presiona `Ctrl + C`

### Para detener frontend:
- Ve a la terminal del frontend
- Presiona `Ctrl + C`

---

## 📊 Resumen de Comandos Completos

```powershell
# ===============================
# TERMINAL 1: Backend
# ===============================
cd c:\Users\OSCURIDAD\Desktop\arg-academy-fe\backend
npm install
npm run start:dev
# Dejar corriendo...

# ===============================
# TERMINAL 2: Frontend
# ===============================
cd c:\Users\OSCURIDAD\Desktop\arg-academy-fe\frontend

# Crear .env.local si no existe
@"
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=ARG Academy
VITE_ENABLE_ANALYTICS=false
"@ | Out-File -FilePath .env.local -Encoding utf8

npm install
npm run dev
# Dejar corriendo...

# ===============================
# TERMINAL 3: Abrir navegador
# ===============================
Start-Process http://localhost:5173
```

---

## ❌ Si Algo No Funciona

### El backend no inicia

**Error:** `Cannot find module`
```powershell
# Reinstalar dependencias
cd backend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

**Error:** `Port 8080 is already in use`
```powershell
# Ver qué está usando el puerto
netstat -ano | findstr :8080

# Matar el proceso (reemplaza <PID> con el número que aparece)
taskkill /PID <PID> /F
```

### El frontend no se conecta al backend

**Verificar que el backend esté corriendo:**
```powershell
curl http://localhost:8080/api/health
```

**Verificar el archivo .env.local:**
```powershell
cd frontend
Get-Content .env.local
```

Debe tener: `VITE_API_BASE_URL=http://localhost:8080`

**Si cambias .env.local, debes REINICIAR el frontend:**
1. En la terminal del frontend presiona `Ctrl + C`
2. Ejecuta de nuevo: `npm run dev`

### Error de CORS

Si ves en la consola del navegador:
```
Access to fetch at 'http://localhost:8080/api/...' has been blocked by CORS
```

**Verifica el `.env` del backend:**
```powershell
cd backend
Get-Content .env
```

Debe incluir:
```
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

Si no está, agrégalo y **reinicia el backend** (`Ctrl + C` y luego `npm run start:dev`).

---

## 🎯 URLs Importantes

Cuando todo esté corriendo:

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8080
- **Health Check:** http://localhost:8080/api/health

---

## 💡 Por Qué NO Usar Docker Ahora

Docker tiene problemas con DNS en Windows para conectarse a bases de datos externas como Neon PostgreSQL.

**Para desarrollo local:** Ejecutar sin Docker es más simple y rápido.

**Para producción (Cloud Run):** Docker funciona perfectamente porque Cloud Run tiene mejor red.

---

## ✅ Checklist de Ejecución

- [ ] Detener contenedores Docker
- [ ] Backend: `npm install` y `npm run start:dev`
- [ ] Frontend: Crear `.env.local` con `VITE_API_BASE_URL=http://localhost:8080`
- [ ] Frontend: `npm install` y `npm run dev`
- [ ] Abrir http://localhost:5173 en el navegador
- [ ] Probar login
- [ ] Verificar en DevTools que las APIs se llaman correctamente
