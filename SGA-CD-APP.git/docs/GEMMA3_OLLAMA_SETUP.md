# Guía de Inicio Rápido: SGA-CD Desktop con Gemma 3 4B (Ollama)

Esta guía explica cómo ejecutar la aplicación de escritorio SGA-CD conectada localmente al modelo **Gemma 3 4B** utilizando Ollama en Windows.

---

## 1. Requisitos Previos

- **Windows 10 / 11** (64-bit).
- **Ollama para Windows** instalado desde el sitio oficial ([https://ollama.com/download/windows](https://ollama.com/download/windows) o paquete oficial `OllamaSetup.exe`).
- **Python 3.10+** instalado con las dependencias del proyecto (`pip install -r requirements.txt`).

---

## 2. Instalación del Modelo Gemma 3 4B

Si ya instaló Ollama para Windows, abra una consola de comandos (PowerShell / CMD) y ejecute:

```cmd
ollama pull gemma3:4b
```

Para verificar que el modelo esté instalado y reconocido:

```cmd
ollama list
```

Debe figurar `gemma3:4b` en la lista de modelos locales.

---

## 3. Inicio en Un Solo Clic (Windows)

En la carpeta `SGA-CD-APP.git/`, ejecute el script:

```cmd
start_desktop_ollama.bat
```

Este script automatiza los siguientes pasos:
1. Comprueba si el servicio de Ollama está escuchando en `http://localhost:11434`. Si no es así, lo inicia con `ollama serve`.
2. Verifica que `gemma3:4b` esté descargado.
3. Establece las variables de entorno `OLLAMA_BASE_URL=http://localhost:11434` y `OLLAMA_MODEL=gemma3:4b`.
4. Lanza la aplicación SGA-CD Flet Desktop (`python main.py`).

---

## 4. Configuración Manual (Opcional)

Si desea ejecutar manualmente los comandos:

1. Inicie el servicio local de Ollama:
   ```cmd
   ollama serve
   ```
2. En otra ventana de terminal, navegue a la carpeta `SGA-CD-APP.git/` y ejecute:
   ```cmd
   set OLLAMA_BASE_URL=http://localhost:11434
   set OLLAMA_MODEL=gemma3:4b
   python main.py
   ```

---

## 5. Ubicación de Almacenamiento del Modelo

En Windows, Ollama almacena los pesos del modelo Gemma 3 4B en:
`C:\Users\<TuUsuario>\.ollama\models\` (subcarpetas `manifests` y `blobs`).
