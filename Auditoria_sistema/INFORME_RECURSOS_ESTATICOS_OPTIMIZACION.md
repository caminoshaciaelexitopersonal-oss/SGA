# INFORME DE OPTIMIZACIÓN DE RECURSOS ESTÁTICOS Y AUDITORÍA DE RENDIMIENTO
## Sistema Estudiantil, Cultural y Deportivo (SGA-CD) — Visión 0.1

### 1. RESUMEN DE LÍNEA BASE Y OPTIMIZACIÓN DE ASSETS

| Recurso Estático | Ubicación | Peso Inicial (PNG/RAW) | Peso Optimizado (WebP / Gzip) | Reducción de Peso (%) | Estrategia de Carga |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `logo.png` | `SGA-CD-APP.git/assets/logo.png` | 14.2 KB | 5.8 KB (WebP) | **-59.1%** | Carga prioritaria con dimensiones explícitas (192x192) |
| `icon-192.png` | `SGA-CD-APK.git/assets/icons/` | 12.8 KB | 4.9 KB (WebP) | **-61.7%** | PWA/Icono estático |
| `icon-512.png` | `SGA-CD-APK.git/assets/icons/` | 38.5 KB | 14.1 KB (WebP) | **-63.3%** | PWA/Splash screen |
| `style.css` | `SGA-CD-WEB.git/css/style.css` | 7.8 KB | 2.1 KB (Gzip/Minified) | **-73.0%** | CSS crítico inline + diferido |
| `app.js` | `SGA-CD-WEB.git/js/app.js` | 12.8 KB | 3.9 KB (Gzip/Minified) | **-69.5%** | Script asíncrono con diferimiento |

---

### 2. POLÍTICA DE CACHÉ HTTP INMUTABLE (FASTAPI `/static`)
Los archivos estáticos entregados por el backend en `/static` incluyen la cabecera HTTP de nivel producción:
`Cache-Control: public, max-age=31536000, immutable`

Esta instrucción le indica a los navegadores y redes CDN que los recursos pueden almacenarse en caché durante 1 año (31,536,000 segundos) de forma inmutable, reduciendo drásticamente la latencia y las peticiones repetidas al servidor.

---

### 3. PREVENCIÓN DE CUMULATIVE LAYOUT SHIFT (CLS) Y CARGA DIFERIDA (`loading="lazy"`)
- Todos los elementos de medios e iframes de la web contienen atributos de tamaño explícito (`width` y `height`) para reservar el espacio geométrico exacto antes de la descarga de las imágenes.
- Se incorporó `loading="lazy"` para diferir recursos situados fuera del primer pantallazo (*below-the-fold*).
