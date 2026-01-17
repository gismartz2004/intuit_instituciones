# Docker Scripts para Frontend

## 🏗️ Build de la imagen

```powershell
# Build con API URL del backend local
docker build `
  --build-arg VITE_API_BASE_URL=http://localhost:8080 `
  -t arg-academy-frontend .

# Build con API URL de producción (Cloud Run)
docker build `
  --build-arg VITE_API_BASE_URL=https://arg-academy-backend-xxxx.run.app `
  -t arg-academy-frontend .

# Build sin cache
docker build --no-cache `
  --build-arg VITE_API_BASE_URL=http://localhost:8080 `
  -t arg-academy-frontend .
```

## 🚀 Ejecutar contenedor

```powershell
# Run simple
docker run -d --name frontend -p 8081:8080 arg-academy-frontend

# Run con nombre personalizado
docker run -d --name my-frontend -p 3000:8080 arg-academy-frontend

# Run y ver logs inmediatamente
docker run --name frontend -p 8081:8080 arg-academy-frontend
```

## 📊 Gestión de contenedores

```powershell
# Ver logs
docker logs frontend
docker logs -f frontend  # Seguir logs en tiempo real

# Ver contenedores corriendo
docker ps

# Detener contenedor
docker stop frontend

# Iniciar contenedor detenido
docker start frontend

# Reiniciar contenedor
docker restart frontend

# Eliminar contenedor
docker rm frontend
docker rm -f frontend  # Forzar

# Entrar al contenedor (útil para debug)
docker exec -it frontend sh

# Ver archivos servidos
docker exec frontend ls -la /usr/share/nginx/html

# Ver configuración de nginx
docker exec frontend cat /etc/nginx/conf.d/default.conf
```

## 🧪 Testing local completo

### Opción 1: Usar script automático

```powershell
# Build y run con backend local
.\docker-run.ps1 -Build -ApiUrl "http://localhost:8080"

# Solo run (si ya está built)
.\docker-run.ps1

# Ver logs
.\docker-run.ps1 -Logs

# Detener
.\docker-run.ps1 -Stop

# Limpiar todo
.\docker-run.ps1 -Clean
```

### Opción 2: Comandos manuales

```powershell
# 1. Build
docker build --build-arg VITE_API_BASE_URL=http://localhost:8080 -t arg-academy-frontend .

# 2. Run
docker run -d --name frontend -p 8081:8080 arg-academy-frontend

# 3. Test
Start-Process http://localhost:8081

# 4. Logs
docker logs -f frontend
```

## 🌐 Testing con backend dockerizado

```powershell
# Terminal 1: Backend
cd backend
.\docker-run.ps1 -Build

# Terminal 2: Frontend (apuntando al backend)
cd frontend
# Nota: El script debe actualizar para usar VITE_API_BASE_URL
docker build --build-arg VITE_API_BASE_URL=http://localhost:8080 -t arg-academy-frontend .
docker run -d --name frontend -p 8081:8080 arg-academy-frontend

# Ahora:
# Frontend: http://localhost:8081
# Backend: http://localhost:8080
```

## 🔍 Debug y troubleshooting

```powershell
# Verificar que el build incluyó los archivos
docker run --rm arg-academy-frontend ls -la /usr/share/nginx/html

# Verificar la configuración de Nginx
docker run --rm arg-academy-frontend cat /etc/nginx/conf.d/default.conf

# Test de salud manual
curl http://localhost:8081/health

# Ver todas las capas de la imagen
docker history arg-academy-frontend

# Inspeccionar la imagen
docker inspect arg-academy-frontend

# Probar nginx localmente (sin Docker)
# Útil para verificar nginx.conf
nginx -t -c $(pwd)/nginx.conf
```

## 🧹 Limpieza

```powershell
# Eliminar contenedor e imagen
docker stop frontend
docker rm frontend
docker rmi arg-academy-frontend

# Limpiar todo Docker
docker system prune -a --volumes

# Ver espacio usado
docker system df
```

## 📦 Docker Compose (opcional)

Crear `docker-compose.yml` en la raíz del proyecto:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: .Dockerfile
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
    env_file:
      - ./backend/.env
    networks:
      - app-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: http://localhost:8080
    ports:
      - "8081:8080"
    depends_on:
      - backend
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

Comandos:
```powershell
# Iniciar todo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Rebuild
docker-compose up -d --build

# Detener
docker-compose down
```

## 🚀 Despliegue a Cloud Run

### 1. Build para producción

```powershell
# Obtener URL del backend desplegado
$BACKEND_URL = "https://arg-academy-backend-xxxx.run.app"

# Build con la URL real
docker build `
  --build-arg VITE_API_BASE_URL=$BACKEND_URL `
  -t arg-academy-frontend .
```

### 2. Desplegar directamente (Cloud Run hace el build)

```powershell
cd frontend

# Crear .env.production con la URL del backend
"VITE_API_BASE_URL=https://arg-academy-backend-xxxx.run.app" | Out-File .env.production

# Deploy
gcloud run deploy arg-academy-frontend `
  --source . `
  --platform managed `
  --region southamerica-east1 `
  --allow-unauthenticated `
  --port 8080 `
  --memory 256Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 5
```

### 3. Con Container Registry

```powershell
# Tag
docker tag arg-academy-frontend gcr.io/YOUR_PROJECT_ID/arg-academy-frontend

# Push
docker push gcr.io/YOUR_PROJECT_ID/arg-academy-frontend

# Deploy
gcloud run deploy arg-academy-frontend `
  --image gcr.io/YOUR_PROJECT_ID/arg-academy-frontend `
  --platform managed `
  --region southamerica-east1 `
  --allow-unauthenticated
```

## 🔒 Mejores prácticas implementadas

✅ **Multi-stage build** - Reduce tamaño final
✅ **Nginx Alpine** - Imagen ligera (< 50MB)
✅ **Usuario no-root** - Seguridad mejorada
✅ **Health checks** - Monitoreo automático
✅ **Gzip compression** - Respuestas más rápidas
✅ **Cache estático** - Assets cacheados 1 año
✅ **Security headers** - XSS, CORS, etc.
✅ **SPA routing** - Todas las rutas → index.html

## 📊 Tamaños esperados

```
node:18-alpine (deps)     ~150 MB
Built app (builder)       ~500 MB
Final image (nginx)       ~40-50 MB ✨
```

## 🎯 Checklist de despliegue

- [ ] Backend desplegado en Cloud Run
- [ ] Copiar URL del backend
- [ ] Build frontend con `VITE_API_URL` correcto
- [ ] Probar localmente con Docker
- [ ] Desplegar frontend a Cloud Run
- [ ] Actualizar CORS en el backend con URL del frontend
- [ ] Probar en producción

## 💡 Tips

1. **Variables de entorno**: Vite solo expone variables que empiezan con `VITE_`
2. **Build time**: Las variables se inyectan durante el build, no en runtime
3. **Cache busting**: Vite genera hashes únicos para cada build
4. **404 handling**: nginx.conf redirige todo a index.html (SPA)
5. **CORS**: Debe estar configurado en el backend, no en nginx
