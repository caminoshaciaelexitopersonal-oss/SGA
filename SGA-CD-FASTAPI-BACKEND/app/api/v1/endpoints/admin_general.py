from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app import models
from app.api import deps
from app.crud import settings as crud_settings
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class WhatsAppSettings(BaseModel):
    api_token: str
    phone_number_id: str

class RunwayMLSettings(BaseModel):
    api_key: str

@router.post("/settings/whatsapp")
def update_whatsapp_settings(
    *,
    db: Session = Depends(deps.get_db),
    settings_in: WhatsAppSettings,
    current_user: models.Usuario = Depends(deps.get_current_active_admin_general),
):
    """
    Endpoint for the Admin General to update WhatsApp settings.
    These settings are stored in the new 'settings' table.
    """
    logger.info(f"Admin General ({current_user.nombre_usuario}) is updating WhatsApp settings.")

    crud_settings.update_setting(db, key="WHATSAPP_API_TOKEN", value=settings_in.api_token)
    crud_settings.update_setting(db, key="WHATSAPP_PHONE_NUMBER_ID", value=settings_in.phone_number_id)

    # The verify token is often static and defined by the developer,
    # but we could make it configurable as well if needed.
    # For now, we assume it's set in the .env file and configured once.

    logger.info("WhatsApp settings updated successfully in the database.")

    return {"status": "success", "message": "WhatsApp settings updated successfully."}


@router.post("/settings/runwayml")
def update_runwayml_settings(
    *,
    db: Session = Depends(deps.get_db),
    settings_in: RunwayMLSettings,
    current_user: models.Usuario = Depends(deps.get_current_active_admin_general),
):
    """
    Endpoint for the Admin General to update RunwayML API key.
    """
    logger.info(f"Admin General ({current_user.nombre_usuario}) is updating RunwayML settings.")

    crud_settings.update_setting(db, key="RUNWAYML_API_KEY", value=settings_in.api_key)

    logger.info("RunwayML settings updated successfully in the database.")

    return {"status": "success", "message": "RunwayML settings updated successfully."}
