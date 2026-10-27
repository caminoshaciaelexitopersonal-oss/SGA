import os
import flet as ft
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_ollama import ChatOllama
from langchain_community.llms import LlamaCpp
from typing import Dict, Any, Union, Optional

# Singleton instance for the LLM
_llm_instance = None
_llm_status = "not_initialized"
_active_provider = "none"
_active_model_name = "none"

def initialize_llm(page: ft.Page, config: Dict[str, Any]) -> None:
    """
    Initializes the LLM based on dynamic configuration and device platform.
    Supports Gemma 3 4B (Desktop Ollama) and Phi-3 Mini (GGUF/ONNX) with transparent rules fallback.
    """
    global _llm_instance, _llm_status, _active_provider, _active_model_name

    # Allow re-initialization if failed or explicitly requested
    if _llm_status == "initialized" and not config.get("force_reinit", False):
        return

    _llm_instance = None
    _llm_status = "not_initialized"

    provider = config.get("llm_preference", "local")
    _llm_status = f"initializing_{provider}"
    print(f"--- 🧠 [Desktop] Inicializando LLM con proveedor: '{provider}' ---")

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
        platform = page.platform
        if platform in ["android", "ios"]:
            model_path = config.get("local_model_path", "assets/models/phi-3-mini-4k-instruct.Q4_K_M.gguf")
            if not os.path.exists(model_path):
                _llm_status = "error_local_model_missing"
            else:
                try:
                    llm = LlamaCpp(model_path=model_path, n_ctx=2048, n_gpu_layers=0, verbose=False)
                    _active_provider = "Local LlamaCpp"
                    _active_model_name = "Phi-3 Mini 4K Instruct"
                except Exception as e:
                    print(f"--- ⚠️ Error al cargar modelo GGUF local: {e} ---")
                    _llm_status = "error_loading_local_model"
        else: # Desktop Platform (Windows, Linux, macOS)
            try:
                ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
                model_name = os.getenv("OLLAMA_MODEL", config.get("model_name", "gemma3:4b"))
                llm = ChatOllama(model=model_name, base_url=ollama_url)
                llm.invoke("test")
                _active_provider = f"Ollama Daemon ({ollama_url})"
                _active_model_name = model_name
            except Exception as e:
                print(f"--- ⚠️ Error de conexión con Ollama ({model_name}): {e} ---")
                _llm_status = "error_ollama_not_found"

    elif provider == "rules_based":
        class RulesBasedAssistant:
            def invoke(self, prompt: Any, *args, **kwargs) -> Any:
                class MockResponse:
                    content = " Asistente Basado en Reglas SGA-CD: Procesamiento en modo offline basico activo."
                return MockResponse()

        llm = RulesBasedAssistant()
        _active_provider = "Reglas Locales SGA-CD"
        _active_model_name = "Asistente Basico (Sin IA Local)"

    else:
        _llm_status = "error_unknown_provider"

    if llm and not _llm_status.startswith("error_"):
        _llm_instance = llm
        _llm_status = "initialized"
        print(f"--- ✅ [Desktop] LLM del proveedor '{_active_provider}' ({_active_model_name}) inicializado correctamente. ---")

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
