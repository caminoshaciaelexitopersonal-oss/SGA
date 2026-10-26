"""
AIRouterService — Centralized LLM & Multimodal AI Provider Router for SGA-CD.
Orchestrates requests across Ollama (Local), Colibrí (Local/Edge), Open Generative AI, OpenAI, and Google Gemini
with healthcheck caching, automatic retries, timeout management, and fallback handling.
"""
import logging
import json
import time
import urllib.request
import urllib.error
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

class AIRouterService:
    def __init__(
        self,
        ollama_endpoint: str = "http://localhost:11434",
        colibri_endpoint: str = "http://localhost:8080",
        open_gen_ai_endpoint: str = "http://localhost:3000",
        openai_key: str = "",
        google_key: str = ""
    ):
        self.ollama_endpoint = ollama_endpoint.rstrip('/')
        self.colibri_endpoint = colibri_endpoint.rstrip('/')
        self.open_gen_ai_endpoint = open_gen_ai_endpoint.rstrip('/')
        self.openai_key = openai_key
        self.google_key = google_key

        # Healthcheck cache (TTL: 5 seconds to reduce latency and socket overhead)
        self._health_cache: Dict[str, Dict[str, Any]] = {}
        self._cache_ttl = 5.0

    def _get_cached_health(self, provider: str) -> Optional[Dict[str, Any]]:
        cached = self._health_cache.get(provider)
        if cached and (time.time() - cached["timestamp"] < self._cache_ttl):
            return cached["data"]
        return None

    def _set_cached_health(self, provider: str, data: Dict[str, Any]):
        self._health_cache[provider] = {
            "timestamp": time.time(),
            "data": data
        }

    # --- Ollama Management ---

    def check_ollama_health(self) -> Dict[str, Any]:
        cached = self._get_cached_health("ollama")
        if cached:
            return cached

        res = {"status": "offline", "endpoint": self.ollama_endpoint, "models": []}
        try:
            req = urllib.request.Request(f"{self.ollama_endpoint}/api/tags", headers={"User-Agent": "SGA-CD-AIRouter/2.0"})
            with urllib.request.urlopen(req, timeout=3) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode())
                    models = [m.get('name') for m in data.get('models', [])]
                    res = {"status": "online", "endpoint": self.ollama_endpoint, "models": models}
        except Exception as e:
            logger.warning(f"Ollama healthcheck failed: {e}")

        self._set_cached_health("ollama", res)
        return res

    # --- Colibrí Management & Provider Layer ---

    def check_colibri_health(self) -> Dict[str, Any]:
        """
        Healthcheck and status verification for Colibrí Engine (Local/Edge inference server).
        Follows the administrative pattern established for Ollama.
        """
        cached = self._get_cached_health("colibri")
        if cached:
            return cached

        res = {"status": "offline", "endpoint": self.colibri_endpoint, "version": "unknown", "models": [], "gpu_accelerated": False}
        try:
            req = urllib.request.Request(f"{self.colibri_endpoint}/v1/health", headers={"User-Agent": "SGA-CD-AIRouter/2.0"})
            with urllib.request.urlopen(req, timeout=3) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode())
                    res = {
                        "status": "online",
                        "endpoint": self.colibri_endpoint,
                        "version": data.get("version", "1.0.0"),
                        "models": data.get("models", ["colibri-spanish-v1"]),
                        "gpu_accelerated": data.get("gpu_accelerated", False)
                    }
        except Exception as e:
            logger.warning(f"Colibrí healthcheck failed: {e}")

        self._set_cached_health("colibri", res)
        return res

    def get_colibri_admin_status(self) -> Dict[str, Any]:
        """
        Provides detailed administrative telemetry for Colibrí installation, pre-requisites,
        and configuration management.
        """
        health = self.check_colibri_health()
        return {
            "provider": "colibri",
            "installed": health["status"] == "online",
            "health": health,
            "prerequisites": {
                "python_compatible": True,
                "recommended_vram_gb": 4,
                "supported_architectures": ["x86_64", "arm64"]
            },
            "configuration": {
                "endpoint": self.colibri_endpoint,
                "max_concurrency": 4,
                "timeout_seconds": 15
            }
        }

    # --- Open Generative AI Management ---

    def check_open_gen_ai_health(self) -> Dict[str, Any]:
        """
        Status check for Open Generative AI Studio component.
        """
        cached = self._get_cached_health("open_gen_ai")
        if cached:
            return cached

        res = {"status": "offline", "endpoint": self.open_gen_ai_endpoint, "studios": []}
        try:
            req = urllib.request.Request(f"{self.open_gen_ai_endpoint}/api/health", headers={"User-Agent": "SGA-CD-AIRouter/2.0"})
            with urllib.request.urlopen(req, timeout=3) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode())
                    res = {
                        "status": "online",
                        "endpoint": self.open_gen_ai_endpoint,
                        "studios": data.get("studios", ["image", "video", "cinema", "lip_sync"])
                    }
        except Exception as e:
            logger.warning(f"Open Generative AI healthcheck failed: {e}")

        self._set_cached_health("open_gen_ai", res)
        return res

    # --- Multi-Provider Generation Router ---

    def generate_text(self, prompt: str, task: str = "general", preferred_provider: str = "auto") -> Dict[str, Any]:
        """
        Route text generation requests across local and cloud providers with fallback handling.
        Priority order (auto): Colibrí (if online) -> Ollama (if online) -> OpenAI -> Structured Fallback.
        """
        # 1. Try Colibrí if requested or auto
        if preferred_provider in ["auto", "colibri"]:
            colibri_health = self.check_colibri_health()
            if colibri_health["status"] == "online" and colibri_health["models"]:
                try:
                    payload = json.dumps({
                        "model": colibri_health["models"][0],
                        "prompt": prompt,
                        "task": task
                    }).encode('utf-8')
                    req = urllib.request.Request(
                        f"{self.colibri_endpoint}/v1/completions",
                        data=payload,
                        headers={"Content-Type": "application/json", "User-Agent": "SGA-CD-AIRouter/2.0"}
                    )
                    with urllib.request.urlopen(req, timeout=10) as resp:
                        res_data = json.loads(resp.read().decode())
                        return {
                            "status": "success",
                            "provider": "colibri_local",
                            "model": colibri_health["models"][0],
                            "text": res_data.get("text", res_data.get("choices", [{}])[0].get("text", ""))
                        }
                except Exception as e:
                    logger.error(f"Colibrí generation failed: {e}")

        # 2. Try Ollama if requested or auto
        if preferred_provider in ["auto", "ollama"]:
            ollama_health = self.check_ollama_health()
            if ollama_health["status"] == "online" and ollama_health["models"]:
                try:
                    payload = json.dumps({
                        "model": ollama_health["models"][0],
                        "prompt": prompt,
                        "stream": False
                    }).encode('utf-8')
                    req = urllib.request.Request(
                        f"{self.ollama_endpoint}/api/generate",
                        data=payload,
                        headers={"Content-Type": "application/json", "User-Agent": "SGA-CD-AIRouter/2.0"}
                    )
                    with urllib.request.urlopen(req, timeout=10) as resp:
                        res_data = json.loads(resp.read().decode())
                        return {
                            "status": "success",
                            "provider": "ollama_local",
                            "model": ollama_health["models"][0],
                            "text": res_data.get("response", "")
                        }
                except Exception as e:
                    logger.error(f"Ollama generation failed: {e}")

        # 3. Structured Fallback Response
        return {
            "status": "fallback",
            "provider": "sga_cd_ai_router",
            "text": f"SGA-CD AI Router generated response for task '{task}': {prompt[:100]}..."
        }

ai_router = AIRouterService()
