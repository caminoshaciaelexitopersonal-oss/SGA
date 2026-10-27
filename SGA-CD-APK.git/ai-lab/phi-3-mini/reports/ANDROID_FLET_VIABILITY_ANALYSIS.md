# SGA-CD — Análisis de Viabilidad de Integración en Android / Flet (Phi-3 Mini ONNX INT4)

## 1. Evaluación de Requerimientos de Hardware y Arquitectura Móvil

### A. Memoria RAM y Consumo Obs
- **Peso de Archivos en Disco**: ~2.62 GB (`phi3-mini-4k-instruct-cpu-int4-rtn-block-32-acc-level-4.onnx.data` y metadatos).
- **RAM Mínima en Ejecución**: ~3.20 GB a 3.61 GB RAM.
- **Impacto en Android**:
  - Dispositivos de gama entrada / media baja (4 GB - 6 GB RAM total): **Riesgo crítico de OOM (Out Of Memory)**. El *Low Memory Killer* (LMK) del SO Android terminará el proceso de la aplicación cuando consuma >2.5 GB adicionales a las apps en segundo plano.
  - Dispositivos de gama media-alta / alta (8 GB - 12 GB RAM total): Viable para ejecución en segundo plano/proceso dedicado con límites estrictos de memoria.

### B. Almacenamiento e Instalación
- Embeber 2.6 GB directamente dentro del APK elevaría el instalador a >2.7 GB, superando límites estándar de tiendas de aplicaciones y ralentizando la instalación.
- **Estrategia Viable**: Carga diferida en primer inicio (*post-install download* o *On-Demand Asset Pack*) guardando los pesos en almacenamiento local seguro (`context.getFilesDir() + "/models/phi-3-mini/"`).

---

## 2. Vías de Integración Técnica Flet <-> ONNX Runtime GenAI

### Opción A: C-Extension Python Wheel (`aarch64`)
- **Mecanismo**: Compilar `onnxruntime-genai` C-extension para la arquitectura Python `arm64-v8a` embebida por Flet (Serious Python).
- **Ventajas**: Mantiene toda la lógica de inferencia en código Python dentro de la app Flet.
- **Desventajas**: Complejidad de compilación cruzada (*cross-compilation*) para Android NDK y límites de rendimiento de hilos en CPython embebido.

### Opción B: Puente Nativo Android (Kotlin / Java AAR) + Flet Channel
- **Mecanismo**: Utilizar la librería oficial Maven `com.microsoft.onnxruntime:onnxruntime-genai-android` en la capa nativa Android (Java/Kotlin). Flet interactúa mediante *Platform Channels* / llamadas de comunicación entre la UI de Flet y el servicio nativo Android.
- **Ventajas**:
  - Aprovecha la gestión nativa de memoria de Android y subprocesos (*Coroutines / Background Service*).
  - Admite aceleración por hardware NPU/GPU (*NNAPI*, *OpenCL*, *QNN* para Snapdragon).
  - Evita fallos del CPython GIL durante la generación de tokens.
- **Desventajas**: Requiere puente de código Kotlin/Java en el proyecto nativo Android de Flet.

---

## 3. Estado de Herramientas en el Entorno Actual
- **Flutter SDK**: Presente en `/opt/flutter/bin/flutter`.
- **Android SDK / cmdline-tools**: Presente en `/opt/android-sdk/`.
- **Gradle**: Presente en `/usr/share/gradle/bin/gradle`.
- **Flet CLI**: No instalado globalmente.
- **APK de Producción**: Se conserva intacto y no ha sido modificado conforme a la directriz oficial.

---

## 4. Conclusión de Viabilidad Android / Flet
La ejecución en Android es **técnicamente viable** mediante la arquitectura de **Puente Nativo Kotlin + ONNX Runtime GenAI Android AAR**, pero está restringida a dispositivos de **gama media-alta con un mínimo de 8 GB de RAM** y almacenamiento local suficiente (>= 3 GB libres).
