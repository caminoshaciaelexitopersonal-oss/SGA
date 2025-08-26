import logging
import time
import sys
import os
from jose import jwt
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Add project root to path to allow imports from app and models
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'SGA-CD-DB.git')))

from app.main import app
from app.core.config import settings
from app.api import deps
from models.base import Base

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def verify_auth_flow(client: TestClient):
    """
    Uses the TestClient to verify the register, login, and refresh endpoints.
    """
    logger.info("--- Starting Auth Flow Verification ---")

    # Use a unique username to avoid conflicts with previous runs
    username = f"verify_user_{int(time.time())}"
    password = "password123"
    user_email = f"{username}@sga.com"
    user_role = "profesor"
    user_inquilino_id = 1

    # 1. Register Endpoint
    logger.info(f"1. Attempting to register new user '{username}' with role '{user_role}'...")
    register_data = {
        "email": user_email,
        "password": password,
        "nombre_usuario": username,
        "nombre_completo": "Verification User",
        "rol": user_role,
        "inquilino_id": user_inquilino_id,
    }
    response = client.post(f"{settings.API_V1_STR}/auth/register", json=register_data)
    if response.status_code == 200:
        logger.info(f"✅ [SUCCESS] Registration successful. Status: {response.status_code}")
    else:
        logger.error(f"❌ [FAILURE] Registration failed. Status: {response.status_code}, Response: {response.text}")
        return

    # 2. Login Endpoint
    logger.info(f"2. Attempting to log in as '{username}'...")
    login_data = {"username": username, "password": password}
    response = client.post(f"{settings.API_V1_STR}/auth/login", data=login_data)

    if response.status_code != 200:
        logger.error(f"❌ [FAILURE] Login failed. Status: {response.status_code}, Response: {response.text}")
        return

    logger.info("✅ [SUCCESS] Login successful.")
    token_data = response.json()
    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")

    # 3. Verify Access Token Payload
    logger.info("3. Verifying access token payload...")
    try:
        payload = jwt.decode(access_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert payload["roles"] == [user_role], f"Expected roles {[user_role]} but got {payload['roles']}"
        assert payload["inquilino_id"] == user_inquilino_id, f"Expected inquilino_id {user_inquilino_id} but got {payload['inquilino_id']}"
        logger.info(f"✅ [SUCCESS] Token payload is correct. Roles: {payload.get('roles')}, Inquilino ID: {payload.get('inquilino_id')}")
    except Exception as e:
        logger.error(f"❌ [FAILURE] Token verification failed: {e}")
        return

    # 4. Refresh Endpoint
    logger.info("4. Attempting to refresh token...")
    response = client.post(f"{settings.API_V1_STR}/auth/refresh", json={"refresh_token": refresh_token})

    if response.status_code == 200:
        new_token_data = response.json()
        assert new_token_data.get("access_token") is not None, "Refresh response did not contain a new access token."
        logger.info("✅ [SUCCESS] Token refresh successful.")
    else:
        logger.error(f"❌ [FAILURE] Token refresh failed. Status: {response.status_code}, Response: {response.text}")
        return

    logger.info("\n--- Auth Flow Verification Complete ---")


if __name__ == "__main__":
    logger.info("Setting up in-memory database for verification script...")

    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    Base.metadata.create_all(bind=engine)
    with engine.connect() as connection:
        connection.execute(text("CREATE TABLE roles (id INTEGER NOT NULL, nombre VARCHAR(50) NOT NULL, descripcion TEXT, PRIMARY KEY (id), UNIQUE (nombre))"))
        connection.execute(text("CREATE TABLE user_roles (id INTEGER NOT NULL, user_id INTEGER NOT NULL, role_id INTEGER NOT NULL, PRIMARY KEY (id), FOREIGN KEY(user_id) REFERENCES usuarios (id), FOREIGN KEY(role_id) REFERENCES roles (id), UNIQUE (user_id, role_id))"))
        connection.execute(text("""
            INSERT INTO roles (nombre, descripcion) VALUES
            ('admin_general', 'Super Administrador del Sistema con acceso total.'),
            ('admin_empresa', 'Administrador de una empresa/inquilino específico.'),
            ('jefe_area', 'Jefe de un área específica como Cultura o Deportes.'),
            ('profesional_area', 'Asistente principal del Jefe de Área.'),
            ('tecnico_area', 'Soporte operativo para un área.'),
            ('coordinador', 'Coordina actividades y al personal de instructores.'),
            ('profesor', 'Instructor o profesor que imparte clases.'),
            ('alumno', 'Estudiante que recibe la formación.'),
            ('padre_acudiente', 'Representante legal de uno o más alumnos.'),
            ('jefe_almacen', 'Gestiona el inventario de materiales y equipos.'),
            ('jefe_escenarios', 'Gestiona la disponibilidad de los espacios físicos.')
        """))
        connection.commit()

    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()

    app.dependency_overrides[deps.get_db] = override_get_db

    client = TestClient(app)
    verify_auth_flow(client)

    logger.info("Verification script finished.")
