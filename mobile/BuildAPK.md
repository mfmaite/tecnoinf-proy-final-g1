## Generar APK con Expo (EAS)

### Requisitos previos

1. Tener instalado Node.js (versión LTS recomendada)

2. Instalar la CLI de Expo

```bashrc
    npm install -g expo-cli
```

3. Instalar la CLI de EAS

```bashrc
    npm install -g eas-cli
```

4. Iniciar sesión en Expo

```bashrc
    eas login
```

### 1. Configurar el proyecto para builds nativas

Ejecutar una única vez:

```bashrc
    eas build:configure
```

Esto genera el archivo eas.json en la raíz del proyecto.

### 2. Configurar el tipo de build en eas.json

Asegurarse de tener la siguiente configuración mínima:

```bashrc
{
  "cli": {
    "version": ">= 8.0.0"
  },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

apk: instalación directa en dispositivos Android (ideal para pruebas)

aab: formato requerido para publicar en Google Play

### 3. Generar el APK

```bashrc
    eas build --platform android --profile preview
```

Este comando compila el APK en la nube. La build tarda varios minutos.

### 4. Descargar el APK

Una vez finalizada la build, Expo mostrará un QR y una URL desde la cual descargar el archivo .apk

### Se pueden listar builds anteriores con

```bashrc
    eas build:list
```

### Generar y configurar `google-services.json` (Firebase)

Es necesario generar el archivo `google-services.json` para manejar las notificaciones push en Android.

#### 1. Crear proyecto en Firebase

1. Ingresar a https://console.firebase.google.com
2. Crear un proyecto nuevo o usar uno existente.
3. Agregar una aplicación Android al proyecto.
4. Ir a la configuración del proyecto
5. Ir a service accounts
6. Apretar en el botón que dice "generar nueva clave"
7. Firebase generará un archivo con un nombre largo y raro
   Ese archivo lo usaremos para configurar las credenciales en eas, guardarlo en la raíz de mobile para mejor acceso.
   Solo será usado para la configuración inicial, luego lo podemos poner en otro lado fuera del proyecto igual o agregarlo al gitignore. No se comparte.

#### 2. Inicializar el proyecto eas

1. Parados en mobile correr

```bashrc
eas whoami
```

para verificar que estás con tu user, sino eas login

2. Correr

```bashrc
eas init
```

para inicializar el proyecto como uno de eas

3. Correr

```bashrc
eas build:configure
```

Seleccionar build all para crear eas.json con su configuración base

4. Correr

```bashrc
eas credentials
```

Para configurar las credenciales de google service account para las notificaciones push.
Vamos a configurar production y preview. Production da un .abb y preview un .apk
Al primero le vamos a crear una nueva service key, para el segundo podemos seleccionar la ya creada. 5. Seleccionamos la opción que menciona push notifications 6. Seleccionar Set up a Google Service Account Key for Push Notifications (FCM V1) 7. Upload a new service account key for this app 8. Especificar la ruta al archivo que nos dio firebase 9. Listo, se puede cerrar nomas.

### 4. Conectamos firebase con la aplicación android

1. Volvemos a firebase y vamos a seleccionar android dentro de apps
2. Tenemos que especificar el nombre de la app, que es el nombre que está en "package" en app.json.
3. Vamos a precisar un keystore que se genera cuando hacemos build al proyecto por primera vez. Se hace al principio así que podemos darle build y luego cancelar casi enseguida.
4. Precisamos el keystore SHA-1
5. Darle siguiente
6. Ahora descargamos google-services.json
7. Siguiente y siguiente hasta que diga continuar a consola
8. Agregar el path a google-services.json

Por ejemplo:

```bashrc
 android: {
    ...config.android,
    package: "com.mentora.mobile",
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png"
    }
  }
```

#### 3. Decidir qué hacer con google-services.json

## 1. Guardarlo local

Guardar este archivo localmente.
Agregarlo a .gitignore y .easignore

## 2. Cargarlo como secret en expo por línea de comando

Crear la variable `GOOGLE_SERVICES_JSON` y subir `google-services.json`

Para que EAS incluya el archivo `google-services.json` en la compilación sin almacenarlo en el repositorio, es necesario cargarlo como un secret en Expo.

1. Obtener el contenido del archivo

Una vez descargado desde Firebase, abrir el archivo google-services.json

2. Crear el secret en EAS

Ejecutar el siguiente comando para copiar todo el contenido del archivo en la variable:

```bashrc
    eas secret:create --name GOOGLE_SERVICES_JSON --value "$(cat google-services.json)"
```

Esto creará una variable de entorno llamada GOOGLE_SERVICES_JSON que contendrá el contenido completo del archivo.

3. Para confirmar que la variable de entorno se creó correctamente podemos verificar con

```bashrc
    eas secret:list
```

Y debe aparecer listada la variable de entorno que recién creamos.

4. Usarla de la siguiente forma si no eliminamos el archivo local. En app.config.js o app.json:

```bashrc
    {
    "expo": {
        "android": {
            googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
            }
        }
    }
```

EAS utilizará la variable GOOGLE_SERVICES_JSON para generar automáticamente el archivo físico durante la build.

## 2. Cargarlo a través del dashboard de expo.dev

1. Entrar a expo.dev
2. Loguearse
3. Seleccionar nuestra app
4. Ir a variables de entorno
5. Seleccionar agregar nueva
6. Cargar los contenidos del archivo como texto, seleccionar para preview y production
7. Guardar

#### 4. Configurar las credenciales para las notificaciones push

```bashrc
eas credentials
```

Y seleccionar Android para configurar las credenciales de Android.

#### 5. Para comenzar con la build correr:

```bashrc
eas build --platform android --profile preview
```

### Consideraciones

1. El package name debe coincidir en Firebase y en el proyecto, de lo contrario las notificaciones no funcionarán.

2. Si se cambia el package name, es necesario generar un nuevo google-services.json.

3. Sin este archivo, cualquier integración con Firebase fallará en la build o en tiempo de ejecución.
