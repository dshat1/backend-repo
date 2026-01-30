# Docker Image

## Proyecto Backend

API REST con Express y MongoDB.

## Quick Start (Docker)

Imagen en Docker Hub: https://hub.docker.com/r/demenosdocker/backend-project-api

Construir localmente:

```bash
docker build -t demenosdocker/backend-project-api:latest .
```

Ejecutar (usando `.env` del proyecto):

```bash
docker run -p 8080:8080 --env-file .env demenosdocker/backend-project-api:latest
```

Probar la imagen desde Docker Hub:

```bash
docker pull demenosdocker/backend-project-api:latest
docker run -p 8080:8080 --env-file .env demenosdocker/backend-project-api:latest
```

## Variables de entorno requeridas

- `MONGO_URI` o `MONGO_URI_SRV` (conexión a MongoDB Atlas)
- `JWT_SECRET`

No incluyas `.env` en la imagen; usa `--env-file` o secrets en producción.

## Endpoints importantes

- Swagger (Users): `/api/docs`
- Endpoints de ejemplo añadidos: `/api/adoptions` (CRUD)

## Tests

Ejecutar tests funcionales:

```bash
npm install
npm test
```

## CI / Docker Hub

Incluye workflow GitHub Actions en `.github/workflows/docker-publish.yml` que construye y publica la imagen `demenosdocker/backend-project-api` cuando se hace push a `main`.

Tag / Release actual: `v1.0.0` (entrega final).

## Seguridad

- No subir credenciales ni `.env` al repositorio.
- Usa GitHub Secrets `DOCKERHUB_USERNAME` y `DOCKERHUB_TOKEN` para la publicación automática.

## Notas

- Añadí router de ejemplo `src/routes/adoption.router.js` y tests en `test/adoption.test.cjs`.
- `src/config/db.js` se actualizó para reintentos y logging mejorado.
