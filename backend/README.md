# Mentora

Proyecto backend desarrollado con **Spring Boot**.

Este proyecto sigue una estructura organizada para RESTful APIs, separando modelos, controladores y servicios.


## Estructura de carpetas

- **Modelos (`model/`)**: Contienen las clases que representan los datos, por ejemplo `Greeting.java`.
- **Controladores (`controller/`)**: Manejan las rutas HTTP y devuelven datos en JSON.
- **Servicios (`service/`)**: Contienen la lógica de negocio separada del controlador (opcional).

## Cómo ejecutar el proyecto

### Usando el wrapper de Maven incluido (`./mvnw`)

Este proyecto incluye un **Maven Wrapper**, que permite ejecutar Maven sin necesidad de instalarlo globalmente en tu sistema.

Para compilar y ejecutar:

```bash
./mvnw spring-boot:run
```

Esto levanta la aplicación Spring Boot en http://localhost:8080 por defecto.
