import os
import sys
import flet as ft
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.llms import LlamaCpp
from typing import Dict, Any, Union, Optional

# Singleton instance for the LLM
_llm_instance = None
_llm_status = "not_initialized"
_active_provider = "none"
_active_model_name = "none"

class ONNXPhi3Assistant:
    """Wrapper class for ONNX Runtime GenAI Phi-3 Mini CPU INT4 execution on Mobile."""
    def __init__(self, model_dir: str):
        import onnxruntime_genai as og
        self.model = og.Model(model_dir)
        self.tokenizer = og.Tokenizer(self.model)

    def invoke(self, prompt: str, *args, **kwargs) -> Any:
        import onnxruntime_genai as og
        full_prompt = f"<|user|>\n{prompt}<|end|>\n<|assistant|>"
        tokens = self.tokenizer.encode(full_prompt)
        params = og.GeneratorParams(self.model)
        params.set_search_options(max_length=512)
        params.input_ids = tokens

        generator = og.Generator(self.model, params)
        response_text = ""
        while not generator.is_done():
            generator.compute_logits()
            generator.generate_next_token()
            new_token = generator.get_next_tokens()[0]
            response_text += self.tokenizer.decode(new_token)

        class MockResponse:
            def __init__(self, text):
                self.content = text
        return MockResponse(response_text)


def initialize_llm(page: ft.Page, config: Dict[str, Any]) -> None:
    """
    Initializes the LLM for SGA-CD Mobile App based on dynamic configuration and device platform.
    Supports Phi-3 Mini (ONNX CPU INT4 / GGUF LlamaCpp) with transparent rules fallback.
    """
    global _llm_instance, _llm_status, _active_provider, _active_model_name

    if _llm_status == "initialized" and not config.get("force_reinit", False):
        return

    _llm_instance = None
    _llm_status = "not_initialized"

    provider = config.get("llm_preference", "local")
    _llm_status = f"initializing_{provider}"
    print(f"--- 🧠 [Mobile] Inicializando LLM con proveedor: '{provider}' ---")

    llm = None
    if provider == "openai":
        api_key = config.get("openai_api_key")
        if not api_key:
            _llm_status = "error_openai_key_missing"
        else:
            llm = ChatOpenAI(api_key=api_key, model="gpt-4o", temperature=0)
            _active_provider = "OpenAI Remote API"
            _active_model_name = "gpt-4o"

    elif provider == "google":
        api_key = config.get("google_api_key")
        if not api_key:
            _llm_status = "error_google_key_missing"
        else:
            llm = ChatGoogleGenerativeAI(google_api_key=api_key, model="gemini-1.5-flash")
            _active_provider = "Google Gemini API"
            _active_model_name = "gemini-1.5-flash"

    elif provider == "local":
        onnx_dir = os.path.join(os.path.dirname(__file__), "..", "ai-lab", "phi-3-mini", "weights")
        gguf_path = config.get("local_model_path", "assets/models/phi-3-mini-4k-instruct.Q4_K_M.gguf")

        # Priority 1: ONNX Runtime GenAI if weights exist
        if os.path.exists(os.path.join(onnx_dir, "phi3-mini-4k-instruct-cpu-int4-rtn-block-32-acc-level-4.onnx")):
            try:
                llm = ONNXPhi3Assistant(onnx_dir)
                _active_provider = "ONNX Runtime GenAI CPU INT4"
                _active_model_name = "Phi-3 Mini 4K Instruct (ONNX)"
                print("--- 📱 Cargado modelo local Phi-3 Mini mediante ONNX Runtime GenAI ---")
            except Exception as e:
                print(f"--- ⚠️ Error al instanciar ONNX Runtime GenAI: {e} ---")

        # Priority 2: Fallback to GGUF via LlamaCpp
        if not llm and os.path.exists(gguf_path):
            try:
                llm = LlamaCpp(model_path=gguf_path, n_ctx=2048, n_gpu_layers=0, verbose=False)
                _active_provider = "Local LlamaCpp GGUF"
                _active_model_name = "Phi-3 Mini 4K Instruct (GGUF Q4)"
                print("--- 📱 Cargado modelo local Phi-3 Mini mediante LlamaCpp GGUF ---")
            except Exception as e:
                print(f"--- ⚠️ Error al cargar modelo GGUF local: {e} ---")

        if not llm:
            _llm_status = "error_local_model_missing"

    elif provider == "rules_based":
        class RulesBasedAssistant:
            def invoke(self, prompt: Any, *args, **kwargs) -> Any:
                class MockResponse:
                    content = "📱 Asistente Basado en Reglas SGA-CD Móvil: Procesamiento local básico activo por restricciones de hardware."
                return MockResponse()

        llm = RulesBasedAssistant()
        _active_provider = "Reglas Locales SGA-CD Móvil"
        _active_model_name = "Asistente Básico (Sin IA Local)"

    else:
        _llm_status = "error_unknown_provider"

    if llm and not _llm_status.startswith("error_"):
        _llm_instance = llm
        _llm_status = "initialized"
        print(f"--- ✅ [Mobile] LLM del proveedor '{_active_provider}' ({_active_model_name}) inicializado correctamente. ---")

def get_llm_instance() -> Any:
    """Returns the singleton LLM instance."""
    return _llm_instance

def get_llm_status() -> str:
    """Returns the current status of the LLM initialization."""
    return _llm_status

def get_llm_info() -> Dict[str, str]:
    """Returns detailed information about the active LLM provider and model."""
    return {
        "status": _llm_status,
        "provider": _active_provider,
        "model": _active_model_name
    }
