# 🌟 Elite Blog API - Robust Backend Service

[![CI](https://github.com/<username>/blog-api/actions/workflows/ci.yml/badge.svg)](https://github.com/<username>/blog-api/actions)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Fastify](https://img.shields.io/badge/Fastify-5.x-black?style=flat&logo=fastify)](https://www.fastify.io/)
[![Turso](https://img.shields.io/badge/Turso-SQLite-blue?style=flat&logo=couchbase)](https://turso.tech/)
[![Vitest](https://img.shields.io/badge/Testing-Vitest-yellow?style=flat&logo=vitest)](https://vitest.dev/)

Esta es una API de nivel empresarial diseñada para la gestión de blogs, construida con un enfoque obsesivo en la **velocidad**, **tipado estricto** y **seguridad**.

---

## 🚀 Puntos Clave de Ingeniería (High-Level)

### 1. Arquitectura "Edge-Ready"
Utilizamos **Fastify** para un rendimiento inigualable y **Turso (LibSQL)** para una base de datos SQLite distribuida globalmente. El resultado es una latencia mínima sin sacrificar la consistencia de los datos.

### 2. Seguridad de Grado Industrial
- **Identidad Desacoplada**: Gestión de usuarios vía **Clerk SDK**, eliminando el riesgo de almacenar credenciales localmente.
- **Autorización Vinculada**: Validación estricta de propiedad (`authorId`) en cada operación de escritura, previniendo escalada de privilegios.

### 3. Calidad de Código y Robustez
- **Testing Estratégico**: Cobertura integral con tests Unitarios e Integración usando **Vitest** y el patrón **App Factory**.
- **CI/CD Automatizado**: Pipeline de GitHub Actions que valida tipos, linting y tests en cada Pull Request.
- **Validación con Zod**: Esquemas de datos compartidos entre la API y el cliente para garantizar contratos de datos inmutables.

---

## 🛠️ Tecnologías Utilizadas
- **Runtime**: Node.js 20+
- **Backend**: Fastify v5 (Type Provider Zod)
- **Base de Datos**: Turso (SQLite Edge)
- **ORM**: Drizzle ORM (TypeScript-First)
- **Auth**: Clerk Identity Management
- **Testing**: Vitest & Supertest
- **CI/CD**: GitHub Actions

---

## 📖 Documentación Detallada

Para una referencia exhaustiva de endpoints, lógica de servicios y porqués de la arquitectura, consulta:
👉 [**API_DOCUMENTATION.md**](./API_DOCUMENTATION.md)

---

## 🔧 Setup y Desarrollo

### Requisitos
- Node.js v20+
- Cuenta en Turso y Clerk (Variables de entorno requeridas en `.env`)

### Instalación
```bash
npm install
```

### Base de Datos
```bash
npm run db:push     # Sincroniza esquema con Turso
npm run seed        # Pobla la DB con datos iniciales
```

### Testing
```bash
npm test            # Corre la suite completa (Unit + Integration)
npm run test:coverage # Genera reporte de cobertura
```

---

## 🤖 CI/CD Flow
Cualquier cambio en la rama principal debe pasar por nuestro pipeline de CI:
1. **Lint & Security Check**
2. **Build Check** (Compilación TS)
3. **Unit Tests** (Lógica de Servicios)
4. **Integration Tests** (Contratos de API)

---

> [!NOTE]  
> Este proyecto forma parte de una arquitectura desacoplada diseñada para alimentar frontends modernos como **Astro**.
