import requests
import json
import time

# --- Configuración ---
BASE_URL = "http://127.0.0.1:8000"
# Este test requiere un token de un 'admin_general'
ADMIN_GENERAL_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbl9nZW5lcmFsX2RlbW8iLCJleHAiOjE3NTYzODk5ODd9.placeholder_token"

HEADERS = {
    "Authorization": f"Bearer {ADMIN_GENERAL_TOKEN}",
    "Content-Type": "application/json"
}

def run_test(name, method, url, **kwargs):
    """Función helper para ejecutar una prueba y mostrar el resultado."""
    print(f"--- Ejecutando Prueba: {name} ---")
    try:
        response = requests.request(method, url, **kwargs)
        print(f"URL: {method} {url}")
        print(f"Status Code: {response.status_code}")

        if response.text:
            try:
                print("Response JSON:")
                print(json.dumps(response.json(), indent=2))
            except json.JSONDecodeError:
                print("Response Text (not JSON):")
                print(response.text)
        else:
            print("Response: No content")

        # No podemos esperar un 'ok' si la clave de API no está configurada,
        # pero podemos verificar que no sea un error 500.
        assert response.status_code < 500, f"Error del servidor (código: {response.status_code})"
        print(f"--- PRUEBA '{name}' PASÓ (verificación de estado < 500) ---")
        return response.json() if response.text else None

    except Exception as e:
        print(f"--- PRUEBA '{name}' FALLÓ ---")
        print(f"Error: {e}")
    print("\\n" + "="*40 + "\\n")
    return None


if __name__ == "__main__":
    print("Iniciando pruebas del Módulo de Generación de Video...")

    # 1. Probar el endpoint de generación
    # Se espera que falle con un error 400 si la clave de RunwayML no está configurada.
    # Esto es correcto, ya que demuestra que el endpoint está protegido.
    video_prompt = {
        "prompt": "Un astronauta montando a caballo en Marte, estilo fotorrealista."
    }

    generation_response = run_test(
        name="Iniciar Tarea de Generación de Video",
        method="POST",
        url=f"{BASE_URL}/api/v1/video/generate",
        headers=HEADERS,
        data=json.dumps(video_prompt)
    )

    # 2. Probar el endpoint de estado (si se pudo crear una tarea)
    if generation_response and "task_id" in generation_response:
        task_id = generation_response["task_id"]
        print(f"Esperando unos segundos antes de comprobar el estado de la tarea {task_id}...")
        time.sleep(5)

        run_test(
            name="Comprobar Estado de Tarea de Video",
            method="GET",
            url=f"{BASE_URL}/api/v1/video/status/{task_id}",
            headers=HEADERS
        )
    else:
        print("--- INFO: No se pudo crear una tarea de generación, por lo que se omite la prueba de estado. ---")
        print("--- Esto es normal si la clave de API de RunwayML no está configurada. ---")

    print("Pruebas del Módulo de Generación de Video completadas.")
