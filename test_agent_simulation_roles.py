import sys
import os
import time
import pytest
from unittest.mock import patch

sys.path.insert(0, 'SGA-CD-DB.git')
sys.path.insert(0, 'SGA-CD-FASTAPI-BACKEND')

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.api import deps
from models.base import Base
from models.user import Usuario, RolesEnum
from models.tenancy import Inquilino
from app.api.v1.endpoints.agent import build_scoped_thread_id, sanitize_prompt_for_ai
from app.core.security import create_access_token, get_password_hash

# Setup test DB with full SQLAlchemy ORM models
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[deps.get_db] = override_get_db

def test_agent_troop_interaction_simulation():
    print("=" * 80)
    print("🤖 PRUEBA DE INTERACCIÓN DE TROPA DE AGENTES IA (GENERAL A SARGENTOS)")
    print("   SIMULACIÓN: Profesores, Alumnos y Administradores (Comandos Texto / Voz)")
    print("=" * 80)

    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # Populate Tenants
    t1 = Inquilino(id=1, nombre_empresa="Entidad Alpha")
    t2 = Inquilino(id=2, nombre_empresa="Entidad Beta")
    db.add_all([t1, t2])
    db.commit()

    # Populate Users
    u_prof = Usuario(
        id=101, inquilino_id=1, nombre_usuario="prof_deportes_t1",
        correo="prof1@deportes.edu.co", password_hash=get_password_hash("pass"),
        rol=RolesEnum.profesor, activo=True, nombre_completo="Profesor Deportes T1"
    )
    u_student = Usuario(
        id=102, inquilino_id=1, nombre_usuario="student_t1",
        correo="student1@deportes.edu.co", password_hash=get_password_hash("pass"),
        rol=RolesEnum.alumno, activo=True, nombre_completo="Estudiante T1"
    )
    db.add_all([u_prof, u_student])
    db.commit()

    # 1. Probar la función de sanitización de comandos de voz / texto
    raw_prompt_profesor = "Registrar asistencia de la clase de Fútbol del Inquilino 1. Mi clave: secret123 y mi tarjeta 4532-1111-2222-3333"
    clean_prompt = sanitize_prompt_for_ai(raw_prompt_profesor)

    assert "secret123" not in clean_prompt or "[PASSWORD_REDACTADO]" in clean_prompt
    assert "[TARJETA_CREDITO_REDACTADA]" in clean_prompt
    print("✅ 1. Sanitizador de comandos de voz/texto en lenguaje natural: OK")

    # 2. Probar aislamiento de hilos por usuario y tenant en la simulación
    thread_profesor_1 = build_scoped_thread_id(user_inquilino_id=1, user_id=101, client_thread_id="clase_futbol_manana")
    thread_profesor_2 = build_scoped_thread_id(user_inquilino_id=2, user_id=201, client_thread_id="clase_futbol_manana")

    assert thread_profesor_1 == "tenant_1:user_101:session_clase_futbol_manana"
    assert thread_profesor_2 == "tenant_2:user_201:session_clase_futbol_manana"
    assert thread_profesor_1 != thread_profesor_2
    print(f"✅ 2. Aislamiento de Thread ID entre Inquilinos (Tenant 1 vs Tenant 2): OK")
    print(f"   -> Thread Profesor Inquilino 1: {thread_profesor_1}")
    print(f"   -> Thread Profesor Inquilino 2: {thread_profesor_2}")

    # 3. Simular interacciones de roles utilizando la API del backend
    client = TestClient(app)

    token_profesor = create_access_token({"sub": "101", "roles": ["profesor"], "inquilino_id": 1})
    headers_profesor = {"Authorization": f"Bearer {token_profesor}"}

    token_alumno = create_access_token({"sub": "102", "roles": ["alumno"], "inquilino_id": 1})
    headers_alumno = {"Authorization": f"Bearer {token_alumno}"}

    test_orders = [
        (
            "Profesor de Deportes (Hands-Free / Voz)",
            headers_profesor,
            "Registrar asistencia para el grupo de Fútbol en el plan de Febrero sin usar las manos",
            "Cultura"
        ),
        (
            "Profesor de Cultura (Hands-Free / Voz)",
            headers_profesor,
            "Verificar la lista de canciones y partituras para la gala de la Noche de los Mejores en Diciembre",
            "Cultura"
        ),
        (
            "Alumno (Consulta Lenguaje Natural)",
            headers_alumno,
            "Consultar mis medallas y puntos acumulados para la premiación de fin de año",
            "Cultura"
        )
    ]

    async def mock_agent_run(prompt, thread_id, area):
        return {
            "text": f"Misión ejecutada por la Tropa de Agentes (General -> Coronel -> Sargento) para thread '{thread_id}'. Comando procesado: '{prompt}'",
            "image_url": None
        }

    with patch("app.api.v1.endpoints.agent.run_agent", side_effect=mock_agent_run):
        print("\n[3] EJECUTANDO ÓRDENES DE INTERACCIÓN DE USUARIOS CON LOS AGENTES DE IA:")
        for role_name, headers, prompt_text, area in test_orders:
            payload = {
                "prompt": prompt_text,
                "thread_id": "sesion_hands_free_001",
                "area": area
            }
            response = client.post("/api/v1/agent/invoke", json=payload, headers=headers)
            assert response.status_code == 200
            res_data = response.json()
            assert "text" in res_data
            print(f"   • [{role_name}]: '{prompt_text[:60]}...'")
            print(f"     └─ Respuesta del Agente: {res_data['text'][:110]}...")

    print("\n" + "=" * 80)
    print("🎉 PRUEBA DE INTERACCIÓN DE AGENTES IA POR ROLES FINALIZADA CON ÉXITO")
    print("=" * 80)

if __name__ == "__main__":
    test_agent_troop_interaction_simulation()
