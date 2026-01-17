# ====================================
# Script para DETENER Backend y Frontend en Docker
# ====================================

Write-Host "🛑 Deteniendo ARG Academy..." -ForegroundColor Yellow
Write-Host ""

# Detener contenedores
Write-Host "Deteniendo contenedores..." -ForegroundColor Cyan
docker stop arg-backend arg-frontend 2>$null

# Eliminar contenedores
Write-Host "Eliminando contenedores..." -ForegroundColor Cyan
docker rm arg-backend arg-frontend 2>$null

Write-Host ""
Write-Host "✅ Contenedores detenidos y eliminados" -ForegroundColor Green
Write-Host ""

# Mostrar estado
Write-Host "📊 Contenedores activos:" -ForegroundColor Cyan
docker ps --filter "name=arg-"
Write-Host ""
