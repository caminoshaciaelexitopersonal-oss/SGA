/**
 * Render Promo Video Script for SGA-CD (HyperFrames Local Renderer)
 * SGA-CD Architecture - Dark Metallic Blue System (60-30-10)
 *
 * Taxonomía de Dominio:
 * - Área de Cultura: Talleres o Modalidades Culturales (Danza: Joropo/Llanera, Salsa, Vallenato | Instrumentos: Guitarra, Arpa)
 * - Área de Deportes: Disciplinas Deportivas (Taekwondo, Fútbol, Baloncesto, Natación)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('--- INICIANDO MOTOR DE RENDERIZADO PROGRAMÁTICO DE VIDEO SGA-CD ---');

const outputDir = path.join(__dirname, '..', 'dist', 'assets', 'video');
fs.mkdirSync(outputDir, { recursive: true });
const targetVideoPath = path.join(outputDir, 'promo_sga_cd.mp4');
const frameImagePath = path.join(__dirname, 'storyboard_frame.png');

// Generar el código HTML/CSS/JS intermedio del Storyboard con paleta Dark Metallic Blue (60-30-10)
const storyboardHTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>SGA-CD Promo Video Storyboard</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            width: 1280px;
            height: 720px;
            background-color: #070B14; /* 60% Metal Anodizado Profundo */
            color: #E2E8F0;
            font-family: 'Inter', system-ui, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            box-sizing: border-box;
        }

        .glass-panel {
            background: #0D1424; /* 30% Glassmorphic Surface */
            border: 1px solid rgba(56, 189, 248, 0.3);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            border-radius: 20px;
            padding: 40px;
            width: 80%;
            text-align: center;
            position: relative;
        }

        .glow-title {
            color: #38BDF8; /* 10% Cyan Specular Glow */
            font-size: 2.8rem;
            font-weight: 800;
            margin: 0 0 15px 0;
            letter-spacing: 1px;
            text-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
        }

        .subtitle {
            color: #94A3B8;
            font-size: 1.3rem;
            margin-bottom: 25px;
            line-height: 1.5;
        }

        .taxonomy-pills {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 20px;
        }

        .pill {
            background: rgba(56, 189, 248, 0.15);
            border: 1px solid #38BDF8;
            color: #38BDF8;
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 1.1rem;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="glass-panel">
        <h1 class="glow-title">SGA-CD — Plataforma de Gestión Cultural y Deportiva</h1>
        <p class="subtitle">Seguimiento en Tiempo Real, Control de Asistencia Offline PWA y Acreditación Atlética/Artística</p>
        <div class="taxonomy-pills">
            <div class="pill">Disciplinas Deportivas</div>
            <div class="pill">Talleres Culturales (Danza & Instrumentos)</div>
            <div class="pill">Suscripción Estudiantil Costo 0</div>
        </div>
    </div>
</body>
</html>`;

const frameHTMLPath = path.join(__dirname, 'storyboard_frame.html');
fs.writeFileSync(frameHTMLPath, storyboardHTML, 'utf8');
console.log(`[HyperFrames Engine] HTML de Storyboard generado en: ${frameHTMLPath}`);

try {
    // Renderizar el frame HTML a una imagen PNG usando Python Playwright o Headless Chrome
    console.log('[Headless Engine] Capturando frame de alta fidelidad...');
    const pythonScript = `
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 720})
    page.goto("file://${frameHTMLPath}")
    page.screenshot(path="${frameImagePath}")
    browser.close()
`;
    execSync(`python3 -c '${pythonScript}'`, { stdio: 'inherit' });

    // Compilar el video MP4 localmente utilizando FFmpeg
    console.log('[FFmpeg Engine] Generando video promocional publicitario en formato MP4 (60 FPS)...');
    const ffmpegCmd = `ffmpeg -y -loop 1 -i "${frameImagePath}" -c:v libx264 -t 5 -pix_fmt yuv420p -r 60 "${targetVideoPath}"`;
    execSync(ffmpegCmd, { stdio: 'inherit' });

    console.log(`✅ [ÉXITO] Video promocional publicitario generado correctamente en: ${targetVideoPath}`);
} catch (err) {
    console.error(`[STD-ERR-SECURITY-BREACH] Error al renderizar video promocional:`, err.message);
    process.exit(1);
}
