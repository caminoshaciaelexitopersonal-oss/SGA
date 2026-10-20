import os
import subprocess
import json

print("=== INICIANDO MOTOR DE PRODUCCIÓN AUDIOVISUAL PROGRAMÁTICA SGA-CD (300 SEGUNDOS) ===")

OUTPUT_DIR = os.path.abspath("production_video_5min")
os.makedirs(OUTPUT_DIR, exist_ok=True)

FINAL_VIDEO_MP4 = os.path.join(OUTPUT_DIR, "sga_cd_institutional_5min.mp4")
SRT_PATH = os.path.join(OUTPUT_DIR, "sga_cd_subtitles_es.srt")
SCRIPT_TXT_PATH = os.path.join(OUTPUT_DIR, "guion_locucion_definitivo.txt")

# 1. Definición de Escenas (300 Segundos Exactos)
scenes = [
    {
        "id": 1,
        "title": "SGA-CD: Transformación Cultural y Deportiva",
        "subtitle": "Ecosistema Tecnológico para Escuelas de Formación y Comunidades",
        "duration": 25,
        "bg_color": "#070B14",
        "tag": "APERTURA INSTITUCIONAL"
    },
    {
        "id": 2,
        "title": "SGA-CD — Sistema Estudiantil, Cultural y Deportivo",
        "subtitle": "Plataforma Omnicanal Integrada con PWA Offline y Diagnósticos Biométricos",
        "duration": 30,
        "bg_color": "#0B172E",
        "tag": "PRESENTACIÓN DEL PRODUCTO"
    },
    {
        "id": 3,
        "title": "Organización Institucional & Control RBAC",
        "subtitle": "12 Roles Oficiales, Aislamiento Multi-Tenant y Fiscalización Presupuestal",
        "duration": 40,
        "bg_color": "#0D1424",
        "tag": "ESTRUKTURA GUBERNAMENTAL Y B2B"
    },
    {
        "id": 4,
        "title": "Gestión Estudiantil & Formativa de Alto Impacto",
        "subtitle": "Roster de Alumnos, Expedientes Atléticos y Carnetización Digital Costo 0",
        "duration": 45,
        "bg_color": "#081121",
        "tag": "FORMACIÓN Y COMUNIDAD"
    },
    {
        "id": 5,
        "title": "Área de Deportes & Área de Cultura",
        "subtitle": "Disciplinas Deportivas y Modalidades Culturales (Danza Joropo e Instrumentos)",
        "duration": 45,
        "bg_color": "#0A1931",
        "tag": "DOMINIOS OPERATIVOS"
    },
    {
        "id": 6,
        "title": "Gestión de Inventarios, Escenarios & Asistencia",
        "subtitle": "Supervisión de Almacenes, Reservas de Espacios y Chequeo Offline PWA",
        "duration": 40,
        "bg_color": "#050D1A",
        "tag": "OPERACIONES EN TERRITORIO"
    },
    {
        "id": 7,
        "title": "Arquitectura Vanguard, AI Agent & AgentShield ECC",
        "subtitle": "Telemetría con Ollama, Motor Predis.ai Multi-Red y Cifrado Perimetral",
        "duration": 35,
        "bg_color": "#0D1E3A",
        "tag": "TECNOLOGÍA E INTELIGENCIA ARTIFICIAL"
    },
    {
        "id": 8,
        "title": "Impacto Social, Transparencia y Valor Humano",
        "subtitle": "Transformación Comunitarias en Gobernaciones, Alcaldías e Instituciones",
        "duration": 25,
        "bg_color": "#09152B",
        "tag": "VISIÓN SOCIAL Y FUTURO"
    },
    {
        "id": 9,
        "title": "SGA-CD — Tecnología para Organizar, Conectar y Transformar",
        "subtitle": "Inscripciones Abiertas 2025 | www.sgacd.gov.co",
        "duration": 15,
        "bg_color": "#070B14",
        "tag": "MARCA Y CIERRE"
    }
]

# 2. Generar Guion de Locución Definitivo
guion_text = """=== GUION DEFINITIVO DE LOCUCIÓN SGA-CD (5 MINUTOS / 300 SEGUNDOS) ===

ESCENA 1 (00:00 - 00:25 / 25s):
"Bienvenidos al futuro de la gestión formativa. En un mundo donde el deporte y la cultura transforman vidas, el Sistema Estudiantil, Cultural y Deportivo SGA-CD nace como la infraestructura tecnológica definitiva para conectar instituciones, profesores y comunidades."

ESCENA 2 (00:25 - 00:55 / 30s):
"SGA-CD es la suite omnicanal integral que simplifica la administración de escuelas deportivas y talleres culturales. Con arquitectura Progressive Web App de sincronización sin conexión y diagnósticos biométricos, garantizamos continuidad operativa sin importar las limitaciones de conectividad en el territorio."

ESCENA 3 (00:55 - 01:35 / 40s):
"Diseñado para una gobernanza transparente, el sistema soporta doce roles oficiales con aislamiento multi-inquilino estricto. Desde Ministerios, Gobernaciones y Alcaldías hasta instructores y acudientes, SGA-CD asegura el control presupuestal, auditoría criptográfica perimetral y seguridad AgentShield de nivel corporativo."

ESCENA 4 (01:35 - 02:20 / 45s):
"Para nuestros estudiantes y familias, ofrecemos una Suscripción Estudiantil Costo Cero. La plataforma automatiza la inscripción en línea, emite carnets digitales con código QR, realiza seguimiento de calificaciones y otorga medallería y reconocimientos en un entorno dinámico y motivador."

ESCENA 5 (02:20 - 03:05 / 45s):
"SGA-CD respeta la identidad y la taxonomía de cada área: en Deportes, gestionamos Disciplinas como Taekwondo, Fútbol y Baloncesto; en Cultura, estructuramos Modalidades y Talleres como Danza Joropo, Salsa e Instrumentos de Cuerda. Todo en expedientes digitales unificados."

ESCENA 6 (03:05 - 03:45 / 40s):
"Optimizamos la operación en campo. Los jefes de almacén y escenarios administran inventarios, reposición de elementos y reservas de espacios deportivos, mientras los profesores registran asistencia sin conexión a internet mediante la tecnología PWA Sync."

ESCENA 7 (03:45 - 04:20 / 35s):
"Impulsado por inteligencia artificial, SGA-CD integra el motor de medios Predis.ai para generación de contenido multicanal, telemetría con Ollama local y protección de datos ARCO, asegurando una experiencia digital moderna, rápida y blindada."

ESCENA 8 (04:20 - 04:45 / 25s):
"Más que software, SGA-CD es una herramienta de equidad social y desarrollo humano. Fomentamos la disciplina, la expresión artística y el talento de miles de jóvenes en toda la nación."

ESCENA 9 (04:45 - 05:00 / 15s):
"SGA-CD. Tecnología para organizar, conectar y transformar. Únete a la nueva era de la formación cultural y deportiva."
"""

with open(SCRIPT_TXT_PATH, "w", encoding="utf-8") as f:
    f.write(guion_text)
print(f"[OK] Guion guardado en: {SCRIPT_TXT_PATH}")

# 3. Generar Subtítulos SRT
srt_content = """1
00:00:01,000 --> 00:00:24,000
Bienvenidos al futuro de la gestión formativa. SGA-CD conecta instituciones, profesores y comunidades.

2
00:00:26,000 --> 00:00:54,000
SGA-CD es la suite omnicanal integral con PWA Offline Sync y diagnósticos biométricos.

3
00:00:56,000 --> 00:01:34,000
Diseñado con 12 roles oficiales, aislamiento multi-tenant y auditoría presupuestal transparente.

4
00:01:36,000 --> 00:02:18,000
Suscripción Estudiantil Costo 0: inscripciones en línea, carnet digital QR y medallería.

5
00:02:21,000 --> 00:03:03,000
Gestión especializada: Disciplinas Deportivas (Taekwondo, Fútbol) y Modalidades Culturales (Joropo, Arpa).

6
00:03:06,000 --> 00:03:43,000
Operaciones en territorio: control de inventarios, reserva de escenarios y toma de asistencia offline.

7
00:03:46,000 --> 00:04:18,000
Inteligencia Artificial con Predis.ai, telemetría Ollama y blindaje AgentShield ECC.

8
00:04:21,000 --> 00:04:44,000
Herramienta de equidad social y desarrollo humano para jóvenes en todo el país.

9
00:04:46,000 --> 00:04:59,000
SGA-CD. Tecnología para organizar, conectar y transformar.
"""

with open(SRT_PATH, "w", encoding="utf-8") as f:
    f.write(srt_content)
print(f"[OK] Subtítulos SRT guardados en: {SRT_PATH}")

# 4. Renderizar Frames HTML para cada Escena mediante Playwright
print("[HyperFrames Engine] Generando frames de escena con Playwright...")

scene_files = []

for s in scenes:
    frame_html_path = os.path.join(OUTPUT_DIR, f"frame_scene_{s['id']}.html")
    frame_png_path = os.path.join(OUTPUT_DIR, f"frame_scene_{s['id']}.png")
    scene_mp4_path = os.path.join(OUTPUT_DIR, f"scene_{s['id']}.mp4")

    html_code = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        body {{
            margin: 0; padding: 0; width: 1280px; height: 720px;
            background-color: {s['bg_color']}; color: #E2E8F0;
            font-family: 'Inter', system-ui, sans-serif;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            overflow: hidden; box-sizing: border-box;
        }}
        .glass-card {{
            background: #0D1424; border: 2px solid rgba(56, 189, 248, 0.35);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6); border-radius: 24px;
            padding: 45px; width: 82%; text-align: center; position: relative;
        }}
        .scene-tag {{
            background: rgba(56, 189, 248, 0.18); color: #38BDF8; border: 1px solid #38BDF8;
            padding: 8px 22px; border-radius: 20px; font-size: 0.95rem; font-weight: 800;
            letter-spacing: 1.5px; display: inline-block; margin-bottom: 20px;
        }}
        .scene-title {{
            color: #F8FAFC; font-size: 2.6rem; font-weight: 800; margin: 0 0 15px 0;
            line-height: 1.25; text-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
        }}
        .scene-subtitle {{
            color: #94A3B8; font-size: 1.25rem; line-height: 1.6; margin-bottom: 25px;
        }}
        .footer-badge {{
            color: #38BDF8; font-size: 0.9rem; font-weight: 700; opacity: 0.85;
        }}
    </style>
</head>
<body>
    <div class="glass-card">
        <div class="scene-tag">{s['tag']} (ESCENA {s['id']} / 9)</div>
        <h1 class="scene-title">{s['title']}</h1>
        <p class="scene-subtitle">{s['subtitle']}</p>
        <div class="footer-badge">SGA-CD 2025 • Duración: {s['duration']}s | Paleta Dark Metallic Blue (60-30-10)</div>
    </div>
</body>
</html>"""

    with open(frame_html_path, "w", encoding="utf-8") as f:
        f.write(html_code)

    # Capturar Frame PNG
    python_pw = f"""
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={{"width": 1280, "height": 720}})
    page.goto("file://{frame_html_path}")
    page.screenshot(path="{frame_png_path}")
    browser.close()
"""
    subprocess.run(["python3", "-c", python_pw], check=True)

    # Renderizar Clip MP4 de cada escena con la duración exacta usando FFmpeg
    ffmpeg_cmd = [
        "ffmpeg", "-y", "-loop", "1", "-i", frame_png_path,
        "-c:v", "libx264", "-t", str(s['duration']), "-pix_fmt", "yuv420p",
        "-r", "30", scene_mp4_path
    ]
    subprocess.run(ffmpeg_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    print(f" [OK] Escena {s['id']} renderizada ({s['duration']}s) -> {scene_mp4_path}")
    scene_files.append(scene_mp4_path)

# 5. Concatenar las 9 Escenas para obtener el Vídeo Final de 300 Segundos (5 Minutos)
print("\n[FFmpeg Engine] Concatenando las 9 escenas en el vídeo final de 300 segundos...")
concat_list_path = os.path.join(OUTPUT_DIR, "concat_list.txt")
with open(concat_list_path, "w", encoding="utf-8") as f:
    for sf in scene_files:
        f.write(f"file '{sf}'\n")

ffmpeg_concat_cmd = [
    "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_list_path,
    "-c", "copy", FINAL_VIDEO_MP4
]
subprocess.run(ffmpeg_concat_cmd, check=True)

print(f"\n✅ [ÉXITO TOTAL] Vídeo Institucional SGA-CD de 5 Minutos Renderizado en: {FINAL_VIDEO_MP4}")
