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

class LLMSettings(BaseModel):
    openai_api_key: str
    google_api_key: str
    runwayml_api_key: str

@router.get("/settings/llm", response_model=LLMSettings)
def get_llm_settings(
    db: Session = Depends(deps.get_db),
    current_user: models.Usuario = Depends(deps.role_required(["admin_general"])),
):
    """
    Retrieve LLM API keys for the Admin General.
    """
    logger.info(f"Admin General ({current_user.nombre_usuario}) is fetching LLM settings.")

    openai_key_obj = crud_settings.get_setting(db, key="openai_api_key")
    google_key_obj = crud_settings.get_setting(db, key="google_api_key")
    runwayml_key_obj = crud_settings.get_setting(db, key="runwayml_api_key")

    return LLMSettings(
        openai_api_key=openai_key_obj.value if openai_key_obj else "",
        google_api_key=google_key_obj.value if google_key_obj else "",
        runwayml_api_key=runwayml_key_obj.value if runwayml_key_obj else "",
    )

@router.post("/settings/llm")
def update_llm_settings(
    *,
    db: Session = Depends(deps.get_db),
    settings_in: LLMSettings,
    current_user: models.Usuario = Depends(deps.role_required(["admin_general"])),
):
    """
    Update LLM API keys.
    """
    logger.info(f"Admin General ({current_user.nombre_usuario}) is updating LLM settings.")

    crud_settings.update_setting(db, key="openai_api_key", value=settings_in.openai_api_key)
    crud_settings.update_setting(db, key="google_api_key", value=settings_in.google_api_key)
    crud_settings.update_setting(db, key="runwayml_api_key", value=settings_in.runwayml_api_key)

    logger.info("LLM settings updated successfully.")
    return {"status": "success", "message": "LLM settings updated successfully."}


@router.post("/settings/whatsapp")
def update_whatsapp_settings(
    *,
    db: Session = Depends(deps.get_db),
    settings_in: WhatsAppSettings,
    current_user: models.Usuario = Depends(deps.role_required(["admin_general"])),
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
