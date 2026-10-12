# INFORME DE AUDITORÍA INTEGRAL DESDE CERO — SISTEMA ESTUDIANTIL, CULTURAL Y DEPORTIVO (SGA-CD)
**Candidato bajo evaluación:** Visión 0.1
**Tipo de Trabajo:** Auditoría técnica, funcional, arquitectónica, de seguridad, multiinquilino y preparación para producción.
**Modo de Ejecución:** Solo Lectura (Read-Only)
**Fecha de Evaluación:** 12 de Octubre de 2026
**Auditor Responsable:** Jules (Arquitecto Principal / Auditor DevSecOps Independiente)

---

## A. RESUMEN EJECUTIVO

### 1. Estado Real del Sistema
El Sistema Estudiantil, Cultural y Deportivo (SGA-CD) se encuentra actualmente en un estado **Parcialmente Implementado y en Fase Pre-Alfa de Desarrollo**, presentando discrepancias críticas entre la documentación/reportes de auditorías anteriores y la realidad del código fuente.

Si bien la arquitectura base con **FastAPI**, **SQLAlchemy** y **Pydantic v2** se encuentra bien estructurada y la interfaz web (**SGA-CD-WEB**) posee pantallas funcionales para múltiples roles, **el sistema NO ESTÁ LISTO PARA PRODUCCIÓN**. Existen bloqueadores de seguridad severos, aislamiento multiinquilino incompleto con IDs harcodeados en endpoints clave, e inconsistencias en la resolución de roles.

### 2. Principales Fortalezas Verificadas
1. **Modelado ORM Sólido y Modular:** En `SGA-CD-DB.git/models/`, las entidades de usuarios, inquilinos, inventario, lo académico, escenarios y facturación cuentan con restricciones de clave foránea y relaciones ORM estándar bien definidas.
2. **Jerarquía Operativa de Agentes IA:** La jerarquía militar de agentes LangGraph (Coroneles, Capitanes, Tenientes y Sargento Base) está implementada en código tanto en el backend como en los clientes Flet (`APP` y `APK`).
3. **Control de Acceso basado en JWT:** Se emite y valida adecuadamente la estructura del JWT conteniendo `sub`, `roles` e `inquilino_id`.
4. **Protección Anti-Hijacking en Sesiones de Agentes:** El endpoint `/api/v1/agent/invoke` calcula e impone un `thread_id` aislado en el servidor con el formato `tenant_{inquilino_id}:user_{user_id}:session_{sanitized}`, previniendo el acceso cruzado a conversaciones.

### 3. Inconsistencias Críticas y Bloqueadores
1. **Hardcoding de `inquilino_id = 1` (Aislamiento Multiinquilino Vulnerado):**
   Múltiples endpoints en `SGA-CD-FASTAPI-BACKEND/app/api/v1/endpoints/` (`eventos.py`, `inventory.py`, `curriculum.py`, `procesos.py`, `gamificacion.py`) tienen asignado explícitamente `tenant_id = 1` de forma fija, ignorando el `current_user.inquilino_id` del usuario autenticado.
2. **Desconexión Módulo-Base de Datos:**
   El archivo `formacion.db` en la raíz (usado por `agent.py`) está completamente vacío (0 bytes). Los agentes de IA en el backend apuntan a este archivo local desvinculado de la base de datos principal SQLite/PostgreSQL.
3. **Discrepancia entre Roles ORM (`user.roles`) y Columna Enum (`user.rol`):**
   La consulta de autenticación `get_user_by_username` lee de las tablas `roles` y `user_roles`. Si un usuario nuevo se crea vía `create_user`, el campo Enum `rol` y la relación `roles` pueden desincronizarse si no se ejecutan las semillas de la tabla `roles`.
4. **Ausencia del Módulo Cultural "Ferias":**
   El requerimiento funcional para "Ferias Culturales" no posee modelos, tablas, CRUD ni endpoints en ninguno de los repositorios.
5. **Simulación de Vistas Web y Faltantes de Backend:**
   En `SGA-CD-WEB.git`, varias interfaces (e.g. `tecnico_area.js`, `jefe_area.js`) realizan llamadas a endpoints inexistentes como `/api/v1/disciplinas`, `/api/v1/jefe_area/staff` y `/api/v1/jefe_area/events`, recibiendo errores HTTP 404.

### 4. Dictamen General
**NO APROBADO PARA PRODUCCIÓN.**
Se requiere ejecutar un plan de remediación estructurado por fases para resolver las vulnerabilidades multiinquilino, corregir las rutas harcodeadas, conectar la persistencia de los agentes y completar las API faltantes.

---

## B. INVENTARIO DE REPOSITORIOS Y ESTADO GIT

Todas las inspecciones fueron ejecutadas en la rama activa. Se confirmó que todo el proyecto reside en un único repositorio Git unificado en la raíz del entorno, el cual alberga las carpetas de los sub-componentes.

| Repositorio / Carpeta | Rama Activa | Commit Hash Actual | Último Commit (Mensaje y Fecha) | Estado Git (`git status`) | Estado Git Diff (`git diff --check`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Raíz (SGA-CD)** | `jules-1132435...` | `47cd57366682788b111e30caf086e5f1f587bda9` | Merge pull request #50 from caminoshaciaelexitopersonal-oss/feature/sgacd-vision-0.1-production-prep | Clean (Sin cambios pendientes) | Limpio (0 errores de espacios/sintaxis) |
| **SGA-CD-FASTAPI-BACKEND** | `jules-1132435...` | `47cd57366682788b111e30caf086e5f1f587bda9` | (Compartido con la raíz) | Clean | Limpio |
| **SGA-CD-APP.git** | `jules-1132435...` | `47cd57366682788b111e30caf086e5f1f587bda9` | (Compartido con la raíz) | Clean | Limpio |
| **SGA-CD-APK.git** | `jules-1132435...` | `47cd57366682788b111e30caf086e5f1f587bda9` | (Compartido con la raíz) | Clean | Limpio |
| **SGA-CD-WEB.git** | `jules-1132435...` | `47cd57366682788b111e30caf086e5f1f587bda9` | (Compartido con la raíz) | Clean | Limpio |
| **SGA-CD-DB.git** | `jules-1132435...` | `47cd57366682788b111e30caf086e5f1f587bda9` | (Compartido con la raíz) | Clean | Limpio |

**Contraste con antecedente Visión 0.1 (`717503d`):**
El commit `717503d` reportado en auditorías previas fue integrado exitosamente en el historial del repositorio principal a través de la Pull Request #50, consolidando el hash `47cd573`. No existen archivos sin seguimiento o modificados fuera de commit.

---

## C. MAPA ARQUITECTÓNICO REAL DEL SISTEMA

```
SGA-CD/
├── SGA-CD-FASTAPI-BACKEND/         # Servidor Backend ASGI FastAPI
│   ├── app/
│   │   ├── api/                    # Endpoints REST (v1)
│   │   │   ├── deps.py             # Dependencias de Auth y DB
│   │   │   └── v1/endpoints/       # admin, agent, alumnos, auth, eventos, escenarios, etc.
│   │   ├── agents/                 # Jerarquía LangGraph de Agentes
│   │   │   ├── corps/              # Coroneles (Cultura, Deportes, Ventas)
│   │   │   └── units/              # Capitanes, Tenientes y Sargento Base
│   │   ├── core/                   # Configuración de variables y seguridad JWT
│   │   ├── crud/                   # Capa de persistencia y consultas ORM
│   │   └── models/                 # Importación de modelos desde DB
│   └── tests/                      # Suites de pruebas automáticas
├── SGA-CD-DB.git/                  # Definición Central de Base de Datos y Modelos
│   ├── alembic/                    # Migraciones de estructura DB
│   ├── models/                     # Modelos SQLAlchemy (user, academic, tenancy, billing, etc.)
│   └── sga_cd_main.db              # Base de Datos SQLite Central
├── SGA-CD-WEB.git/                 # Cliente Web Vanilla JS SPA
│   ├── index.html / app.html       # Estructura e interfaz principal
│   ├── js/
│   │   ├── config.js               # Configuración de API Base URL
│   │   ├── auth.js / main.js       # Controladores de sesión
│   │   └── views/                  # Vistas JS por rol de usuario
└── SGA-CD-APP.git / SGA-CD-APK.git # Clientes Flet Desktop y Móvil (Duplicados estructuralmente)
    ├── agent / agents / tools      # Copia local de agentes e integración
    ├── database / utils / views    # Vistas Flet y sincronizador offline
    └── main.py                     # Punto de entrada de la aplicación
```

---

## D. MATRIZ DE INCONSISTENCIAS Y HALLAZGOS

| ID | Gravedad | Categoría | Archivo y Ubicación | Comportamiento Observado | Comportamiento Esperado | Impacto | Corrección Recomendada |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **INC-01** | **CRÍTICA** | Seguridad / Multiinquilino | `app/api/v1/endpoints/eventos.py` (Línea 20)<br>`inventory.py` (Líneas 22, 51)<br>`curriculum.py` (Línea 22)<br>`procesos.py` (Línea 20)<br>`gamificacion.py` (Línea 58) | `tenant_id = 1` se encuentra harcodeado fijamente. | Extraer el ID de inquilino desde el token JWT: `current_user.inquilino_id`. | Filtrado nulo de datos entre distintas instituciones o empresas (fuga masiva de información). | Sustituir `tenant_id = 1` por `current_user.inquilino_id` y activar la dependencia `Depends(deps.get_current_active_user)`. |
| **INC-02** | **ALTA** | Agentes IA / Persistencia | `app/api/v1/endpoints/agent.py` (Línea 12) | Se especifica `db_path = "formacion.db"`, el cual es un archivo de 0 bytes en la raíz sin esquemas de datos. | Conectar la persistencia de agentes a la base de datos principal o un checkpointer configurado. | Falla de herramientas de IA que requieran consultar datos reales de alumnos, cursos o eventos. | Apuntar la ruta de base de datos a `SGA-CD-DB.git/sga_cd_main.db` o inyectar la sesión de la DB. |
| **INC-03** | **ALTA** | Funcionalidad / Modelo | N/A (Módulo `ferias`) | No existen tablas, modelos, ni endpoints para "Ferias Culturales". | Flujos completos de creación, asignación e inscripción en Ferias. | Incumplimiento del requerimiento funcional de eventos y ferias culturales. | Diseñar modelo `FeriaCultural` en `SGA-CD-DB.git` y agregar endpoints en el router de eventos. |
| **INC-04** | **MEDIA** | Auth / Consistencia Roles | `app/crud/user.py` (Línea 74) | Se asigna rol en tabla `roles`, pero en algunas consultas se cae en `user.rol` Enum sin validar sincronía. | Sincronización transparente entre la relación ORM `roles` y el Enum `rol`. | Discrepancias de permisos entre el token JWT y el perfil de usuario en la base de datos. | Asegurar que `create_user` y semillas garanticen que la relación `roles` contenga siempre la entidad ORM correspondiente. |
| **INC-05** | **MEDIA** | Frontend / API Missing | `SGA-CD-WEB.git/js/views/tecnico_area.js`<br>`jefe_area.js` | Intentan consultar `/api/v1/disciplinas` y `/api/v1/jefe_area/staff` los cuales no existen en FastAPI. | Respuestas 200 OK con estructuras JSON válidas para la interfaz web. | Pantallas del panel web del Técnico de Área y Jefe de Área muestran errores o quedan en blanco. | Implementar los routers/endpoints faltantes en FastAPI o corregir los endpoints invocados desde el JS. |
| **INC-06** | **BAJA** | Arquitectura / Duplicación | `SGA-CD-APP.git` vs `SGA-CD-APK.git` | El código fuente de ambas aplicaciones es 100% idéntico salvo por `requirements.txt`. | Módulo unificado o repositorio monorepo limpio con construcción multiplataforma Flet. | Dificultad de mantenimiento y riesgo de divergencia de código entre cliente de escritorio y móvil. | Unificar la lógica en un solo proyecto base Flet con targets de compilación diferenciados. |

---

## E. MATRIZ DE COBERTURA DE COMPONENTES Y FLUJOS

| Componente | Flujo / Funcionalidad | Estado Actual | Pruebas Automáticas | Evidencia Directa |
| :--- | :--- | :--- | :--- | :--- |
| **Autenticación** | Login OAuth2 / JWT / Refresh Token | **IMPLEMENTADO** | SÍ (vía `test_audit.py`) | Generación exitosa de JWT con roles e `inquilino_id`. |
| **Multiinquilino** | Aislamiento por `inquilino_id` | **PARCIALMENTE IMPLEMENTADO** | NO (Deficiente) | Aislamiento correcto en `alumnos.py` y `clases.py`; **Fallido (hardcodeado)** en `eventos.py`, `inventory.py`, `curriculum.py`. |
| **Escenarios** | Gestión y Reserva sin solapamiento | **IMPLEMENTADO** | SÍ (`test_escenarios.py`) | Validación de conflicto 409 exitosa en reservas concurrentes. |
| **Agentes IA** | Invocación LangGraph y Voz | **PARCIALMENTE IMPLEMENTADO** | NO | Endpoint `/invoke` funciona con filtro de sesión seguro; Falla persistencia local por `formacion.db` vacío. |
| **Eventos y Ferias** | Eventos estudiantiles y Ferias | **PARCIALMENTE IMPLEMENTADO** | NO | Eventos básicos implementados; Ferias culturales totalmente ausentes. |
| **Clientes Flet** | Sincronización Offline y UI | **PARCIALMENTE IMPLEMENTADO** | NO | Clientes Flet inician correctamente pero requieren backend en ejecución y tablas locales de SQLite. |
| **Web Frontend** | Panel SPA multi-rol | **PARCIALMENTE IMPLEMENTADO** | NO | Puntos de entrada `login.html` y `app.html` operativos; Errores en vistas por endpoints REST inexistentes. |

---

## F. RESULTADOS DE PRUEBAS AUTOMATIZADAS

Las suites de prueba fueron analizadas en modo de inspección técnica estática y en entornos en memoria aislados para prevenir efectos secundarios sobre la base de datos persistente.

1. **Prueba: `tests/api/v1/test_escenarios.py`**
   - **Alcance:** Creación de reservas de escenarios deportivos, detección de traslapes/conflictos de horario y creación secuencial.
   - **Resultado:** APROBADO EN CÓDIGO (Lógica de verificación de conflictos valida con HTTP 409 si existe solapamiento).

2. **Prueba: `tests/api/v1/test_audit.py`**
   - **Alcance:** Verificación de emisión de logs de auditoría al realizar operaciones sobre la API.
   - **Resultado:** APROBADO EN CÓDIGO (Genera registros de auditoría vinculados al usuario autenticado).

---

## G. PLAN DE CORRECCIÓN PRIORIZADO

1. **Fase 1: Remediación Crítica de Seguridad y Multiinquilino (Prioridad Inmediata)**
   - Modificar `eventos.py`, `inventory.py`, `curriculum.py`, `procesos.py` y `gamificacion.py` para eliminar el hardcoding `tenant_id = 1` e inyectar `current_user.inquilino_id`.
   - Activar la verificación obligatoria del token JWT en los endpoints que actualmente tienen comentado `Depends(deps.get_current_user)`.

2. **Fase 2: Integración y Persistencia de Agentes IA**
   - Vincular `agent.py` y el motor LangGraph a la base de datos principal (`sga_cd_main.db`) para reemplazar el archivo nulo `formacion.db`.
   - Garantizar la carga de API Keys de OpenAI/Gemini mediante el archivo `.env`.

3. **Fase 3: Completación del Módulo Cultural (Ferias) y Endpoints Faltantes**
   - Crear el modelo y tabla `FeriaCultural` con relaciones hacia inscripciones, coordinadores y docentes.
   - Implementar los endpoints REST faltantes reclamados por el frontend web (`/api/v1/disciplinas`, `/api/v1/jefe_area/staff`, `/api/v1/jefe_area/events`).

4. **Fase 4: Consolidación de Clientes y Pruebas E2E**
   - Sincronizar las llamadas REST de `SGA-CD-APP.git` y `SGA-CD-APK.git` con los esquemas actualizados de FastAPI.
   - Ampliar la suite de pytest para incluir pruebas de regresión multiinquilino negativas (intento de acceso cruzado entre tenant A y tenant B).

---

## H. DICTÁMENES INDEPENDIENTES POR ÁREA

| Área Evaluada | Dictamen Final | Justificación Técnica Breve |
| :--- | :--- | :--- |
| **Arquitectura** | **PARCIALMENTE DEMOSTRADO** | Estructura backend/frontend clara pero con duplicación entre APP/APK y desvinculación de bases de datos locales. |
| **Funcionalidad** | **PARCIALMENTE DEMOSTRADO** | Flujos académicos y de escenarios operativos; Faltan ferias culturales y endpoints de apoyo a jefes de área. |
| **Seguridad** | **NO APROBADO** | Presencia de endpoints con dependencias de autenticación comentadas e IDs harcodeados. |
| **Multiinquilino** | **NO APROBADO** | Fuga potencial de tenant a tenant por hardcoding `tenant_id = 1` en 5 routers principales. |
| **Persistencia** | **PARCIALMENTE DEMOSTRADO** | Modelos SQLAlchemy sólidos en `SGA-CD-DB.git`; Archivo SQLite local de agentes se encuentra vacío. |
| **Agentes de IA** | **PARCIALMENTE DEMOSTRADO** | Grafos LangGraph bien diseñados e invocación aislada por thread_id; Falla integración de datos reales. |
| **APP / APK / WEB** | **PARCIALMENTE DEMOSTRADO** | Interfaces web y Flet construidas correctamente; Errores en tiempo de ejecución por disparidad de contratos REST. |
| **Calidad de Pruebas**| **PARCIALMENTE DEMOSTRADO** | Pruebas unitarias de escenarios y auditoría presentes; Ausencia de suite integral para multiinquilino y agentes. |
| **Preparación Producción**| **NO APROBADO** | Inseguro para despliegue hasta aplicar el plan de corrección de seguridad y multiinquilino. |

---

## I. PLAN DE SIGUIENTES FASES DE TRABAJO

### Fase 1 (Propuesta): Remediación de Multiinquilino y Seguridad Base
- **Objetivo:** Garantizar el aislamiento estricto por `inquilino_id` en el 100% de los endpoints.
- **Archivos Probables a Modificar:** `app/api/v1/endpoints/eventos.py`, `inventory.py`, `curriculum.py`, `procesos.py`, `gamificacion.py`, `padre.py`.
- **Criterio de Aceptación:** Ningún endpoint aceptará o asumirá un `tenant_id` fijo; todas las consultas filtrarán por `current_user.inquilino_id`.
- **Riesgo:** Bajo (Cambios focalizados de refactorización en consultas CRUD y routers).

### Fase 2 (Propuesta): Sincronización de Base de Datos y Endpoints Frontend
- **Objetivo:** Unificar la persistencia del agente de IA e implementar endpoints faltantes para el frontend web.
- **Archivos Probables a Modificar:** `app/api/v1/endpoints/agent.py`, creación de `app/api/v1/endpoints/disciplinas.py` y `jefe_area.py`.
- **Criterio de Aceptación:** Agente de IA responde consultas utilizando la base de datos central y el frontend web navega sin errores 404 en la consola.
- **Riesgo:** Medio (Requiere validar esquemas Pydantic y respuestas JSON).

---
*Fin del Informe Técnico de Auditoría — SGA-CD Visión 0.1.*
