import stripe
from typing import Dict
from app.core.config import settings
from app.billing.base_adapter import BaseAdapter

class StripeAdapter(BaseAdapter):
    def __init__(self):
        stripe.api_key = settings.STRIPE_SECRET_KEY
        self.webhook_secret = settings.STRIPE_WEBHOOK_SECRET

    def create_payment_intent(self, *, amount: int, currency: str, user_id: int, payment_methods: Dict = None) -> Dict:
        try:
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency.lower(),
                automatic_payment_methods={"enabled": True},
                metadata={"user_id": user_id}
            )
            return {"client_secret": intent.client_secret}
        except Exception as e:
            raise ValueError(f"Could not create payment intent with Stripe: {e}")

    def verify_webhook(self, *, payload: bytes, signature: str) -> stripe.Event:
        try:
            event = stripe.Webhook.construct_event(
                payload=payload,
                sig_header=signature,
                secret=self.webhook_secret
            )
            return event
        except Exception as e:
            raise ValueError(f"Invalid webhook signature: {e}")
