from sqlalchemy.orm import Session
from app.billing.base_adapter import BaseAdapter
from app.billing.adapters.stripe_adapter import StripeAdapter
from app.billing.adapters.mercadopago_adapter import MercadoPagoAdapter
from app.billing.adapters.payu_adapter import PayUAdapter

class BillingService:
    def __init__(self, db: Session):
        self.db = db
        self.adapters = {
            'stripe': StripeAdapter(),
            'mercadopago': MercadoPagoAdapter(),
            'payu': PayUAdapter(),
        }

    def get_adapter(self, gateway_name: str) -> BaseAdapter:
        adapter = self.adapters.get(gateway_name)
        if not adapter:
            raise ValueError(f"No adapter found for gateway: {gateway_name}")
        return adapter

    def create_payment_intent(self, *, gateway_name: str, amount: int, currency: str, user_id: int):
        adapter = self.get_adapter(gateway_name)
        intent_details = adapter.create_payment_intent(amount=amount, currency=currency, user_id=user_id)
        return intent_details

    def handle_webhook(self, *, gateway_name: str, payload: dict, signature: str):
        adapter = self.get_adapter(gateway_name)
        event = adapter.verify_webhook(payload=payload, signature=signature)
        print(f"Webhook event received and verified for {gateway_name}: {event.type if hasattr(event, 'type') else event}")
        return {"status": "success"}
