# REGISTRO DE TRANSPARENCIA Y GOBERNANZA DE INTELIGENCIA ARTIFICIAL (SGA-CD)

**Proyecto:** Sistema Estudiantil, Cultural y Deportivo (SGA-CD) — Visión 0.1
**Módulo:** Módulo 2 - Inteligencia Artificial, Transparencia y Marcado de Contenido
**Reglamento de Referencia:** Reglamento Europeo de Inteligencia Artificial (AI Act), Ley 1581 de 2012 y Estándares Éticos SGA-CD
**Fecha:** 13 de Octubre de 2026

---

## 1. FUNCIONES Y ARQUITECTURA DE INTELIGENCIA ARTIFICIAL

El SGA-CD integra un sistema jerárquico de **21 Nodos Operativos de Agentes de IA** organizados en 5 niveles de mando (General, Coroneles, Capitanes, Tenientes y Sargentos) coordinados mediante grafos de estados con LangGraph y modelos de lenguaje (OpenAI GPT-4 / GPT-3.5):

1. **Agente de Ventas y Admisiones (`sales_agent.py`):**
   - *Finalidad:* Orientación sobre planes, requisitos de inscripción y oferta cultural/deportiva.
   - *Público:* Abierto a visitantes y usuarios no autenticados.
2. **Agente Pedagógico y de Formación Cultural (`formacion_cultura_colonel.py`):**
   - *Finalidad:* Asistencia a profesores y coordinadores en la planificación curricular, diseño de temas y actividades.
   - *Público:* Profesores y Administradores autenticados.
3. **Agentes Especializados (Capitanes, Tenientes y Sargentos):**
   - *Finalidad:* Operaciones académicas, deportivas, gamificación, comunicaciones e inteligencia institucional.

---

## 2. MEDIDAS DE TRANSPARENCIA Y ETIQUETADO OBLIGATORIO

1. **Aviso explícito de interacción con IA:**
   - La interfaz Web (`SGA-CD-WEB.git/app.html`) y los clientes móviles/escritorio informan claramente al usuario antes y durante la conversación que está interactuando con un asistente virtual de IA ("🤖 Asistente IA SGA-CD").
2. **Etiquetado de respuestas e imágenes generadas:**
   - Todos los DTOs de respuesta (`schemas/agent.py`) incluyen los metadatos:
     - `is_ai_generated`: `True`
     - `disclaimer_ia`: *"Respuesta generada por Inteligencia Artificial SGA-CD. Requiere supervisión y verificación humana."*
3. **Supervisión y Control Humano (Human-in-the-Loop):**
   - Ninguna decisión disciplinaria, académica o de facturación se toma de forma automatizada. Las sugerencias de planificación de los agentes deben ser revisadas y aprobadas por un profesor o coordinador humano.

---

## 3. PROTECCIÓN DE DATOS Y PRIVACIDAD EN EL MODELO

1. **Aislamiento Estricto por Inquilino (`thread_id`):**
   - Cada llamada al agente utiliza la función `build_scoped_thread_id` para generar hilos escopados: `tenant_{inquilino_id}:user_{user_id}:session_{client_thread_id}`. Es imposible que la conversación de un inquilino o usuario contamine o sea leída por otro.
2. **Sanitización Previa de Prompts (Filtro PII):**
   - Se ejecuta una capa de filtrado antes de enviar cualquier consulta a OpenAI para redactar/reemplazar patrones de contraseñas, tarjetas de crédito, números de documento y secretos (`[DATO_SENSIBLE_PROTEGIDO]`).
3. **No Entrenamiento de Modelos:**
   - SGA-CD utiliza la API de empresa de OpenAI con compromisos contractuales de no conservación para entrenamiento de modelos públicos sobre datos de la plataforma.
