#!/usr/bin/env python3
"""
SGA-CD PoC Phi-3 Mini Test Script using ONNX Runtime GenAI
Executes offline inference for SGA-CD assistant domain prompts.
Measures initial load time, TTFT (Time To First Token), TPS (Tokens Per Second), and RAM usage.
"""

import sys
import os
import time
import json
import psutil

try:
    import onnxruntime_genai as og
except ImportError:
    print("Error: onnxruntime_genai is not installed.")
    sys.exit(1)

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "weights"))
REPORT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "reports"))
REPORT_FILE = os.path.join(REPORT_DIR, "INFERENCE_RESULTS.json")

PROMPTS = [
    {
        "id": "q1",
        "prompt": "¿Qué puedes hacer como asistente de una plataforma deportiva y cultural?"
    },
    {
        "id": "q2",
        "prompt": "Explícame cómo orientarías a un profesor que necesita registrar una actividad."
    },
    {
        "id": "q3",
        "prompt": "Si no conoces el procedimiento oficial, ¿cómo debes responder?"
    }
]

def get_ram_mb():
    process = psutil.Process(os.getpid())
    return process.memory_info().rss / (1024 * 1024)

def run_poc():
    print("=== INICIANDO PoC PHI-3 MINI (ONNX INT4) ===")
    print(f"Modelo en: {MODEL_DIR}")

    ram_before = get_ram_mb()
    t_start_load = time.perf_counter()

    print("Cargando modelo y tokenizer con ONNX Runtime GenAI...")
    try:
        model = og.Model(MODEL_DIR)
        tokenizer = og.Tokenizer(model)
    except Exception as e:
        print(f"Error durante la carga del modelo: {e}")
        sys.exit(1)

    t_load = time.perf_counter() - t_start_load
    ram_loaded = get_ram_mb()
    print(f"Modelo cargado exitosamente en {t_load:.2f}s | RAM consumida por proceso: {ram_loaded:.2f} MB (+{ram_loaded - ram_before:.2f} MB)")

    results = {
        "load_time_seconds": round(t_load, 3),
        "ram_before_load_mb": round(ram_before, 2),
        "ram_loaded_mb": round(ram_loaded, 2),
        "prompts_results": []
    }

    for item in PROMPTS:
        q_id = item["id"]
        prompt_text = item["prompt"]
        print(f"\n--- Probando Pregunta [{q_id}]: {prompt_text} ---")

        full_prompt = f"<|user|>\n{prompt_text}<|end|>\n<|assistant|>\n"

        tokens = tokenizer.encode(full_prompt)
        params = og.GeneratorParams(model)
        params.set_search_options(max_length=256, temperature=0.3)

        generator = og.Generator(model, params)
        generator.append_tokens(tokens)
        tokenizer_stream = tokenizer.create_stream()

        t_start_gen = time.perf_counter()
        t_first_token = None
        generated_tokens = []
        generated_text_chunks = []

        while not generator.is_done():
            generator.generate_next_token()
            if t_first_token is None:
                t_first_token = time.perf_counter()

            new_token = generator.get_next_tokens()[0]
            generated_tokens.append(new_token)
            chunk = tokenizer_stream.decode(new_token)
            generated_text_chunks.append(chunk)
            print(chunk, end="", flush=True)

        t_end_gen = time.perf_counter()
        print() # newline

        full_response = "".join(generated_text_chunks)
        ttft = (t_first_token - t_start_gen) if t_first_token else 0
        total_gen_time = t_end_gen - t_start_gen
        num_tokens = len(generated_tokens)
        tps = (num_tokens / total_gen_time) if total_gen_time > 0 else 0
        ram_after = get_ram_mb()

        print(f"[Métricas] Tokens: {num_tokens} | TTFT: {ttft*1000:.1f}ms | Tiempo Total: {total_gen_time:.2f}s | Speed: {tps:.2f} tok/s | RAM: {ram_after:.2f} MB")

        results["prompts_results"].append({
            "id": q_id,
            "prompt": prompt_text,
            "response": full_response.strip(),
            "tokens_generated": num_tokens,
            "ttft_ms": round(ttft * 1000, 2),
            "total_gen_time_s": round(total_gen_time, 2),
            "tokens_per_second": round(tps, 2),
            "ram_after_mb": round(ram_after, 2)
        })

    os.makedirs(REPORT_DIR, exist_ok=True)
    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\nResultados guardados en: {REPORT_FILE}")

if __name__ == "__main__":
    run_poc()
