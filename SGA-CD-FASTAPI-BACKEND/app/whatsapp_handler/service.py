import requests
import json
import logging

from app.core.config import Settings
settings = Settings()
from app.agents.corps.ventas_colonel import sales_agent_executor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

WHATSAPP_GRAPH_API_URL = f"https://graph.facebook.com/v17.0/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"

def send_whatsapp_message(to: str, message: str):
    """
    Sends a text message to a WhatsApp user.
    """
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_API_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": message},
    }

    # If using a placeholder token, just log the action instead of making a real API call.
    if "YOUR_WHATSAPP_API_TOKEN" in settings.WHATSAPP_API_TOKEN:
        logger.info("--- MODO DE PRUEBA (SIN ENVÍO REAL) ---")
        logger.info(f"Se enviaría un mensaje a {to}: '{message}'")
        logger.info(f"URL: {WHATSAPP_GRAPH_API_URL}")
        logger.info(f"Payload: {json.dumps(payload, indent=2)}")
        return {"status": "success", "message": "Logged in test mode."}

    try:
        response = requests.post(WHATSAPP_GRAPH_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        logger.info(f"Mensaje enviado exitosamente a {to}. Response: {response.json()}")
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error al enviar mensaje de WhatsApp a {to}: {e}")
        raise


async def process_whatsapp_message(payload: dict):
    """
    Processes an incoming WhatsApp message payload from a webhook.
    """
    try:
        # Extraer información relevante del payload
        # La estructura puede variar, esto es un ejemplo común
        changes = payload.get("entry", [{}])[0].get("changes", [{}])[0]
        value = changes.get("value", {})
        message_object = value.get("messages", [{}])[0]

        if message_object.get("type") != "text":
            logger.info("Se recibió un mensaje que no es de texto. Ignorando.")
            return

        from_number = message_object.get("from")
        message_text = message_object.get("text", {}).get("body")

        if not from_number or not message_text:
            logger.error("Payload de webhook inválido, falta 'from' o 'body'.")
            return

        logger.info(f"Mensaje recibido de {from_number}: '{message_text}'")

        # Invocar al nuevo agente de ventas de IA.
        # El historial de conversación se maneja dentro del agente si está configurado,
        # aquí solo pasamos la consulta directa.
        reply_text = await sales_agent_executor.ainvoke(message_text)

        # Enviar la respuesta del agente de vuelta al usuario
        send_whatsapp_message(to=from_number, message=reply_text)

    except (IndexError, KeyError) as e:
        logger.error(f"Error al parsear el payload del webhook de WhatsApp: {e}")
        logger.error(f"Payload recibido: {json.dumps(payload)}")
    except Exception as e:
        logger.error(f"Error inesperado al procesar el mensaje de WhatsApp: {e}")
        logger.error(f"Payload recibido: {json.dumps(payload)}")
