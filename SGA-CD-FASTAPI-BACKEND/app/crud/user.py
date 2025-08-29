from sqlalchemy.orm import Session
from sqlalchemy import text

# This import now works because `sga_cd_db` was installed as an editable package.
from models.user import Usuario
from app.schemas.user import UserCreate
from app.core.security import get_password_hash


def get_user_by_username(db: Session, username: str) -> Usuario | None:
    """
    Fetches a user from the database by their username.
    The user object is augmented with a `roles` attribute, ensuring backward compatibility.
    """
    user = db.query(Usuario).filter(Usuario.nombre_usuario == username).first()
    if user:
        # First, try to get roles from the new RBAC 'user_roles' table.
        query = text("""
            SELECT r.nombre FROM roles r
            JOIN user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = :user_id
        """)
        roles_result = db.execute(query, {"user_id": user.id}).fetchall()
        user_roles = [row[0] for row in roles_result]

        # If no roles are found in the new system, fall back to the deprecated 'rol' column.
        if not user_roles and user.rol:
            user_roles = [user.rol.value]  # Use the enum's value

        # Attach the role names to a new, non-SQLAlchemy attribute to avoid conflicts.
        user.role_names = user_roles
    return user


def get(db: Session, id: int) -> Usuario | None:
    """
    Fetches a user from the database by their ID.
    The user object is augmented with a `roles` attribute, ensuring backward compatibility.
    """
    user = db.query(Usuario).filter(Usuario.id == id).first()
    if user:
        # First, try to get roles from the new RBAC 'user_roles' table.
        query = text("""
            SELECT r.nombre FROM roles r
            JOIN user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = :user_id
        """)
        roles_result = db.execute(query, {"user_id": user.id}).fetchall()
        user_roles = [row[0] for row in roles_result]

        # If no roles are found in the new system, fall back to the deprecated 'rol' column.
        if not user_roles and user.rol:
            user_roles = [user.rol.value]  # Use the enum's value

        # Attach the role names to a new, non-SQLAlchemy attribute to avoid conflicts.
        user.role_names = user_roles
    return user


def create_user(db: Session, user: UserCreate) -> Usuario:
    """
    Creates a new user in the database and assigns them a role.
    This function now interacts with the `roles` and `user_roles` tables.
    """
    # Note: We are no longer saving the `rol` to the Usuario model directly.
    # The `rol` column in the `usuario` table should be considered deprecated.
    hashed_password = get_password_hash(user.password)
    db_user = Usuario(
        nombre_usuario=user.nombre_usuario,
        correo=user.email,
        password_hash=hashed_password,
        nombre_completo=user.nombre_completo,
        # NOTE: The 'rol' column is deprecated but still required by the DB model.
        # We set it to satisfy the NOT NULL constraint. The new RBAC system
        # uses the 'user_roles' table instead.
        rol=user.rol,
        inquilino_id=user.inquilino_id,
        activo=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Now, assign the role in the new RBAC tables
    # 1. Get the role id from the role name
    get_role_query = text("SELECT id FROM roles WHERE nombre = :role_name")
    role_result = db.execute(get_role_query, {"role_name": user.rol}).fetchone()
    if not role_result:
        # This case should ideally not happen if input is validated,
        # but as a safeguard, we can either raise an error or do nothing.
        # For now, we'll just rollback the user creation if role doesn't exist.
        db.rollback()
        raise ValueError(f"Role '{user.rol}' not found in 'roles' table.")

    role_id = role_result[0]

    # 2. Insert into the user_roles join table
    assign_role_query = text(
        "INSERT INTO user_roles (user_id, role_id) VALUES (:user_id, :role_id)"
    )
    db.execute(assign_role_query, {"user_id": db_user.id, "role_id": role_id})
    db.commit()

    # Attach the Role object to the returned user object for consistency
    from models.user import Role
    role_obj = db.query(Role).filter(Role.id == role_id).first()
    if role_obj:
        db_user.roles = [role_obj]
    else:
        # This case should not be reached if the role was found before
        db_user.roles = []

    return db_user