from sqlalchemy.orm import Session
from app.billing.base_adapter import BaseAdapter
from app.billing.adapters.stripe_adapter import StripeAdapter
from app.billing.adapters.mercadopago_adapter import MercadoPagoAdapter
from app.billing.adapters.wompi_adapter import WompiAdapter
from app.crud import billing as crud_billing
from app.schemas.billing import PaymentCreate, SubscriptionUpdate
from datetime import datetime, timedelta

class BillingService:
    def __init__(self, db: Session):
        self.db = db
        self.adapters = {
            'stripe': StripeAdapter(),
            'mercadopago': MercadoPagoAdapter(),
            'wompi': WompiAdapter(),
        }

    def get_adapter(self, gateway_name: str) -> BaseAdapter:
        adapter = self.adapters.get(gateway_name)
        if not adapter: raise ValueError(f"Adapter not found: {gateway_name}")
        return adapter

    def create_payment_intent(self, *, gateway_name: str, amount: float, currency: str, user_id: int, payment_methods: dict = None):
        adapter = self.get_adapter(gateway_name)

        # Assume we have a subscription for the user
        subscription = crud_billing.get_subscription_by_tenant(self.db, inquilino_id=user_id)
        if not subscription: raise ValueError("No subscription found for user.")

        # Create a pending payment record in our DB
        payment_in = PaymentCreate(
            subscription_id=subscription.id,
            inquilino_id=user_id,
            amount=amount,
            currency=currency,
            status='pending',
            gateway_name=gateway_name
        )
        db_payment = crud_billing.create_payment(self.db, obj_in=payment_in)

        # Create the payment intent with the gateway
        intent_details = adapter.create_payment_intent(
            amount=int(amount * 100), # send cents to gateways
            currency=currency,
            user_id=user_id,
            payment_methods=payment_methods
        )

        return intent_details

    def handle_webhook(self, *, gateway_name: str, payload: dict, signature: str):
        adapter = self.get_adapter(gateway_name)
        event = adapter.verify_webhook(payload=payload, signature=signature)

        if gateway_name == 'stripe' and event.type == 'payment_intent.succeeded':
            payment_intent = event.data.object
            transaction_id = payment_intent.id
            db_payment = crud_billing.get_payment_by_gateway_transaction_id(self.db, transaction_id=transaction_id)

            if db_payment and db_payment.status == 'pending':
                crud_billing.update_payment_status(self.db, db_obj=db_payment, status='succeeded')

                # Extend subscription
                subscription = db_payment.subscription
                new_end_date = (subscription.end_date or datetime.utcnow()) + timedelta(days=30)
                sub_update = SubscriptionUpdate(end_date=new_end_date, status='active')
                crud_billing.update_subscription(self.db, db_obj=subscription, obj_in=sub_update)
                print(f"Subscription for user {subscription.inquilino_id} extended.")

        # TODO: Add handlers for MercadoPago and Wompi webhook events

        return {"status": "success"}
