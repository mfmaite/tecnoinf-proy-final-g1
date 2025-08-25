🖥️ Backend - Mentora

Backend desarrollado con Spring Boot para la API REST del proyecto Mentora.

## 📁 Estructura de carpetas

- Modelos (model/): Clases que representan los datos (Greeting.java, User.java, etc.)
- Controladores (controller/): Manejan rutas HTTP y devuelven JSON
- Servicios (service/): Contienen la lógica de negocio
- Repository (repository/): Interfaces que extienden JpaRepository para acceso a la base de datos
- Resources (src/main/resources/): Archivos de configuración (application.properties)

### 📌 Swagger/OpenAPI

- Todos los endpoints están documentados en Swagger UI.
- Para acceder a la documentación mientras el backend está corriendo:

http://localhost:8080/swagger-ui.html

- Desde ahí puedes ver los endpoints, parámetros, request y response.

Todos los endpoints devuelven respuestas usando `ResponseDTO`:

- success: boolean
- message: string
- code: número de estado HTTP
- data: objeto (para GETs)

## 📝 Notas

- Se recomienda usar DTOs para las peticiones y respuestas de la API
- Los errores de validación se manejan con mensajes claros dependiendo del campo faltante
- Separa siempre la lógica de negocio (service) del controlador
