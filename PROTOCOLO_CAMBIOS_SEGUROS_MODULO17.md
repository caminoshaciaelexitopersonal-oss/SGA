# PROTOCOLO OFICIAL DE CAMBIOS SEGUROS - MÓDULO 17
## Sistema Estudiantil, Cultural y Deportivo (SGA-CD) — Visión 0.1 / Despliegue 01

El presente protocolo establece el procedimiento técnico obligatorio de 8 Fases (A–H) para cualquier intervención, actualización o mantenimiento del sistema SGA-CD.

---

### FASE A. INSPECCIÓN Y ANÁLISIS DE IMPACTO
- Identificación de los 5 componentes del monorrepositorio afectados (`SGA-CD-FASTAPI-BACKEND`, `SGA-CD-WEB.git`, `SGA-CD-APP.git`, `SGA-CD-APK.git`, `SGA-CD-DB.git`).
- Evaluación de riesgos de seguridad, privacidad (estudiantes 5+ años), rendimiento y aislamiento multi-inquilino.

---

### FASE B. ESTABLECIMIENTO DE LÍNEA BASE
- Ejecución previa de la suite completa de pruebas antes de modificar cualquier línea de código.
- Registro de hash de commit Git, estado del árbol de trabajo (`git status`) e integridad del esquema de base de datos (`PRAGMA integrity_check`).

---

### FASE C. PLANIFICACIÓN FORMAL DE CAMBIOS
- Especificación del listado exacto de archivos a modificar o crear.
- Justificación técnica, efectos esperados y método de verificación automatizada.
- Aprobación previa y explícita por parte del usuario o comité técnico autorizado.

---

### FASE D. IMPLEMENTACIÓN ATÓMICA E INCREMENTAL
- Realización de cambios pequeños, coherentes y desacoplados.
- Reutilización estricta de patrones ORM, esquemas Pydantic V2 y utilidades compartidas (`deps.py`, `rate_limiter.py`, `cache.py`, `email_service.py`, `image_validator.py`).
- Prohibición de refactorizaciones masivas no relacionadas con el requerimiento.

---

### FASE E. VERIFICACIÓN Y AUDITORÍA DE PRUEBAS
- Ejecución de pruebas unitarias, de integración, de extremos a extremo (15 escenarios obligatorios), de seguridad multi-inquilino y rendimiento.
- Verificación de interfaz responsiva y accesibilidad WCAG 2.2 AA mediante Playwright en resoluciones de 375px, 768px, 1024px y 1440px.

---

### FASE F. REVISIÓN DE SEGURIDAD Y PRIVACIDAD
- Inspección estática de secretos en el código (`.env.example` con placeholders seguros).
- Verificación de enmascaramiento de datos privados (ARCO, sanitización de prompts IA).
- Auditoría de permisos por rol (12 roles oficiales) y políticas de aislamiento ABAC.

---

### FASE G. ESTRATEGIA Y PROCEDIMIENTO DE REVERSIÓN (ROLLBACK)
- **Reversión de Código:** `git restore <file>` o `git checkout <commit_hash>`.
- **Reversión de Base de Datos:** `alembic downgrade -1` para revertir la última migración de forma reversible y sin pérdida de datos productivos.

---

### FASE H. REGISTRO OFICIAL DE EVIDENCIAS
- Consolidación de informe con comandos ejecutados, logs estructurados JSON, imágenes de verificación Playwright y matriz de 100% de pruebas pasadas.
