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

## 🌱 Seed de Datos

El proyecto incluye un seed automático que crea usuarios de prueba al iniciar la aplicación. Este seed se ejecuta automáticamente cada vez que levantas el backend y solo crea los objetos si aún no existen en la base de datos.

### Usuarios creados automáticamente:

1. **Admin**: `admin@mentora.com` / `admin123` (CI: 11111111)
2. **Profesor**: `profesor@mentora.com` / `profesor123` (CI: 22222222)
3. **Estudiante**: `estudiante@mentora.com` / `estudiante123` (CI: 33333333)

## 🧪 Probar Autenticación (Endpoints de Test)

El backend incluye endpoints de prueba para verificar que la autenticación JWT funcione correctamente:

### Endpoints disponibles:

1. **`GET /test/public`** - Público (no requiere autenticación)
   - Útil para verificar que el servidor está funcionando

2. **`GET /test/protected`** - Requiere autenticación
   - Funciona con cualquier usuario autenticado
   - Devuelve información del usuario logueado

3. **`GET /test/admin`** - Solo ADMIN
   - Requiere rol de administrador

4. **`GET /test/profesor`** - Solo PROFESOR
   - Requiere rol de profesor

5. **`GET /test/estudiante`** - Solo ESTUDIANTE
   - Requiere rol de estudiante

6. **`GET /test/admin-or-profesor`** - ADMIN o PROFESOR
   - Funciona con cualquiera de estos dos roles

### Cómo probar en Postman:

1. **Login**: `POST http://localhost:8080/auth/login`
   ```json
   {
       "ci": "11111111",
       "password": "admin123"
   }
   ```
   Copia el token de la respuesta.

2. **Usar endpoints protegidos**: Agrega el token en Authorization → Bearer Token

3. **Probar diferentes roles**: Haz login con diferentes usuarios del seed y prueba los endpoints específicos de cada rol.

## 📝 Notas

- Se recomienda usar DTOs para las peticiones y respuestas de la API
- Los errores de validación se manejan con mensajes claros dependiendo del campo faltante
- Separa siempre la lógica de negocio (service) del controlador
