# 🛠️ Mentora

Proyecto fullstack (backend + frontend) en desarrollo.

## 🚀 Levantar el Proyecto

### Requisitos

- Docker y Docker Compose instalados en tu sistema
- Archivo `.env` dentro de la carpeta `backend` con las siguientes variables:

```
DB_URL=
DB_USERNAME=
DB_PASSWORD=
```

> ⚠️ _Si no sabes los valores, pregúntale a algún compañero que los tenga._

### Inicializar Contenedores
Desde la raíz del proyecto, corre el comando
```bashrc
docker compose up
```
Este comando hace lo siguiente:
* Crea y levanta un contenedor de MySQL (`mentora-db`) con la base mentora_db
* Crea y levanta el backend (`mentora-backend`) con Spring Boot (http://localhost:8080)
* Crea y levanta el frontend (`mentora-frontend`) con Next.js (http://localhost:3000)


## 📖 Documentación de endpoints

Todos los endpoints del backend están documentados con Swagger/OpenAPI.

- Acceder a la documentación de Swagger UI: http://localhost:8080/swagger-ui.html
