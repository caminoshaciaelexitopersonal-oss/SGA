# Arquitectura del Frontend - SGA-CD-WEB

Este documento describe la arquitectura de la aplicación de frontend, sus componentes principales y cómo interactúan entre sí y con el backend.

## 1. Visión General

La aplicación es una **Single-Page Application (SPA)** que se ejecuta completamente en el navegador del cliente. Está construida con HTML, CSS y JavaScript "vanilla" (puro), sin depender de frameworks externos como React o Vue.

La lógica principal se divide en varios archivos JavaScript, cada uno con una responsabilidad clara, que manipulan el DOM de dos páginas principales: `login.html` y `app.html`.

## 2. Componentes Principales

*   **`login.html`**: El punto de entrada para la autenticación. Contiene el formulario de inicio de sesión tradicional y los botones para el flujo de OAuth con redes sociales.
*   **`app.html`**: El contenedor principal de la aplicación una vez que el usuario está autenticado. Contiene una barra lateral de navegación y un área de contenido principal que se actualiza dinámicamente.
*   **`js/config.js`**: Archivo de configuración central que define la URL base de la API del backend.
*   **`js/auth.js`**: Maneja el flujo de autenticación basado en contraseña.
*   **`js/oauth.js`**: Maneja el flujo de autenticación social.
*   **`js/i18n.js`**: Gestiona la internacionalización (traducción) de la interfaz.
*   **`js/app.js`**: Es el orquestador principal de la aplicación. Protege la ruta `app.html`, obtiene los datos del usuario, y coordina la renderización de la navegación y las vistas.
*   **`js/navigation.js`**: Define la estructura del menú de navegación para cada rol y lo renderiza en la barra lateral.
*   **`js/views.js`**: Actúa como un "enrutador" del lado del cliente. Contiene la lógica para renderizar cada vista específica (ej. "Gestionar Usuarios", "Gamificación") en el área de contenido principal, incluyendo la obtención de datos de la API.
*   **`lang/`**: Directorio que contiene los archivos JSON con las traducciones.

## 3. Diagrama de Flujo de la Arquitectura

El siguiente diagrama (creado con sintaxis de Mermaid) ilustra el flujo de datos y la interacción entre los componentes.

```mermaid
graph TD
    subgraph "Navegador del Usuario"
        U[Usuario]
        direction LR
    end

    subgraph "Frontend (SGA-CD-WEB)"
        L(login.html)
        A(app.html)
        JS_Auth(auth.js / oauth.js)
        JS_App(app.js)
        JS_Nav(navigation.js)
        JS_Views(views.js)
        JS_i18n(i18n.js)
        JSON(lang/*.json)
    end

    subgraph "Backend (SGA-CD-FASTAPI)"
        API[/api/...]
    end

    U --> L
    L -- Credenciales --> JS_Auth
    JS_Auth -- Petición de Token --> API
    API -- Token JWT --> JS_Auth
    JS_Auth -- Redirige --> A

    U --> A
    A -- Carga Inicial --> JS_App
    JS_App -- Pide Datos de Usuario --> API
    API -- Datos (incl. Rol) --> JS_App
    JS_App --> JS_Nav
    JS_Nav -- Renderiza Menú en --> A

    JS_App --> JS_i18n
    JS_i18n --> JSON
    JS_i18n -- Traduce UI --> A

    A -- Click en Menú --> JS_App
    JS_App -- Solicita Vista --> JS_Views
    JS_Views -- Pide Datos del Módulo --> API
    API -- Datos del Módulo --> JS_Views
    JS_Views -- Renderiza Contenido en --> A
```

### Explicación del Diagrama:

1.  **Flujo de Login:** El usuario interactúa con `login.html`. La lógica en `auth.js` u `oauth.js` se comunica con la API del backend para obtener un token JWT. Una vez obtenido, el usuario es redirigido a `app.html`.
2.  **Flujo Principal de la App:**
    *   Al cargar `app.html`, `app.js` toma el control.
    *   Verifica si el usuario está autenticado.
    *   Pide a la API los datos del usuario, incluyendo su rol.
    *   Usa `navigation.js` para construir y mostrar el menú lateral según el rol.
    *   Usa `i18n.js` para traducir la interfaz.
3.  **Flujo de Navegación de Vistas:**
    *   El usuario hace clic en una opción del menú en `app.html`.
    *   `app.js` detecta el clic y le pide a `views.js` que renderice la vista correspondiente.
    *   `views.js` se encarga de obtener los datos específicos de esa vista desde la API del backend y los muestra en el área de contenido de `app.html`.
