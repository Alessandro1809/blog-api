# 🚀 Deployment Guide - Render

Esta guía te ayudará a desplegar tu Blog API en Render sin errores.

---

## 🔍 Problema Común: "Cannot find module"

### Error:
```
Error: Cannot find module '/opt/render/project/src/dist/server.js'
```

### Causa:
Este error ocurre cuando:
1. El directorio `dist` no está siendo generado durante el build
2. La ruta del comando `start` es incorrecta
3. El build command no está configurado correctamente

### ✅ Solución:
Ya hemos configurado el proyecto con `render.yaml` que resuelve este problema.

---

## 📋 Pasos para Desplegar en Render

### 1. **Preparar el Repositorio**

Asegúrate de que los siguientes archivos estén en tu repositorio:

- ✅ `render.yaml` - Configuración de Render
- ✅ `package.json` - Con scripts `build` y `start`
- ✅ `.gitignore` - Debe incluir `dist` y `node_modules`

### 2. **Configurar Variables de Entorno en Render**

Ve a tu servicio en Render Dashboard y configura estas variables:

#### Variables Requeridas:

```bash
# Database (Turso)
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# Authentication (Clerk)
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_JWKS_URL=https://your-app.clerk.accounts.dev/.well-known/jwks.json

# Node Environment
NODE_ENV=production
PORT=10000
```

#### Variables Opcionales:

```bash
# Si usas PostgreSQL en lugar de Turso
DATABASE_URL=postgresql://user:password@host:port/database
```

### 3. **Verificar Configuración de Build**

El archivo `render.yaml` ya está configurado con:

```yaml
buildCommand: npm install && npm run build
startCommand: npm start
```

Esto asegura que:
- Se instalen las dependencias
- Se compile TypeScript a JavaScript en `dist/`
- Se ejecute `node dist/server.js`

### 4. **Desplegar**

#### Opción A: Desde el Dashboard de Render

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub
4. Render detectará automáticamente `render.yaml`
5. Click en "Create Web Service"

#### Opción B: Desde CLI

```bash
# Instalar Render CLI
npm install -g render-cli

# Login
render login

# Desplegar
render deploy
```

### 5. **Verificar el Despliegue**

Una vez desplegado, verifica que todo funcione:

```bash
# Health Check
curl https://your-app.onrender.com/health

# Respuesta esperada:
# {"status":"ok","timestamp":"2025-12-30T18:30:00.000Z"}
```

---

## 🔧 Troubleshooting

### Error: "Build failed"

**Causa:** Errores de TypeScript o dependencias faltantes

**Solución:**
```bash
# Probar build localmente
npm run build

# Si falla, revisar errores de TypeScript
npx tsc --noEmit
```

### Error: "Application failed to respond"

**Causa:** El servidor no está escuchando en el puerto correcto

**Solución:** Verifica que `server.ts` use `process.env.PORT`:
```typescript
const port = Number(process.env.PORT) || 51214;
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
```

### Error: "Database connection failed"

**Causa:** Variables de entorno mal configuradas

**Solución:**
1. Verifica que `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` estén configuradas
2. Prueba la conexión localmente con las mismas credenciales
3. Revisa los logs en Render Dashboard

### Error: "Clerk authentication failed"

**Causa:** JWKS URL o claves incorrectas

**Solución:**
1. Verifica que `CLERK_JWKS_URL` termine en `/.well-known/jwks.json`
2. Confirma que `CLERK_SECRET_KEY` sea la correcta
3. Revisa que el dominio de Clerk coincida con tu configuración

---

## 📊 Monitoreo Post-Despliegue

### Logs en Tiempo Real

```bash
# Desde Render Dashboard
Dashboard → Tu Servicio → Logs
```

### Métricas Importantes

- **Response Time:** Debe ser < 500ms para la mayoría de requests
- **Memory Usage:** Monitorea que no exceda el límite del plan
- **CPU Usage:** Picos normales durante builds, bajo en runtime

### Health Checks

Render automáticamente verificará `/health` cada 30 segundos. Si falla 3 veces consecutivas, reiniciará el servicio.

---

## 🎯 Checklist de Despliegue

Antes de hacer push a producción:

- [ ] ✅ Build local exitoso (`npm run build`)
- [ ] ✅ Tests pasando (`npm test`)
- [ ] ✅ Variables de entorno configuradas en Render
- [ ] ✅ `render.yaml` en el repositorio
- [ ] ✅ `dist/` en `.gitignore`
- [ ] ✅ Health check endpoint funcionando
- [ ] ✅ CORS configurado para tu dominio frontend
- [ ] ✅ Database migrations aplicadas (si aplica)

---

## 🔐 Seguridad en Producción

> [!WARNING]
> Nunca commitas archivos `.env` al repositorio. Usa las variables de entorno de Render.

> [!IMPORTANT]
> Configura CORS correctamente para permitir solo tu dominio frontend en producción.

> [!CAUTION]
> Revisa que todas las claves de Clerk sean las de producción, no las de test.

---

## 📚 Recursos Adicionales

- [Render Docs - Node.js](https://render.com/docs/deploy-node-express-app)
- [Turso Docs - Production Best Practices](https://docs.turso.tech/introduction)
- [Clerk Docs - Production Checklist](https://clerk.com/docs/deployments/overview)

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs en Render Dashboard
2. Verifica que el build local funcione
3. Confirma que todas las variables de entorno estén configuradas
4. Consulta la documentación de Render para tu caso específico
