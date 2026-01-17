# Guía de Despliegue a Google Cloud Run

Esta guía te llevará paso a paso para desplegar tu aplicación ARG Academy en Google Cloud Run.

## 📋 Pre-requisitos

- ✅ Cuenta de Google Cloud Platform (GCP)
- ✅ Google Cloud CLI (`gcloud`) instalado
- ✅ Autenticación configurada: `gcloud auth login`
- ✅ Proyecto de GCP creado y seleccionado
- ✅ Base de datos Neon PostgreSQL configurada

## 🔑 Generar JWT Secret

Antes de desplegar, genera un JWT secret seguro:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Guarda este valor de forma segura** - lo necesitarás para configurar el backend.

## 🚀 Orden de Despliegue

**IMPORTANTE:** Debes desplegar en este orden:
1. Backend primero (para obtener su URL)
2. Frontend segundo (usando la URL del backend)
3. Actualizar CORS del backend (con la URL del frontend)

---

## 📦 Paso 1: Desplegar Backend

### 1.1 Preparar variables de entorno

Necesitarás tener a mano:
- `DATABASE_URL`: Tu connection string de Neon PostgreSQL
- `JWT_SECRET`: El secret generado anteriormente
- `PORT`: 8080 (requerido por Cloud Run)
- `ALLOWED_ORIGINS`: Por ahora usa `*` (lo actualizaremos después)

### 1.2 Desplegar

```powershell
cd c:\Users\OSCURIDAD\Desktop\arg-academy-fe\backend

# Opción A: Deploy directo desde código (más simple)
gcloud run deploy arg-academy-backend `
  --source . `
  --platform managed `
  --region southamerica-east1 `
  --allow-unauthenticated `
  --port 8080 `
  --memory 512Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 10 `
  --set-env-vars "NODE_ENV=production,PORT=8080" `
  --set-secrets "DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest"

# Opción B: Si prefieres usar variables de entorno directas (menos seguro)
gcloud run deploy arg-academy-backend `
  --source . `
  --platform managed `
  --region southamerica-east1 `
  --allow-unauthenticated `
  --port 8080 `
  --memory 512Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 10 `
  --set-env-vars "NODE_ENV=production,PORT=8080,DATABASE_URL=TU_DATABASE_URL_AQUI,JWT_SECRET=TU_JWT_SECRET_AQUI,ALLOWED_ORIGINS=*"
```

### 1.3 Obtener URL del backend

Una vez desplegado, Cloud Run te dará una URL como:
```
https://arg-academy-backend-xxxxx-sa.a.run.app
```

**¡COPIA ESTA URL!** La necesitarás para el frontend.

### 1.4 Verificar que funciona

```powershell
# Test de health check
curl https://arg-academy-backend-xxxxx-sa.a.run.app/api/health

# Debería responder: {"status":"ok"}
```

---

## 🎨 Paso 2: Desplegar Frontend

### 2.1 Build local con la URL del backend

```powershell
cd c:\Users\OSCURIDAD\Desktop\arg-academy-fe\frontend

# Reemplaza con tu URL real del backend
$BACKEND_URL = "https://arg-academy-backend-xxxxx-sa.a.run.app"

# Build de la imagen Docker
docker build `
  --build-arg VITE_API_BASE_URL=$BACKEND_URL `
  -t arg-academy-frontend .
```

### 2.2 Tag y Push a Google Container Registry

```powershell
# Obtener tu PROJECT_ID
$PROJECT_ID = gcloud config get-value project

# Tag la imagen
docker tag arg-academy-frontend gcr.io/$PROJECT_ID/arg-academy-frontend

# Configurar Docker para GCR
gcloud auth configure-docker

# Push la imagen
docker push gcr.io/$PROJECT_ID/arg-academy-frontend
```

### 2.3 Desplegar a Cloud Run

```powershell
gcloud run deploy arg-academy-frontend `
  --image gcr.io/$PROJECT_ID/arg-academy-frontend `
  --platform managed `
  --region southamerica-east1 `
  --allow-unauthenticated `
  --port 8080 `
  --memory 256Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 5
```

### 2.4 Obtener URL del frontend

Cloud Run te dará una URL como:
```
https://arg-academy-frontend-xxxxx-sa.a.run.app
```

**¡COPIA ESTA URL!** La necesitarás para actualizar CORS.

---

## 🔒 Paso 3: Configurar CORS en el Backend

Ahora que tienes la URL del frontend, actualiza el backend para permitir peticiones desde esa URL:

```powershell
# Reemplaza con tu URL real del frontend
$FRONTEND_URL = "https://arg-academy-frontend-xxxxx-sa.a.run.app"

# Actualizar la variable ALLOWED_ORIGINS
gcloud run services update arg-academy-backend `
  --region southamerica-east1 `
  --update-env-vars "ALLOWED_ORIGINS=$FRONTEND_URL"
```

---

## ✅ Paso 4: Verificación

### 4.1 Verificar Backend

```powershell
# Health check
curl https://arg-academy-backend-xxxxx-sa.a.run.app/api/health

# Ver logs del backend
gcloud run services logs read arg-academy-backend --region southamerica-east1 --limit 50
```

### 4.2 Verificar Frontend

1. **Abrir la URL del frontend en el navegador**
   ```
   https://arg-academy-frontend-xxxxx-sa.a.run.app
   ```

2. **Abrir DevTools del navegador** (F12)

3. **Ir a la pestaña Network**

4. **Intentar hacer login** con un usuario de prueba

5. **Verificar que las peticiones al backend funcionan:**
   - Deberías ver peticiones a `https://arg-academy-backend-xxxxx-sa.a.run.app/api/...`
   - Las peticiones deberían tener status 200 (o 401 si las credenciales son incorrectas)
   - NO deberían aparecer errores de CORS

### 4.3 Ver logs del frontend

```powershell
gcloud run services logs read arg-academy-frontend --region southamerica-east1 --limit 50
```

---

## 🔧 Comandos Útiles de Mantenimiento

### Ver todos los servicios desplegados
```powershell
gcloud run services list
```

### Redeploy después de cambios

**Backend:**
```powershell
cd backend
gcloud run deploy arg-academy-backend --source . --region southamerica-east1
```

**Frontend:**
```powershell
cd frontend
# 1. Build con la URL correcta
docker build --build-arg VITE_API_BASE_URL=https://arg-academy-backend-xxxxx-sa.a.run.app -t arg-academy-frontend .

# 2. Tag y push
docker tag arg-academy-frontend gcr.io/YOUR_PROJECT_ID/arg-academy-frontend
docker push gcr.io/YOUR_PROJECT_ID/arg-academy-frontend

# 3. Deploy
gcloud run deploy arg-academy-frontend --image gcr.io/YOUR_PROJECT_ID/arg-academy-frontend --region southamerica-east1
```

### Eliminar servicios
```powershell
gcloud run services delete arg-academy-backend --region southamerica-east1
gcloud run services delete arg-academy-frontend --region southamerica-east1
```

### Ver variables de entorno actuales
```powershell
gcloud run services describe arg-academy-backend --region southamerica-east1 --format="value(spec.template.spec.containers[0].env)"
```

### Actualizar variables de entorno sin redeploy
```powershell
gcloud run services update arg-academy-backend `
  --region southamerica-east1 `
  --update-env-vars "KEY=VALUE"
```

---

## 🐛 Troubleshooting

### Error: "Failed to connect to backend"

**Síntoma:** El frontend no puede conectarse al backend.

**Soluciones:**
1. Verifica que la URL del backend esté correctamente embebida en el build del frontend
2. Revisa la consola del navegador para ver qué URL está intentando usar
3. Verifica que CORS esté configurado correctamente en el backend

```powershell
# Verificar CORS actual
gcloud run services describe arg-academy-backend --region southamerica-east1 --format="value(spec.template.spec.containers[0].env)" | Select-String ALLOWED_ORIGINS
```

### Error: CORS Policy

**Síntoma:** Error en la consola del navegador: "Access to fetch at '...' from origin '...' has been blocked by CORS policy"

**Solución:**
```powershell
# Actualizar ALLOWED_ORIGINS con la URL exacta del frontend
gcloud run services update arg-academy-backend `
  --region southamerica-east1 `
  --update-env-vars "ALLOWED_ORIGINS=https://arg-academy-frontend-xxxxx-sa.a.run.app"
```

### Error: "container failed to start"

**Síntoma:** El servicio no se inicia.

**Soluciones:**
1. Verifica los logs: `gcloud run services logs read SERVICE_NAME --region southamerica-east1 --limit 100`
2. Asegúrate de que todas las variables de entorno requeridas estén configuradas
3. Verifica que el puerto sea 8080
4. Revisa que DATABASE_URL sea válido

### Frontend muestra "localhost:3000" en producción

**Síntoma:** Las peticiones van a localhost en lugar del backend de producción.

**Causa:** La variable `VITE_API_BASE_URL` no se pasó correctamente durante el build.

**Solución:**
```powershell
# Rebuild del frontend con la variable correcta
cd frontend
docker build --build-arg VITE_API_BASE_URL=https://arg-academy-backend-xxxxx-sa.a.run.app -t arg-academy-frontend .

# Verificar que la variable se embebió correctamente
docker run --rm arg-academy-frontend cat /usr/share/nginx/html/assets/index-*.js | Select-String "arg-academy-backend"

# Si aparece la URL, procede a push y deploy
```

---

## 📊 Costos Estimados

Cloud Run tiene una capa gratuita generosa:
- **2 millones de peticiones/mes gratis**
- **360,000 GB-segundos de memoria gratis/mes**
- **180,000 vCPU-segundos gratis/mes**

Para una aplicación educativa con tráfico moderado, probablemente te mantendrás dentro de la capa gratuita.

---

## 🔐 Mejores Prácticas de Seguridad

### 1. Usar Secret Manager para datos sensibles
```powershell
# Crear secrets
echo -n "TU_DATABASE_URL" | gcloud secrets create DATABASE_URL --data-file=-
echo -n "TU_JWT_SECRET" | gcloud secrets create JWT_SECRET --data-file=-

# Dar permisos al servicio
gcloud secrets add-iam-policy-binding DATABASE_URL `
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" `
  --role="roles/secretmanager.secretAccessor"

# Deploy usando secrets
gcloud run deploy arg-academy-backend `
  --source . `
  --region southamerica-east1 `
  --set-secrets "DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest"
```

### 2. CORS restrictivo
No uses `ALLOWED_ORIGINS=*` en producción. Siempre especifica las URLs exactas.

### 3. Monitoreo
Configura alertas en Google Cloud Console para:
- Errores 5xx
- Alta latencia
- Uso excesivo de recursos

---

## 📚 Recursos Adicionales

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Container Registry Guide](https://cloud.google.com/container-registry/docs)
- [Secret Manager](https://cloud.google.com/secret-manager/docs)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)

---

## ✨ Resumen del Proceso

```
1. Generar JWT_SECRET
2. Deploy Backend → Obtener URL_BACKEND
3. Build Frontend con URL_BACKEND
4. Deploy Frontend → Obtener URL_FRONTEND
5. Actualizar Backend CORS con URL_FRONTEND
6. ¡Listo! 🎉
```
