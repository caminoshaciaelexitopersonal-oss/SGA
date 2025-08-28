from sqlalchemy.orm import Session
from app.billing.base_adapter import BaseAdapter
# Import adapters as they are created
from app.billing.adapters.stripe_adapter import StripeAdapter
# from app.billing.adapters.mercadopago_adapter import MercadoPagoAdapter

class BillingService:
    def __init__(self, db: Session):
        self.db = db
        self.adapters = {
            'stripe': StripeAdapter(),
            # 'mercadopago': MercadoPagoAdapter(),
        }

    def get_adapter(self, gateway_name: str) -> BaseAdapter:
        adapter = self.adapters.get(gateway_name)
        if not adapter:
            raise ValueError(f"No adapter found for gateway: {gateway_name}")
        return adapter

    def create_payment_intent(self, *, gateway_name: str, amount: int, currency: str, user_id: int):
        """
        Creates a payment intent using the specified gateway.
        """
        adapter = self.get_adapter(gateway_name)
        # Here you would create a Payment record in your DB with 'pending' status
        # ...

        # Then, create the payment intent with the gateway
        intent_details = adapter.create_payment_intent(amount=amount, currency=currency, user_id=user_id)

        # You might update your Payment record here with the intent ID
        # ...

        return intent_details

    def handle_webhook(self, *, gateway_name: str, payload: dict, signature: str):
        """
        Handles an incoming webhook from a payment gateway.
        """
        adapter = self.get_adapter(gateway_name)

        # First, verify the webhook signature
        event = adapter.verify_webhook(payload=payload, signature=signature)

        # Handle the event (e.g., payment_succeeded, payment_failed)
        # This is where you would update your database, grant access, etc.
        # ...

        print(f"Webhook event received and verified for {gateway_name}: {event.type}")
        return {"status": "success"}
