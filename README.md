# Instalación de SGA WCP

Este repositorio contiene cinco componentes independientes que trabajan juntos:

| Componente | Carpeta | Tecnología |
| --- | --- | --- |
| Backend compartido | `SGA-CD-FASTAPI-BACKEND` | FastAPI / Python |
| Modelos y migraciones de base de datos | `SGA-CD-DB.git` | SQLAlchemy / Alembic |
| Frontend web | `SGA-CD-WEB.git` | HTML / CSS / JavaScript |
| Frontend móvil | `SGA-CD-APK.git` | Flet / Python |
| Frontend de escritorio | `SGA-CD-APP.git` | Flet / Python |

## Corrección del despliegue en Netlify

El despliegue del 5 de octubre de 2026 falló en la etapa `building site` con
código 2. La configuración del proyecto seleccionaba `hugo` y el directorio
`public`, pero este repositorio no contiene un proyecto Hugo. El archivo
`netlify.toml` selecciona ahora la carpeta del frontend web como directorio
base y de publicación, sin comando de construcción ni dependencias Python.
La configuración del archivo prevalece sobre esos ajustes del panel.

Netlify publica solamente el frontend web. No ejecuta el servidor FastAPI
ni genera o ejecuta los clientes móviles o de escritorio. Las otras cuatro
carpetas se conservan como componentes del sistema, no como archivos públicos.

La configuración actual `SGA-CD-WEB.git/js/config.js` apunta a
`http://localhost:8000` para desarrollo. Antes de utilizar el sitio en
producción, configura una URL HTTPS pública del backend y permite el origen
del sitio en la configuración CORS del servidor. No pongas credenciales en
ese archivo. Publicar el HTML no instala el backend ni hace funcionar por sí
solo el inicio de sesión, los registros o el contenido obtenido de la API.

## Instalación por componente

Utiliza Python 3.12 (también se admiten 3.10 y 3.11), con `venv` y `pip`.
En distribuciones Linux que separan `venv`, instala primero el paquete
correspondiente a tu versión de Python mediante el gestor del sistema.

Desde la raíz del repositorio:

```bash
python3.12 scripts/install.py all
```

También puedes instalar solo un componente:

```bash
python3.12 scripts/install.py database
python3.12 scripts/install.py backend
python3.12 scripts/install.py desktop
python3.12 scripts/install.py mobile
python3.12 scripts/install.py web
```

En Windows, utiliza `py -3.12` en lugar de `python3.12`. Cada componente
Python obtiene su propio directorio `.venv`, ignorado por Git. El instalador
instala el paquete de modelos tanto en el entorno de la base de datos como
en el del backend desde una copia temporal para no generar archivos de
empaquetado en el repositorio, y ejecuta `pip check`. No inicializa bases de datos,
ejecuta migraciones, crea usuarios ni lee o modifica credenciales.

`constraints.txt` fija versiones de Flet y LangChain que conservan las APIs
antiguas utilizadas por el proyecto, como `ft.colors`, `ft.icons`,
`Page.session` y `langchain_core.pydantic_v1`. Actualizar esas bibliotecas
a nuevas versiones mayores requiere una migración del código; instalar
indiscriminadamente la última versión no es una instalación compatible.
Las importaciones actuales del backend se mantienen conforme a `AGENTS.md`.

El motor nativo opcional del cliente móvil se instala con:

```bash
python3.12 scripts/install.py mobile --local-model
```

Esta opción incluye `llama-cpp-python` y puede necesitar CMake, compilador
C/C++ y dependencias de la plataforma. No se requiere para los proveedores
remotos. La instalación de dependencias no genera un APK ni un ejecutable
de escritorio; esos paquetes requieren el entorno nativo de destino.

## Ejecución del backend

Configura las variables de entorno requeridas por
`SGA-CD-FASTAPI-BACKEND/app/core/config.py` mediante un mecanismo seguro.
No reutilices secretos de ejemplo ni los publiques en el frontend.
Desde `SGA-CD-FASTAPI-BACKEND`, ejecuta el Python del entorno del backend:

```bash
.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

En Windows, el ejecutable equivalente es `.venv\Scripts\python.exe`.
Los modelos y las migraciones siguen perteneciendo a `SGA-CD-DB.git`.
Su instalación como paquete no configura ni aprovisiona una base de datos.
No ejecutes los inicializadores existentes contra producción sin revisar
su comportamiento y disponer de una copia de seguridad.

Para usar los entornos de los clientes, entra en su carpeta y ejecuta
`.venv/bin/python main.py` (en Windows, `.venv\Scripts\python.exe main.py`).
La comprobación de dependencias no sustituye las pruebas de interfaz,
conectividad con la API, configuración de proveedores o integración.

## Validaciones y limitaciones

Las pruebas del instalador se ejecutan sin conexiones a servicios ni
instalaciones de paquetes:

```bash
python3.12 -m unittest discover -s tests -v
```

Durante la verificación se instalaron los cuatro entornos Python y todos
pasaron `pip check`. Se comprobó la importación del paquete de modelos y
de las dependencias del backend sin cambiar sus importaciones actuales.

Los clientes móvil y de escritorio conservan un error de código en
`utils/theme.py`: pasan `custom_colors` al constructor `ft.Theme`, que no
admite ese argumento en la versión instalada. Este problema de ejecución
no es un conflicto de instalación y requiere corregir ambos temas antes
de iniciar sus interfaces. No se modificaron los temas, se desplegó el
backend, se ejecutaron migraciones ni se generaron paquetes nativos.
