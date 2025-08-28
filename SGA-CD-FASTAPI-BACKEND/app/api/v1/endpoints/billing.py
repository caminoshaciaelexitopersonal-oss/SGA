from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app import schemas, models
from app.api import deps
from app.services.billing_service import BillingService

router = APIRouter()

@router.post("/stripe/create-payment-intent", response_model=schemas.PaymentIntent)
async def create_payment_intent(
    *,
    db: Session = Depends(deps.get_db),
    payment_in: schemas.PaymentIntentCreate,
    current_user: models.Usuario = Depends(deps.get_current_active_user),
):
    """
    Create a Stripe Payment Intent.
    The frontend will use the returned client_secret to confirm the payment.
    """
    billing_service = BillingService(db)
    try:
        # Amount should be in cents, so multiply by 100
        amount_in_cents = int(payment_in.amount * 100)

        intent_details = billing_service.create_payment_intent(
            gateway_name="stripe",
            amount=amount_in_cents,
            currency=payment_in.currency,
            user_id=current_user.id
        )
        return intent_details
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/stripe/webhook")
async def stripe_webhook(
    *,
    request: Request,
    db: Session = Depends(deps.get_db),
):
    """
    Handle webhooks from Stripe. This endpoint does not require JWT authentication
    as it's called by an external service (Stripe). Verification is done via signature.
    """
    billing_service = BillingService(db)
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    if not sig_header:
        raise HTTPException(status_code=400, detail="Missing Stripe-Signature header.")

    try:
        event = billing_service.handle_webhook(
            gateway_name="stripe",
            payload=payload,
            signature=sig_header
        )
        # Handle specific event types
        if event.type == 'payment_intent.succeeded':
            payment_intent = event.data.object
            print(f"PaymentIntent {payment_intent.id} succeeded for user {payment_intent.metadata.user_id}")
            # Here you would update your database, e.g., mark the payment as 'succeeded'
            # and update the user's subscription status.

        return {"status": "success"}
    except ValueError as e:
        # Invalid payload or signature
        raise HTTPException(status_code=400, detail=str(e))
