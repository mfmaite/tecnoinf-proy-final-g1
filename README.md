# 🛠️ Mentora

Proyecto fullstack (backend + frontend) en desarrollo.

## 🚀 Levantar el Proyecto

### Requisitos

- Docker y Docker Compose instalados en tu sistema
- Node.js y npm instalados en tu sistema
- Java 17 o superior y Maven (si vas a desarrollar el backend)
- Archivo `.env` dentro de la carpeta `backend`. Si no conoces el valor de las variables, pídeselo a algún compañerx.

> ⚠️ _Si no sabes los valores, pregúntale a algún compañero que los tenga._

### Inicializar Backend y Base de Datos
Desde la raíz del proyecto, corre el comando
```bashrc
docker compose up
```
Este comando hace lo siguiente:
* Crea y levanta un contenedor de MySQL (`mentora-db`) con la base mentora_db
* Crea y levanta el backend (`mentora-backend`) con Spring Boot (http://localhost:8080)

### Inicializar Frontend
En una terminal separada, navega a la carpeta `frontend` y ejecuta:
```bashrc
npm install    # Solo la primera vez o cuando se actualicen dependencias
npm run dev
```
Esto levantará el frontend con Next.js en http://localhost:3000

### 💻 Desarrollo de Backend (levantar el proyecto sin Docker)
Si estás desarrollando backend, es más eficiente ejecutarlo localmente para aprovechar el hot-reload y debugging:

1. Primero, levanta solo la base de datos:
```bashrc
docker compose up db
```

2. Actualiza la variable DB_URL con lo siguiente:

```bashrc
DB_URL=jdbc:mysql://localhost:3307/mentora_db
```

3. Carga las variables de entorno:
```bashrc
# En sistemas Unix (Linux/MacOS)
export $(cat backend/.env | xargs)

# En Windows (PowerShell)
Get-Content backend/.env | ForEach-Object { $envItem = $_.Split('='); if ($envItem[0] -and $envItem[1]) { [Environment]::SetEnvironmentVariable($envItem[0], $envItem[1]) } }
```

4. Verifica que las variables se cargaron correctamente:
```bashrc
# En sistemas Unix (Linux/MacOS)
echo $DB_URL  # Debería mostrar jdbc:mysql://localhost:3307/mentora_db

# En Windows (PowerShell)
echo $env:DB_URL

# En Windows (CMD)
echo %DB_URL%
```
Si no ves los valores o son incorrectos, las variables no se cargaron correctamente.

4. Navega a la carpeta `backend` con `cd backend` y ejecuta:
```bashrc
# En sistemas Unix (Linux/MacOS)
./mvnw spring-boot:run

# En Windows
mvnw.cmd spring-boot:run
```

Esto levantará el backend en http://localhost:8080. Si realizas un cambio deberás bajar y volver a levantar el backend, pero será mucho más rápido que tener que realizar el build con Docker.

## 📖 Documentación de endpoints

Todos los endpoints del backend están documentados con Swagger/OpenAPI.

- Acceder a la documentación de Swagger UI: http://localhost:8080/swagger-ui.html
