import mercadopago
import uuid
from typing import Dict
from app.core.config import settings
from app.billing.base_adapter import BaseAdapter

class MercadoPagoAdapter(BaseAdapter):
    """
    Adapter for interacting with the Mercado Pago payment gateway.
    """

    def __init__(self):
        self.sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)

    def create_payment_intent(self, *, amount: int, currency: str, user_id: int) -> Dict:
        """
        Creates a Preference with Mercado Pago.
        The frontend will redirect the user to the returned URL.
        Amount should be in the main currency unit (e.g., pesos, dollars).
        """
        try:
            # Mercado Pago preference data
            preference_data = {
                "items": [
                    {
                        "title": "Suscripción SGA-CD",
                        "quantity": 1,
                        "unit_price": float(amount / 100) # Assuming amount is in cents
                    }
                ],
                "back_urls": {
                    "success": "http://localhost:8000/payment_success.html",
                    "failure": "http://localhost:8000/payment_cancel.html",
                    "pending": "http://localhost:8000/payment_cancel.html"
                },
                "auto_return": "approved",
                "external_reference": f"user_{user_id}_suscripcion_{uuid.uuid4()}"
            }

            preference_response = self.sdk.preference().create(preference_data)
            preference = preference_response["response"]

            # For Mercado Pago, we return the URL to redirect the user to.
            return {"redirect_url": preference["init_point"]}

        except Exception as e:
            print(f"Error creating Mercado Pago Preference: {e}")
            raise ValueError("Could not create payment preference with Mercado Pago.")

    def verify_webhook(self, *, payload: dict, signature: str = None) -> any:
        """
        Verifies an incoming IPN webhook from Mercado Pago.
        Mercado Pago's webhook verification can be complex. For now, we'll just
        log the event. In production, you'd verify the topic and re-fetch the payment.
        """
        print(f"Received Mercado Pago Webhook: {payload}")

        if payload.get("type") == "payment":
            payment_id = payload.get("data", {}).get("id")
            # In production, you would fetch the payment details using the payment_id
            # payment_info = self.sdk.payment().get(payment_id)
            print(f"Webhook for payment_id: {payment_id}")
            return {"status": "received", "payment_id": payment_id}

        return {"status": "ignored", "type": payload.get("type")}
