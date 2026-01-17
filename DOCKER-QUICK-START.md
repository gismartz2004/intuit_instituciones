# Scripts de Docker para ARG Academy

## 🚀 Inicio Rápido

### Opción 1: Usar el script automático (RECOMENDADO)

```powershell
# Ir a la carpeta del proyecto
cd c:\Users\OSCURIDAD\Desktop\arg-academy-fe

# Ejecutar el script
.\start-docker.ps1
```

Esto hará automáticamente:
1. ✅ Limpiar contenedores anteriores
2. ✅ Construir backend
3. ✅ Ejecutar backend en puerto 8080
4. ✅ Construir frontend
5. ✅ Ejecutar frontend en puerto 8081
6. ✅ Abrir el navegador automáticamente

### Opción 2: Comandos manuales paso a paso

```powershell
# 1. Ir a la carpeta del proyecto
cd c:\Users\OSCURIDAD\Desktop\arg-academy-fe

# 2. Limpiar contenedores anteriores (opcional)
docker stop arg-backend arg-frontend 2>$null
docker rm arg-backend arg-frontend 2>$null

# 3. BACKEND - Construir y ejecutar
cd backend
docker build -t arg-academy-backend .
docker run -d --name arg-backend -p 8080:8080 --env-file .env arg-academy-backend

# 4. FRONTEND - Construir y ejecutar
cd ../frontend
docker build --build-arg VITE_API_BASE_URL=http://localhost:8080 -t arg-academy-frontend .
docker run -d --name arg-frontend -p 8081:8080 arg-academy-frontend

# 5. Verificar que están corriendo
docker ps

# 6. Abrir en el navegador
Start-Process http://localhost:8081
```

## 🛑 Detener la Aplicación

### Opción 1: Usar el script automático

```powershell
.\stop-docker.ps1
```

### Opción 2: Comando manual

```powershell
# Detener y eliminar ambos contenedores
docker stop arg-backend arg-frontend
docker rm arg-backend arg-frontend
```

## 📊 Comandos Útiles

### Ver logs en tiempo real

```powershell
# Backend
docker logs -f arg-backend

# Frontend
docker logs -f arg-frontend

# Ambos al mismo tiempo (en dos terminales diferentes)
```

### Ver estado de los contenedores

```powershell
# Ver todos los contenedores de ARG Academy
docker ps --filter "name=arg-"

# Ver todos los contenedores (incluyendo detenidos)
docker ps -a
```

### Reiniciar contenedores

```powershell
# Reiniciar backend
docker restart arg-backend

# Reiniciar frontend
docker restart arg-frontend

# Reiniciar ambos
docker restart arg-backend arg-frontend
```

### Entrar a un contenedor (para debugging)

```powershell
# Entrar al backend
docker exec -it arg-backend sh

# Entrar al frontend
docker exec -it arg-frontend sh

# Salir del contenedor
exit
```

### Ver recursos usados

```powershell
# Ver CPU, RAM, y red
docker stats arg-backend arg-frontend
```

### Limpiar todo (imágenes, contenedores, etc.)

```powershell
# CUIDADO: Esto eliminará TODO (no solo ARG Academy)
docker system prune -a --volumes

# Solo eliminar imágenes de ARG Academy
docker rmi arg-academy-backend arg-academy-frontend
```

## 🔍 Troubleshooting

### El backend no inicia

```powershell
# Ver los logs del backend
docker logs arg-backend

# Verificar que el puerto 8080 no esté ocupado
netstat -ano | findstr :8080

# Verificar las variables de entorno
docker exec arg-backend printenv | findstr DATABASE
```

### El frontend no se conecta al backend

```powershell
# Verificar que el backend esté corriendo
curl http://localhost:8080/api/health

# Ver los logs del frontend
docker logs arg-frontend

# Verificar que la variable se inyectó correctamente durante el build
# (Buscar la URL del backend en los archivos JavaScript)
docker exec arg-frontend cat /usr/share/nginx/html/index.html | Select-String "localhost:8080"
```

### Puerto ocupado

```powershell
# Ver qué está usando el puerto 8080
netstat -ano | findstr :8080

# Ver qué está usando el puerto 8081
netstat -ano | findstr :8081

# Si necesitas matar un proceso:
# Primero obtén el PID del comando anterior, luego:
taskkill /PID <PID> /F
```

### Rebuild forzado (sin caché)

```powershell
# Backend
cd backend
docker build --no-cache -t arg-academy-backend .

# Frontend
cd frontend
docker build --no-cache --build-arg VITE_API_BASE_URL=http://localhost:8080 -t arg-academy-frontend .
```

## 📍 URLs de la Aplicación

Cuando todo esté corriendo:

- **Frontend (Web):** http://localhost:8081
- **Backend (API):** http://localhost:8080
- **Health Check:** http://localhost:8080/api/health

## 💡 Tips

1. **Siempre verifica los logs** si algo no funciona: `docker logs -f <nombre>`
2. **El backend debe estar corriendo** antes de usar el frontend
3. **Si cambias código**, necesitas hacer rebuild: `docker build ...`
4. **Las variables de entorno del frontend** se inyectan durante el build, no en runtime
5. **Usa el script `start-docker.ps1`** para ahorrarte tiempo

## 🎯 Workflow Típico de Desarrollo

```powershell
# 1. Hacer cambios en el código
# ... editar archivos ...

# 2. Detener contenedores
.\stop-docker.ps1

# 3. Reconstruir y ejecutar
.\start-docker.ps1

# 4. Ver logs si hay problemas
docker logs -f arg-backend
# o
docker logs -f arg-frontend
```
