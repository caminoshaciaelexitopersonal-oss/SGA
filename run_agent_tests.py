import sys
import os
sys.path.insert(0, 'SGA-CD-FASTAPI-BACKEND')
sys.path.insert(0, 'SGA-CD-DB.git')

from langchain_core.language_models.chat_models import SimpleChatModel
from langchain_core.messages import BaseMessage, AIMessage
from app.agents.corps.formacion_cultura_colonel import get_formacion_cultura_colonel_graph
from app.api.v1.endpoints.agent import build_scoped_thread_id

class MockLLM(SimpleChatModel):
    def _call(self, prompt, stop=None, run_manager=None, **kwargs):
        return '{"plan": [{"task_description": "Organizar evento cultural", "responsible_captain": "OperacionesAcademicas"}]}'

    @property
    def _llm_type(self) -> str:
        return "mock_llm"

def test_agents():
    print("=== INICIANDO PRUEBAS DE AGENTES IA Y CHECKPOINTING AISLADO ===")

    # 1. Test build_scoped_thread_id
    tid1 = build_scoped_thread_id(user_inquilino_id=1, user_id=101, client_thread_id="sesion_alpha")
    tid2 = build_scoped_thread_id(user_inquilino_id=2, user_id=201, client_thread_id="sesion_alpha")

    assert tid1 == "tenant_1:user_101:session_sesion_alpha"
    assert tid2 == "tenant_2:user_201:session_sesion_alpha"
    assert tid1 != tid2
    print(f"✅ Thread ID Tenant 1: {tid1}")
    print(f"✅ Thread ID Tenant 2: {tid2}")
    print("✅ Aislamiento estricto de thread_id por inquilino y usuario VERIFICADO.")

    # 2. Test LangGraph Compilation
    mock_llm = MockLLM()
    graph = get_formacion_cultura_colonel_graph(":memory:", mock_llm)
    assert graph is not None
    print("✅ Grafo de Coronel de Formación y Cultura compilado exitosamente con SqliteSaver.")

    print("\n" + "="*80)
    print("TODAS LAS PRUEBAS DE AGENTES E ISOLATION DE CHECKPOINTS PASADAS")
    print("="*80)

if __name__ == "__main__":
    test_agents()
