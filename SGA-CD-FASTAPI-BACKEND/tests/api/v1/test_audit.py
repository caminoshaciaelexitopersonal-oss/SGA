from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app import crud
from app.schemas.user import UserCreate
from models.tenancy import Inquilino

def create_test_tenant(db: Session) -> Inquilino:
    """Helper to create a tenant for tests."""
    tenant = db.query(Inquilino).filter(Inquilino.id == 1).first()
    if not tenant:
        tenant = Inquilino(id=1, nombre_empresa="Test Tenant Inc.")
        db.add(tenant)
        db.commit()
        db.refresh(tenant)
    return tenant

def get_auth_headers(client: TestClient, db: Session, username: str, password: str = "testpassword") -> dict:
    """Helper to log in and get auth headers."""
    login_data = {
        "username": username,
        "password": password,
    }
    response = client.post("/api/v1/auth/login/access-token", data=login_data)
    if response.status_code != 200:
        # Create the user if they don't exist
        if "Incorrect username or password" in response.text:
            # This is a bit of a hack for testing, we create users on the fly
            # In a real app, you might pre-populate the test DB
            if "admin" in username:
                role = "admin_empresa"
            else:
                role = "alumno"
            user_in = UserCreate(
                nombre_usuario=username,
                email=f"{username}@test.com",
                password=password,
                inquilino_id=1,
                rol=role,
                nombre_completo=username.replace("_", " ").title()
            )
            crud.user.create_user(db, user=user_in)
            # Try logging in again
            response = client.post("/api/v1/auth/login/access-token", data=login_data)

    assert response.status_code == 200, f"Failed to log in user {username}. Response: {response.json()}"

    token_data = response.json()
    return {"Authorization": f"Bearer {token_data['access_token']}"}


def test_read_audit_logs_unauthorized_role(client: TestClient, db: Session):
    """
    Test that a user with an unauthorized role (e.g., 'alumno')
    receives a 403 Forbidden error.
    """
    create_test_tenant(db)
    headers = get_auth_headers(client, db, "test_student_audit")

    response = client.get("/api/v1/audit/", headers=headers)

    assert response.status_code == 403
    assert "not authorized" in response.json()["detail"]

import json
from datetime import datetime
from app.schemas.audit import AuditLogCreate

def test_read_audit_logs_authorized_role(client: TestClient, db: Session):
    """
    Test that a user with an authorized role (e.g., 'admin_empresa')
    can access the endpoint successfully.
    """
    create_test_tenant(db)
    # Ensure at least one audit log exists for the tenant
    log_in = AuditLogCreate(
        inquilino_id=1,
        accion="TEST_ACTION",
        detalles=json.dumps({"info": "test"}),
        timestamp=datetime.utcnow().isoformat()
    )
    crud.audit.create_audit_log(db, obj_in=log_in)

    headers = get_auth_headers(client, db, "test_admin_audit")

    response = client.get("/api/v1/audit/", headers=headers)

    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0
    assert response.json()[0]["accion"] == "TEST_ACTION"
