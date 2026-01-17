# ====================================
# Script para correr Backend y Frontend en Docker
# ====================================

Write-Host "🚀 Iniciando ARG Academy con Docker..." -ForegroundColor Cyan
Write-Host ""

# ====================================
# 1. LIMPIAR CONTENEDORES ANTERIORES
# ====================================
Write-Host "🧹 Limpiando contenedores anteriores..." -ForegroundColor Yellow

docker stop arg-backend 2>$null
docker rm arg-backend 2>$null
docker stop arg-frontend 2>$null
docker rm arg-frontend 2>$null

Write-Host "✅ Limpieza completada" -ForegroundColor Green
Write-Host ""

# ====================================
# 2. CONSTRUIR BACKEND
# ====================================
Write-Host "🔨 Construyendo Backend..." -ForegroundColor Yellow
Set-Location "backend"

docker build -t arg-academy-backend .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir el backend" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend construido exitosamente" -ForegroundColor Green
Write-Host ""

# ====================================
# 3. EJECUTAR BACKEND
# ====================================
Write-Host "🚀 Iniciando Backend en puerto 8080..." -ForegroundColor Yellow

docker run -d `
    --name arg-backend `
    -p 8080:8080 `
    --env-file .env `
    arg-academy-backend

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al iniciar el backend" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend corriendo en http://localhost:8080" -ForegroundColor Green
Write-Host ""

# Esperar a que el backend esté listo
Write-Host "⏳ Esperando que el backend esté listo..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# ====================================
# 4. CONSTRUIR FRONTEND
# ====================================
Write-Host "🔨 Construyendo Frontend..." -ForegroundColor Yellow
Set-Location "../frontend"

docker build `
    --build-arg VITE_API_BASE_URL=http://localhost:8080 `
    -t arg-academy-frontend .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir el frontend" -ForegroundColor Red
    docker stop arg-backend
    docker rm arg-backend
    exit 1
}

Write-Host "✅ Frontend construido exitosamente" -ForegroundColor Green
Write-Host ""

# ====================================
# 5. EJECUTAR FRONTEND
# ====================================
Write-Host "🚀 Iniciando Frontend en puerto 8081..." -ForegroundColor Yellow

docker run -d `
    --name arg-frontend `
    -p 8081:8080 `
    arg-academy-frontend

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al iniciar el frontend" -ForegroundColor Red
    docker stop arg-backend
    docker rm arg-backend
    exit 1
}

Write-Host "✅ Frontend corriendo en http://localhost:8081" -ForegroundColor Green
Write-Host ""

# ====================================
# 6. VERIFICAR ESTADO
# ====================================
Set-Location ".."
Write-Host "📊 Estado de los contenedores:" -ForegroundColor Cyan
Write-Host ""
docker ps --filter "name=arg-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
Write-Host ""

# ====================================
# 7. ABRIR NAVEGADOR
# ====================================
Write-Host "🌐 Abriendo aplicación en el navegador..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "http://localhost:8081"

Write-Host ""
Write-Host "════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✨ ¡Aplicación corriendo exitosamente!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:8081" -ForegroundColor White
Write-Host "   Backend:  http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "📝 Comandos útiles:" -ForegroundColor Cyan
Write-Host "   Ver logs backend:  docker logs -f arg-backend" -ForegroundColor White
Write-Host "   Ver logs frontend: docker logs -f arg-frontend" -ForegroundColor White
Write-Host "   Detener todo:      docker stop arg-backend arg-frontend" -ForegroundColor White
Write-Host "   Reiniciar:         docker restart arg-backend arg-frontend" -ForegroundColor White
Write-Host ""
Write-Host "Para detener, presiona Ctrl+C o ejecuta:" -ForegroundColor Yellow
Write-Host "   .\stop-docker.ps1" -ForegroundColor White
Write-Host ""
