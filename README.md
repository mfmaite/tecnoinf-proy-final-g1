# 🛠️ Mentora

Proyecto fullstack (backend + frontend) en desarrollo.

## 🚀 Levantar el Proyecto

### Requisitos

- Docker y Docker Compose instalados en tu sistema
- Node.js y npm instalados en tu sistema
- Java 17 o superior y Maven (si vas a desarrollar el backend)
- Archivo `.env` dentro de la carpeta `backend` con las siguientes variables:

```
DB_URL=
DB_USERNAME=
DB_PASSWORD=
```

> ⚠️ _Si no sabes los valores, pregúntale a algún compañero que los tenga._

### Inicializar el Proyecto con Docker
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

### 💻 Desarrollo de Backend (sin Docker)
Si estás desarrollando backend, es más eficiente ejecutarlo localmente para aprovechar el hot-reload y debugging:

1. Primero, levanta solo la base de datos:
```bashrc
docker compose up db
```

2. Carga las variables de entorno:
```bashrc
# En sistemas Unix (Linux/MacOS)
export $(cat .env | xargs)

# En Windows (PowerShell)
Get-Content backend/.env | ForEach-Object { $envItem = $_.Split('='); if ($envItem[0] -and $envItem[1]) { [Environment]::SetEnvironmentVariable($envItem[0], $envItem[1]) } }
```

3. Verifica que las variables se cargaron correctamente:
```bashrc
# En sistemas Unix (Linux/MacOS)
echo $DB_URL
echo $DB_USERNAME
echo $DB_PASSWORD

# En Windows (PowerShell)
echo $env:DB_URL
echo $env:DB_USERNAME
echo $env:DB_PASSWORD

# En Windows (CMD)
echo %DB_URL%
echo %DB_USERNAME%
echo %DB_PASSWORD%
```
Deberías ver los valores que están en tu archivo `.env`. Si no ves los valores, las variables no se cargaron correctamente.

4. En una terminal separada, navega a la carpeta `backend` y ejecuta:
```bashrc
# En sistemas Unix (Linux/MacOS)
./mvnw spring-boot:run

# En Windows
mvnw.cmd spring-boot:run
```

Esto levantará el backend en http://localhost:8080 con hot-reload activado. Los cambios en el código se aplicarán automáticamente al guardar.

### 🔄 Actualizar después de cambios

#### Cambios en el Backend con Docker
Cuando hagas cambios en el código del backend y estés usando Docker, necesitas:
1. Detener los contenedores:
```bashrc
docker compose down
```
2. Reconstruir la imagen y levantar los contenedores:
```bashrc
docker compose up --build
```

#### Cambios en el Backend sin Docker
Los cambios se aplican automáticamente gracias al hot-reload de Spring Boot. Si agregaste nuevas dependencias en el `pom.xml`, necesitarás reiniciar la aplicación.

#### Cambios en el Frontend
Los cambios en el frontend se aplican automáticamente gracias al hot-reload de Next.js. Si agregaste nuevas dependencias, necesitarás ejecutar `npm install` nuevamente.


## 📖 Documentación de endpoints

Todos los endpoints del backend están documentados con Swagger/OpenAPI.

- Acceder a la documentación de Swagger UI: http://localhost:8080/swagger-ui.html
