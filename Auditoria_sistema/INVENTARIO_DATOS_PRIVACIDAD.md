# INVENTARIO DE DATOS PERSONALES Y CUMPLIMIENTO DE PRIVACIDAD (SGA-CD)

**Proyecto:** Sistema Estudiantil, Cultural y Deportivo (SGA-CD) — Visión 0.1
**Módulo:** Módulo 1 - Protección de Datos Personales, Menores y Cumplimiento Legal
**Fecha:** 13 de Octubre de 2026

---

## 1. REGISTRO DE DATOS RECOPILADOS Y TRATAMIENTO

| Nombre del Dato | Lugar de Recopilación | Finalidad Técnica/Operativa | Base Jurídica | Obligatorio / Opcional | Retención / Conservación | Destinatarios / Integraciones | Medidas de Seguridad |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Nombre Completo** | Formularios de Registro / API `/users` | Identificación del usuario en la plataforma. | Ejecución del Contrato | Obligatorio | Duración de la cuenta activa + 5 años legales. | Base de Datos Central (`sga_cd_main.db`) | Cifrado en tránsito (TLS/HTTPS), RBAC. |
| **Correo Electrónico** | Formulario `/register`, `/auth/login` | Login, generación de username y avisos del sistema. | Ejecución del Contrato | Obligatorio | Duración de la cuenta. | Servidor SMTP / DB Central | Unicidad en DB, Hashes, TLS. |
| **Contraseña** | Formulario `/login`, `/register` | Autenticación del usuario. | Ejecución del Contrato | Obligatorio | Hasta actualización o supresión. | DB Central | Hash BCrypt (con truncado seguro a 72 bytes). |
| **Datos de Menores (Desde 5 Años)** | Módulo `/alumnos`, Perfil Estudiantil | Seguimiento educativo, deportivo y cultural. | Consentimiento Paterno Explicito | Obligatorio para alumnos | Período académico + archivo institucional. | **RESTRINGIDO:** Institución, Profesor Asignado y Padre. | Aislamiento por `inquilino_id` + ABAC asignación. |
| **Vincular Padre/Hijo** | Tabla `padre_hijos_association` | Verificación de relación familiar para acceso. | Interés Legítimo / Protección Menor | Obligatorio para menores | Duración de la filiación escolar. | DB Central | Validación ABAC en `alumnos.py`. |
| **Asistencias y Notas** | Endpoints `/procesos`, `/alumnos/{id}/progreso` | Cálculo de progreso dinámico y métricas. | Ejecución de Servicio Educativo | Obligatorio | Historial académico. | DB Central | Filtro estricto por tenant y asignación. |
| **IP y Logs de Acceso** | Servidor ASGI / Tabla `audit_log` | Auditoría de seguridad y trazabilidad. | Interés Legítimo / Seguridad | Obligatorio | 12 meses. | Tabla `audit_log` | Acceso exclusivo `admin_general`. |

---

## 2. REGLAS Y GARANTÍAS PARA DATOS DE MENORES DE EDAD

1. **Inscripción desde los 5 años:** Permitida bajo la tutela y consentimiento del Padre / Madre / Acudiente.
2. **Acceso Exclusivo y Restringido:**
   - **Institución (SaaS Tenant Admin):** Acceso a sus alumnos matriculados.
   - **Instructor / Profesor Asignado:** Únicamente los profesores inscritos en la clase/proceso del alumno pueden consultar su perfil y registrar asistencias.
   - **Padre / Acudiente:** Acceso exclusivo a sus hijos vinculados en `current_user.hijos`.
   - **Terceros / Otros Profesores / Alumnos:** **ACCESO TOTALMENTE DENEGADO (HTTP 403 / 404).**
3. **Derecho a la Supresión:** Disponible mediante endpoint de autoservicio `DELETE /api/v1/users/me/data` o solicitud a `privacidad@sga-cd.org`.
