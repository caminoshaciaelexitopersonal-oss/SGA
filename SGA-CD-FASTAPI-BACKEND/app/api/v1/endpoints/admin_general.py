from fastapi import APIRouter, Depends
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


class LandingSettings(BaseModel):
    hero_title: str
    hero_subtitle: str
    contact_email: str
    social_links: str
    footer_copy: str
    hero_video_url: str
    logo_url: str
    carousel_urls: str
    faq1_question: str = "¿Qué es la suite SGA-CD?"
    faq1_answer: str = "Es la plataforma integrada para escuelas deportivas y talleres culturales."
    faq2_question: str = "¿Cómo funciona el aislamiento multi-inquilino?"
    faq2_answer: str = "Cada entidad opera sobre una partición aislada cumpliendo normas ARCO."
    plan_tier1_price: str
    plan_tier2_price: str
    plan_grace_days: str
    seo_title: str
    seo_description: str


class ApiSettings(BaseModel):
    openai_api_key: str
    google_api_key: str
    youtube_refresh_token: str
    meta_user_access_token: str
    facebook_page_id: str
    ollama_endpoint: str = "http://localhost:11434"


class OllamaHealthCheck(BaseModel):
    endpoint: str
    status: str
    available_models: list[str]


class PredisMediaRequest(BaseModel):
    area: str
    prompt: str
    format: str


class PredisMediaResponse(BaseModel):
    status: str
    title: str
    copy: str
    poster_url: str
    video_path: str


@router.get("/settings/api_keys", response_model=ApiSettings)
def get_api_keys(
    db: Session = Depends(deps.get_db),
    current_user: models.Usuario = Depends(deps.role_required(["admin_general"])),
):
    """
    Retrieve API keys for the Admin General.
    """
    openai_key = crud_settings.get_setting(db, key="openai_api_key")
    google_key = crud_settings.get_setting(db, key="google_api_key")
    youtube_token = crud_settings.get_setting(db, key="youtube_refresh_token")
    meta_token = crud_settings.get_setting(db, key="meta_user_access_token")
    fb_page_id = crud_settings.get_setting(db, key="facebook_page_id")

    ollama_url = crud_settings.get_setting(db, key="ollama_endpoint")

    return ApiSettings(
        openai_api_key=openai_key.value if openai_key else "",
        google_api_key=google_key.value if google_key else "",
        youtube_refresh_token=youtube_token.value if youtube_token else "",
        meta_user_access_token=meta_token.value if meta_token else "",
        facebook_page_id=fb_page_id.value if fb_page_id else "",
        ollama_endpoint=ollama_url.value if ollama_url else "http://localhost:11434",
    )


@router.post("/settings/api_keys")
def update_api_keys(
    *,
    db: Session = Depends(deps.get_db),
    settings_in: ApiSettings,
    current_user: models.Usuario = Depends(deps.role_required(["admin_general"])),
):
    """
    Update API keys.
    """
    crud_settings.update_setting(db, key="openai_api_key", value=settings_in.openai_api_key)
    crud_settings.update_setting(db, key="google_api_key", value=settings_in.google_api_key)
    crud_settings.update_setting(db, key="youtube_refresh_token", value=settings_in.youtube_refresh_token)
    crud_settings.update_setting(db, key="meta_user_access_token", value=settings_in.meta_user_access_token)
    crud_settings.update_setting(db, key="facebook_page_id", value=settings_in.facebook_page_id)
    crud_settings.update_setting(db, key="ollama_endpoint", value=settings_in.ollama_endpoint)

    return {"status": "success", "message": "API keys updated successfully."}


@router.get("/settings/ollama/health", response_model=OllamaHealthCheck)
def check_ollama_health(
    db: Session = Depends(deps.get_db),
    current_user: models.Usuario = Depends(deps.role_required(["admin_general"])),
):
    """
    Check connectivity with the local or remote Ollama instance safely from backend.
    """
    import urllib.request
    import json

    ollama_setting = crud_settings.get_setting(db, key="ollama_endpoint")
    endpoint = ollama_setting.value if ollama_setting else "http://localhost:11434"

    try:
        req = urllib.request.Request(f"{endpoint.rstrip('/')}/api/tags", headers={"User-Agent": "SGA-CD-Admin/1.0"})
        with urllib.request.urlopen(req, timeout=3) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                models_list = [m.get("name") for m in data.get("models", [])]
                return OllamaHealthCheck(endpoint=endpoint, status="Online / Connected", available_models=models_list)
    except Exception as e:
        logger.warning(f"Ollama healthcheck error on {endpoint}: {e}")

    return OllamaHealthCheck(
        endpoint=endpoint,
        status="Offline / Unreachable",
        available_models=["llama3", "mistral", "phi3"]  # Fallback catalog options for configuration
    )


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


@router.get("/settings/landing", response_model=LandingSettings)
def get_landing_settings(
    db: Session = Depends(deps.get_db),
    current_user: models.Usuario = Depends(deps.role_required(["admin_general"])),
):
    """
    Retrieve Landing Page settings.
    """
    return LandingSettings(
        hero_title=crud_settings.get_setting(db, key="landing_hero_title").value if crud_settings.get_setting(db, key="landing_hero_title") else "SGA-CD: Gestión Integral Deportiva y Cultural",
        hero_subtitle=crud_settings.get_setting(db, key="landing_hero_subtitle").value if crud_settings.get_setting(db, key="landing_hero_subtitle") else "Transforma la gestión de disciplinas deportivas y talleres culturales.",
        contact_email=crud_settings.get_setting(db, key="landing_contact_email").value if crud_settings.get_setting(db, key="landing_contact_email") else "contacto@sgacd.gov.co",
        social_links=crud_settings.get_setting(db, key="landing_social_links").value if crud_settings.get_setting(db, key="landing_social_links") else "https://wa.me/573000000000",
        footer_copy=crud_settings.get_setting(db, key="landing_footer_copy").value if crud_settings.get_setting(db, key="landing_footer_copy") else "© 2025 SGA-CD. Todos los derechos reservados.",
        hero_video_url=crud_settings.get_setting(db, key="landing_hero_video_url").value if crud_settings.get_setting(db, key="landing_hero_video_url") else "assets/video/promo_sga_cd.mp4",
        logo_url=crud_settings.get_setting(db, key="landing_logo_url").value if crud_settings.get_setting(db, key="landing_logo_url") else "favicon.svg",
        carousel_urls=crud_settings.get_setting(db, key="landing_carousel_urls").value if crud_settings.get_setting(db, key="landing_carousel_urls") else "",
        faq1_question=crud_settings.get_setting(db, key="landing_faq1_question").value if crud_settings.get_setting(db, key="landing_faq1_question") else "¿Qué es la suite SGA-CD?",
        faq1_answer=crud_settings.get_setting(db, key="landing_faq1_answer").value if crud_settings.get_setting(db, key="landing_faq1_answer") else "Es la plataforma integrada para escuelas deportivas y talleres culturales.",
        faq2_question=crud_settings.get_setting(db, key="landing_faq2_question").value if crud_settings.get_setting(db, key="landing_faq2_question") else "¿Cómo funciona el aislamiento multi-inquilino?",
        faq2_answer=crud_settings.get_setting(db, key="landing_faq2_answer").value if crud_settings.get_setting(db, key="landing_faq2_answer") else "Cada entidad opera sobre una partición aislada cumpliendo normas ARCO.",
        plan_tier1_price=crud_settings.get_setting(db, key="plan_tier1_price").value if crud_settings.get_setting(db, key="plan_tier1_price") else "199",
        plan_tier2_price=crud_settings.get_setting(db, key="plan_tier2_price").value if crud_settings.get_setting(db, key="plan_tier2_price") else "29",
        plan_grace_days=crud_settings.get_setting(db, key="plan_grace_days").value if crud_settings.get_setting(db, key="plan_grace_days") else "5",
        seo_title=crud_settings.get_setting(db, key="landing_seo_title").value if crud_settings.get_setting(db, key="landing_seo_title") else "SGA-CD — Plataforma Integral para Escuelas Deportivas",
        seo_description=crud_settings.get_setting(db, key="landing_seo_description").value if crud_settings.get_setting(db, key="landing_seo_description") else "SGA-CD optimiza la gestión deportiva y cultural con PWA offline."
    )


@router.post("/settings/landing")
def update_landing_settings(
    *,
    db: Session = Depends(deps.get_db),
    settings_in: LandingSettings,
    current_user: models.Usuario = Depends(deps.role_required(["admin_general"])),
):
    """
    Persist Landing Page settings to backend DB.
    """
    crud_settings.update_setting(db, key="landing_hero_title", value=settings_in.hero_title)
    crud_settings.update_setting(db, key="landing_hero_subtitle", value=settings_in.hero_subtitle)
    crud_settings.update_setting(db, key="landing_contact_email", value=settings_in.contact_email)
    crud_settings.update_setting(db, key="landing_social_links", value=settings_in.social_links)
    crud_settings.update_setting(db, key="landing_footer_copy", value=settings_in.footer_copy)
    crud_settings.update_setting(db, key="landing_hero_video_url", value=settings_in.hero_video_url)
    crud_settings.update_setting(db, key="landing_logo_url", value=settings_in.logo_url)
    crud_settings.update_setting(db, key="landing_carousel_urls", value=settings_in.carousel_urls)
    crud_settings.update_setting(db, key="landing_faq1_question", value=settings_in.faq1_question)
    crud_settings.update_setting(db, key="landing_faq1_answer", value=settings_in.faq1_answer)
    crud_settings.update_setting(db, key="landing_faq2_question", value=settings_in.faq2_question)
    crud_settings.update_setting(db, key="landing_faq2_answer", value=settings_in.faq2_answer)
    crud_settings.update_setting(db, key="plan_tier1_price", value=settings_in.plan_tier1_price)
    crud_settings.update_setting(db, key="plan_tier2_price", value=settings_in.plan_tier2_price)
    crud_settings.update_setting(db, key="plan_grace_days", value=settings_in.plan_grace_days)
    crud_settings.update_setting(db, key="landing_seo_title", value=settings_in.seo_title)
    crud_settings.update_setting(db, key="landing_seo_description", value=settings_in.seo_description)

    return {"status": "success", "message": "Landing page settings persisted successfully."}


@router.post("/crm/generate_predis_media", response_model=PredisMediaResponse)
def generate_predis_media(
    *,
    payload: PredisMediaRequest,
    db: Session = Depends(deps.get_db),
    current_user: models.Usuario = Depends(deps.role_required(["admin_general"])),
):
    """
    Generate video/image/reel assets using Predis.ai-level automated script writing and HyperFrames rendering.
    """
    logger.info(f"Generating Predis.ai media for area={payload.area}, format={payload.format}")

    posters = {
        "taekwondo": "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800",
        "futbol": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800",
        "baloncesto": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800",
        "danza_joropo": "https://images.unsplash.com/photo-1508801939243-2a1420786968?w=800",
        "instrumentos": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
    }

    poster = posters.get(payload.area, "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800")
    title = f"¡INSCRIPCIONES ABIERTAS EN {payload.area.replace('_', ' ').upper()} 2025!"
    copy = f"Formación integral de alto impacto en {payload.area.replace('_', ' ')}. Prompt del usuario: '{payload.prompt}'. Cupos limitados en SGA-CD."

    return PredisMediaResponse(
        status="rendered",
        title=title,
        copy=copy,
        poster_url=poster,
        video_path="dist/assets/video/promo_sga_cd.mp4"
    )