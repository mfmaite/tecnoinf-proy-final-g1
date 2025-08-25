# 🛠️ Mentora

Proyecto fullstack (backend + frontend) en desarrollo.

---

## 🚀 Cómo levantar el backend

### Requisitos

- Java 21 (o la versión configurada en el proyecto)
- Maven (puedes usar el wrapper incluido `./mvnw`)
- MySQL corriendo en tu sistema
- Archivo `.env` dentro de la carpeta `backend` con las siguientes variables:

```
DB_URL=
DB_USER=
DB_PASSWORD=
```

> ⚠️ _Si no sabes los valores, pregúntale a algún compañero que los tenga._

### Usando el wrapper de Maven

Para compilar y ejecutar:

```basrc
./mvnw spring-boot:run
```

- Spring Boot cargará automáticamente las variables del `.env` usando dotenv.
- La aplicación se levantará en http://localhost:8080 por defecto.

### Compilar y generar el jar

```
./mvnw clean install
```

- Esto compila el proyecto y ejecuta los tests.
- Genera un archivo jar en `target/backend-0.0.1-SNAPSHOT.jar`.

📖 Documentación de endpoints

Todos los endpoints del backend están documentados con Swagger/OpenAPI.

- Acceder a la documentación de Swagger UI: http://localhost:8080/swagger-ui.html
