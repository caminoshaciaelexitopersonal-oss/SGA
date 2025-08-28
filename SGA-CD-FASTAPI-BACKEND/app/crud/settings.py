from sqlalchemy.orm import Session
from app.models import settings as settings_model

def get_setting(db: Session, key: str) -> settings_model.Setting | None:
    """
    Retrieves a setting from the database by its key.
    """
    return db.query(settings_model.Setting).filter(settings_model.Setting.key == key).first()

def update_setting(db: Session, key: str, value: str) -> settings_model.Setting:
    """
    Creates or updates a setting in the database.
    """
    db_setting = get_setting(db, key)
    if db_setting:
        db_setting.value = value
    else:
        db_setting = settings_model.Setting(key=key, value=value)
        db.add(db_setting)

    db.commit()
    db.refresh(db_setting)
    return db_setting
