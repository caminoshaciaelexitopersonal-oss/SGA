import os
import requests
import subprocess
import time
import jwt
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.security import get_password_hash

# --- Configuration ---
DATABASE_URL = "sqlite:////app/SGA-CD-DB.git/sga_cd_main.db"
API_BASE_URL = "http://127.0.0.1:8000/api/v1"
SECRET_KEY = "a_super_secret_key"
ALGORITHM = "HS256"

# --- Database Setup ---
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db_session():
    return SessionLocal()

# --- Test Data ---
PARENT_USERNAME = "test_parent_old_system"
PARENT_PASSWORD = "password"
CHILD_USERNAME = "test_child_for_parent"
INQUILINO_ID = 1

def cleanup_test_users(db):
    """Removes the users created for the test."""
    print("--- Cleaning up test users ---")
    try:
        # Delete association first
        parent_user = db.execute(text("SELECT id FROM usuarios WHERE nombre_usuario = :username"), {"username": PARENT_USERNAME}).fetchone()
        child_user = db.execute(text("SELECT id FROM usuarios WHERE nombre_usuario = :username"), {"username": CHILD_USERNAME}).fetchone()

        if parent_user and child_user:
            db.execute(
                text("DELETE FROM padre_hijos_association WHERE padre_id = :padre_id AND hijo_id = :hijo_id"),
                {"padre_id": parent_user[0], "hijo_id": child_user[0]}
            )
            print(f"Deleted association between parent {parent_user[0]} and child {child_user[0]}")

        # Delete users
        db.execute(text("DELETE FROM usuarios WHERE nombre_usuario = :username"), {"username": PARENT_USERNAME})
        print(f"Deleted user: {PARENT_USERNAME}")
        db.execute(text("DELETE FROM usuarios WHERE nombre_usuario = :username"), {"username": CHILD_USERNAME})
        print(f"Deleted user: {CHILD_USERNAME}")

        # Also delete from user_roles just in case
        if parent_user:
            db.execute(text("DELETE FROM user_roles WHERE user_id = :user_id"), {"user_id": parent_user[0]})
        if child_user:
            db.execute(text("DELETE FROM user_roles WHERE user_id = :user_id"), {"user_id": child_user[0]})

        db.commit()
        print("Cleanup successful.")
    except Exception as e:
        print(f"An error occurred during cleanup: {e}")
        db.rollback()

def create_test_users_old_system(db):
    """Creates a parent and child user, simulating the old user creation process."""
    print("--- Creating test users (Old System Simulation) ---")
    try:
        # Clean up any previous failed runs
        cleanup_test_users(db)

        # Create Parent User (Old System)
        hashed_password = get_password_hash(PARENT_PASSWORD)
        parent_insert_query = text("""
            INSERT INTO usuarios (inquilino_id, nombre_usuario, password_hash, rol, nombre_completo, correo, activo)
            VALUES (:inquilino_id, :nombre_usuario, :password_hash, :rol, :nombre_completo, :correo, :activo)
        """)
        db.execute(parent_insert_query, {
            "inquilino_id": INQUILINO_ID,
            "nombre_usuario": PARENT_USERNAME,
            "password_hash": hashed_password,
            "rol": "padre_acudiente",
            "nombre_completo": "Test Parent Old System",
            "correo": "test.parent.old@sga.com",
            "activo": True
        })
        print(f"Created parent user: {PARENT_USERNAME}")

        # Create Child User (Old System)
        child_insert_query = text("""
            INSERT INTO usuarios (inquilino_id, nombre_usuario, password_hash, rol, nombre_completo, correo, activo)
            VALUES (:inquilino_id, :nombre_usuario, :password_hash, :rol, :nombre_completo, :correo, :activo)
        """)
        db.execute(child_insert_query, {
            "inquilino_id": INQUILINO_ID,
            "nombre_usuario": CHILD_USERNAME,
            "password_hash": get_password_hash("password"),
            "rol": "alumno",
            "nombre_completo": "Test Child For Parent",
            "correo": "test.child.old@sga.com",
            "activo": True
        })
        print(f"Created child user: {CHILD_USERNAME}")
        db.commit()

        # Get IDs for association
        parent_id = db.execute(text("SELECT id FROM usuarios WHERE nombre_usuario = :username"), {"username": PARENT_USERNAME}).scalar_one()
        child_id = db.execute(text("SELECT id FROM usuarios WHERE nombre_usuario = :username"), {"username": CHILD_USERNAME}).scalar_one()

        # Link them in the association table
        assoc_query = text("INSERT INTO padre_hijos_association (padre_id, hijo_id) VALUES (:padre_id, :hijo_id)")
        db.execute(assoc_query, {"padre_id": parent_id, "hijo_id": child_id})
        db.commit()
        print(f"Associated parent (ID: {parent_id}) with child (ID: {child_id})")

        return parent_id, child_id

    except Exception as e:
        print(f"An error occurred during test user creation: {e}")
        db.rollback()
        raise

def run_verification_test():
    """Main function to run the verification test."""
    db = get_db_session()
    server_process = None

    try:
        # 1. Create test data
        parent_id, child_id = create_test_users_old_system(db)

        # 2. Start the FastAPI server
        print("\n--- Starting FastAPI Server ---")
        server_process = subprocess.Popen(
            ["uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
            cwd="/app/SGA-CD-FASTAPI-BACKEND",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

        # Poll the server to see if it's up
        max_wait_time = 30  # seconds
        start_time = time.time()
        server_ready = False
        while time.time() - start_time < max_wait_time:
            try:
                # Use the root endpoint which doesn't require auth
                response = requests.get("http://127.0.0.1:8000/", timeout=1)
                if response.status_code == 200:
                    print("Server is up and running!")
                    server_ready = True
                    break
            except requests.ConnectionError:
                time.sleep(1) # Wait a second before retrying

        if not server_ready:
            stdout, stderr = server_process.communicate()
            print("--- Server STDOUT ---")
            print(stdout.decode())
            print("--- Server STDERR ---")
            print(stderr.decode())
            raise Exception("Server did not start within the specified time.")

        # 3. Perform Login
        print("\n--- Testing Login Endpoint ---")
        login_data = {"username": PARENT_USERNAME, "password": PARENT_PASSWORD}
        response = requests.post(f"{API_BASE_URL}/auth/login", data=login_data)

        assert response.status_code == 200, f"Login failed! Status: {response.status_code}, Body: {response.text}"
        print("Login successful.")

        token_data = response.json()
        access_token = token_data["access_token"]

        # 4. Verify Token Contents
        print("\n--- Verifying JWT Token ---")
        decoded_token = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])

        assert "padre_acudiente" in decoded_token["roles"], f"Role 'padre_acudiente' not found in token! Roles: {decoded_token.get('roles')}"
        print("Token verification successful. Role 'padre_acudiente' is present.")

        # 5. Test the Protected Endpoint
        print("\n--- Testing /padre/hijos Endpoint ---")
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(f"{API_BASE_URL}/padre/hijos", headers=headers)

        assert response.status_code == 200, f"Endpoint call failed! Status: {response.status_code}, Body: {response.text}"
        print("Protected endpoint call successful.")

        children_list = response.json()
        assert len(children_list) > 0, "Endpoint returned an empty list of children."

        child_usernames = [child['email'] for child in children_list]
        child_db_email = db.execute(text("SELECT correo FROM usuarios WHERE id = :id"), {"id": child_id}).scalar_one()

        assert child_db_email in child_usernames, f"Child user '{child_db_email}' not found in endpoint response."
        print(f"Child user found in response: {child_db_email}")

        print("\n\n✅ ✅ ✅ VERIFICATION SUCCEEDED ✅ ✅ ✅")

    except Exception as e:
        print(f"\n\n❌ ❌ ❌ VERIFICATION FAILED: {e} ❌ ❌ ❌")
    finally:
        # 6. Stop the server and clean up
        if server_process:
            print("\n--- Stopping FastAPI Server ---")
            server_process.terminate()
            server_process.wait()
            print("Server stopped.")

        cleanup_test_users(db)
        db.close()


if __name__ == "__main__":
    run_verification_test()
