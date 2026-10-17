import sys
import os
sys.path.insert(0, 'SGA-CD-FASTAPI-BACKEND')
sys.path.insert(0, 'SGA-CD-DB.git')

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.api import deps
from models.base import Base
from models.tenancy import Inquilino
from models.user import Usuario, Role, RolesEnum, Alumno
from models.academic import Notificacion, Clase, Escenario
from models.communication import ChatConversacion, ChatParticipante
from app.core.security import create_access_token, get_password_hash

# Setup test DB
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

def run_tests():
    print("=== INICIANDO SUITE DE PRUEBAS AUTOMATIZADAS DE AISLAMIENTO MULTIINQUILINO ===")
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # Populate roles
    with engine.connect() as conn:
        conn.execute(text("""
            INSERT OR IGNORE INTO roles (id, nombre, descripcion) VALUES
            (1, 'admin_general', 'Super Admin'),
            (2, 'admin_empresa', 'Admin Tenant'),
            (3, 'jefe_area', 'Jefe Area'),
            (4, 'profesional_area', 'Profesional Area'),
            (5, 'tecnico_area', 'Tecnico Area'),
            (6, 'coordinador', 'Coordinador'),
            (7, 'profesor', 'Profesor'),
            (8, 'alumno', 'Alumno'),
            (9, 'padre_acudiente', 'Padre Acudiente'),
            (10, 'jefe_almacen', 'Jefe Almacen'),
            (11, 'almacenista', 'Almacenista'),
            (12, 'jefe_escenarios', 'Jefe Escenarios')
        """))
        conn.commit()

    # Create Tenants 1 and 2
    t1 = Inquilino(id=1, nombre_empresa="Tenant Alpha")
    t2 = Inquilino(id=2, nombre_empresa="Tenant Beta")
    db.add_all([t1, t2])
    db.commit()

    # Create Users for Tenant 1
    u1_admin = Usuario(
        id=101, inquilino_id=1, nombre_usuario="admin_t1",
        password_hash=get_password_hash("pass"), rol=RolesEnum.admin_empresa, activo=True
    )
    u1_student = Usuario(
        id=102, inquilino_id=1, nombre_usuario="student_t1",
        password_hash=get_password_hash("pass"), rol=RolesEnum.alumno, activo=True
    )

    # Create Users for Tenant 2
    u2_admin = Usuario(
        id=201, inquilino_id=2, nombre_usuario="admin_t2",
        password_hash=get_password_hash("pass"), rol=RolesEnum.admin_empresa, activo=True
    )
    u2_student = Usuario(
        id=202, inquilino_id=2, nombre_usuario="student_t2",
        password_hash=get_password_hash("pass"), rol=RolesEnum.alumno, activo=True
    )

    db.add_all([u1_admin, u1_student, u2_admin, u2_student])
    db.commit()

    # Create Student profiles
    a1 = Alumno(id=10, usuario_id=102, inquilino_id=1)
    a2 = Alumno(id=20, usuario_id=202, inquilino_id=2)
    db.add_all([a1, a2])
    db.commit()

    # Generate tokens with str(sub)
    token_t1_admin = create_access_token({"sub": "101", "roles": ["admin_empresa"], "inquilino_id": 1})
    token_t1_student = create_access_token({"sub": "102", "roles": ["alumno"], "inquilino_id": 1})
    token_t2_admin = create_access_token({"sub": "201", "roles": ["admin_empresa"], "inquilino_id": 2})

    headers_t1_admin = {"Authorization": f"Bearer {token_t1_admin}"}
    headers_t1_student = {"Authorization": f"Bearer {token_t1_student}"}
    headers_t2_admin = {"Authorization": f"Bearer {token_t2_admin}"}

    client = TestClient(app)
    results = []

    # --- 1. TEST EVENTOS ---
    # Unauthenticated
    r = client.get("/api/v1/eventos/")
    results.append(("EVENTOS - Acceso Anónimo", r.status_code == 401, f"Status: {r.status_code}"))

    # Create Event in Tenant 1
    ev_payload = {
        "nombre": "Feria de Ciencias T1", "tipo": "evento", "alcance": "regional",
        "area": "Cultura", "inquilino_id": 1, "creado_por_usuario_id": 101
    }
    r = client.post("/api/v1/eventos/", headers=headers_t1_admin, json=ev_payload)
    results.append(("EVENTOS - Creación Legítima T1", r.status_code == 200, f"Status: {r.status_code}"))

    # Create Event in Tenant 2 with Tenant 1 Token (Cross-Tenant Attack)
    ev_cross_payload = {
        "nombre": "Ataque Evento", "tipo": "evento", "alcance": "regional",
        "area": "Cultura", "inquilino_id": 2, "creado_por_usuario_id": 101
    }
    r = client.post("/api/v1/eventos/", headers=headers_t1_admin, json=ev_cross_payload)
    results.append(("EVENTOS - Ataque Creación Cross-Tenant (Rechazado 403)", r.status_code == 403, f"Status: {r.status_code}"))

    # List Events with Tenant 2 Token (Should see 0 events)
    r = client.get("/api/v1/eventos/", headers=headers_t2_admin)
    results.append(("EVENTOS - Lectura Aislada T2 (0 eventos de T1 visibles)", r.status_code == 200 and len(r.json()) == 0, f"Items: {len(r.json())}"))

    # --- 2. TEST PROCESOS DE FORMACIÓN ---
    proc_payload = {"nombre_proceso": "Proceso Deportes T1", "tipo_proceso": "Formación", "inquilino_id": 1}
    r = client.post("/api/v1/procesos/", headers=headers_t1_admin, json=proc_payload)
    results.append(("PROCESOS - Creación Legítima T1", r.status_code == 200, f"Status: {r.status_code}"))
    proc_id = r.json()["id"] if r.status_code == 200 else 1

    # Read Proceso from Tenant 2 (Cross-Tenant Read Attack)
    r = client.get(f"/api/v1/procesos/{proc_id}", headers=headers_t2_admin)
    results.append(("PROCESOS - Lectura Cross-Tenant por ID (Rechazado 404)", r.status_code == 404, f"Status: {r.status_code}"))

    # --- 3. TEST INVENTARIO ---
    elem_payload = {"codigo": "BALON-001", "descripcion": "Balón Fútbol", "inquilino_id": 1}
    r = client.post("/api/v1/inventory/elementos/", headers=headers_t1_admin, json=elem_payload)
    results.append(("INVENTARIO - Creación Legítima Elemento T1", r.status_code == 200, f"Status: {r.status_code}"))

    # List elements for Tenant 2 (Should see 0 elements)
    r = client.get("/api/v1/inventory/elementos/", headers=headers_t2_admin)
    results.append(("INVENTARIO - Lectura Aislada T2 (0 elementos de T1)", r.status_code == 200 and len(r.json()) == 0, f"Items: {len(r.json())}"))

    # --- 4. TEST GAMIFICACIÓN ---
    acc_payload = {"accion_key": "ASISTENCIA_PUNTUAL", "puntos": 10, "inquilino_id": 1}
    r = client.post("/api/v1/gamification/acciones/", headers=headers_t1_admin, json=acc_payload)
    results.append(("GAMIFICACIÓN - Creación Acción T1", r.status_code == 200, f"Status: {r.status_code}"))

    # List actions for Tenant 2
    r = client.get("/api/v1/gamification/acciones/", headers=headers_t2_admin)
    results.append(("GAMIFICACIÓN - Lectura Aislada T2", r.status_code == 200 and len(r.json()) == 0, f"Items: {len(r.json())}"))

    # --- 5. TEST NOTIFICACIONES (ABAC) ---
    n1 = Notificacion(id=1, inquilino_id=1, usuario_id=101, mensaje="Notif T1 Admin")
    n2 = Notificacion(id=2, inquilino_id=1, usuario_id=102, mensaje="Notif T1 Student")
    db.add_all([n1, n2])
    db.commit()

    # Student 1 attempts to mark Admin 1's notification as read
    r = client.put("/api/v1/notificaciones/1/read", headers=headers_t1_student)
    results.append(("NOTIFICACIONES - Ataque ABAC (Marcar leída notif ajena)", r.status_code == 404, f"Status: {r.status_code}"))

    from datetime import datetime, timezone
    # --- 6. TEST CHAT COMUNICACIÓN (ABAC) ---
    conv1 = ChatConversacion(id=1, inquilino_id=1, fecha_creacion=datetime.now(timezone.utc))
    db.add(conv1)
    db.commit()
    p1 = ChatParticipante(conversacion_id=1, usuario_id=101)
    db.add(p1)
    db.commit()

    # Student 1 (Not a participant of Conv 1) attempts to send a message to Conv 1
    msg_payload = {"conversacion_id": 1, "remitente_usuario_id": 102, "contenido": "Mensaje no autorizado"}
    r = client.post("/api/v1/communication/chat/mensajes/", headers=headers_t1_student, json=msg_payload)
    results.append(("CHAT - Ataque ABAC Participante (Inyectar mensaje)", r.status_code == 403, f"Status: {r.status_code}"))

    # --- 7. TEST ALUMNOS PROGRESO ---
    r = client.get("/api/v1/alumnos/102/progreso", headers=headers_t1_admin)
    results.append(("ALUMNOS - Progreso Académico Dinámico T1", r.status_code == 200 and "asistencia_porcentaje" in r.json(), f"Data: {r.json()}"))

    # --- IMPRIMIR RESULTADOS ---
    print("\n" + "="*80)
    print("RESUMEN DE PRUEBAS DE SEGURIDAD MULTIINQUILINO Y REGRESIÓN")
    print("="*80)
    passed = 0
    failed = 0
    for name, success, detail in results:
        status_str = "PASS" if success else "FAIL"
        if success: passed += 1
        else: failed += 1
        print(f"[{status_str}] {name} -> {detail}")

    print("="*80)
    print(f"TOTAL PRUEBAS: {len(results)} | PASADAS: {passed} | FALLADAS: {failed}")
    print("="*80)

if __name__ == "__main__":
    run_tests()
