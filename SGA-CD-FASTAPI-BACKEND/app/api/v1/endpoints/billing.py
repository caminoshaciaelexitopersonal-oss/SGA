from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app import schemas, models
from app.api import deps
from app.services.billing_service import BillingService

router = APIRouter()

@router.post("/stripe/create-payment-intent", response_model=schemas.PaymentIntent)
async def create_stripe_intent(db: Session = Depends(deps.get_db), payment_in: schemas.PaymentIntentCreate, current_user: models.Usuario = Depends(deps.get_current_active_user)):
    service = BillingService(db)
    try:
        return service.create_payment_intent(gateway_name="stripe", amount=int(payment_in.amount*100), currency=payment_in.currency, user_id=current_user.id)
    except ValueError as e: raise HTTPException(status_code=400, detail=str(e))

@router.post("/mercadopago/create-preference", response_model=schemas.MercadoPagoPreference)
async def create_mp_preference(db: Session = Depends(deps.get_db), payment_in: schemas.PaymentIntentCreate, current_user: models.Usuario = Depends(deps.get_current_active_user)):
    service = BillingService(db)
    try:
        return service.create_payment_intent(gateway_name="mercadopago", amount=int(payment_in.amount*100), currency=payment_in.currency, user_id=current_user.id)
    except ValueError as e: raise HTTPException(status_code=400, detail=str(e))

@router.post("/mercadopago/create-pse-preference", response_model=schemas.MercadoPagoPreference)
async def create_mp_pse_preference(db: Session = Depends(deps.get_db), payment_in: schemas.PaymentIntentCreate, current_user: models.Usuario = Depends(deps.get_current_active_user)):
    service = BillingService(db)
    payment_methods = {"excluded_payment_types": [{"id": "credit_card"}, {"id": "debit_card"}, {"id": "ticket"}]}
    try:
        return service.create_payment_intent(gateway_name="mercadopago", amount=int(payment_in.amount*100), currency=payment_in.currency, user_id=current_user.id, payment_methods=payment_methods)
    except ValueError as e: raise HTTPException(status_code=400, detail=str(e))

@router.post("/wompi/create-transaction", response_model=schemas.WompiTransaction)
async def create_wompi_transaction(db: Session = Depends(deps.get_db), payment_in: schemas.PaymentIntentCreate, current_user: models.Usuario = Depends(deps.get_current_active_user)):
    service = BillingService(db)
    try:
        return service.create_payment_intent(gateway_name="wompi", amount=int(payment_in.amount*100), currency="COP", user_id=current_user.id)
    except ValueError as e: raise HTTPException(status_code=400, detail=str(e))

@router.post("/stripe/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(deps.get_db)):
    service = BillingService(db)
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    if not sig_header: raise HTTPException(status_code=400, detail="Missing Stripe-Signature header.")
    try:
        event = service.handle_webhook(gateway_name="stripe", payload=payload, signature=sig_header)
        if event.type == 'payment_intent.succeeded': print(f"PaymentIntent {event.data.object.id} succeeded.")
        return {"status": "success"}
    except ValueError as e: raise HTTPException(status_code=400, detail=str(e))

@router.post("/mercadopago/webhook")
async def mp_webhook(request: Request, db: Session = Depends(deps.get_db)):
    service = BillingService(db)
    payload = await request.json()
    try:
        event = service.handle_webhook(gateway_name="mercadopago", payload=payload, signature="")
        return {"status": "success"}
    except ValueError as e: raise HTTPException(status_code=400, detail=str(e))

@router.post("/wompi/webhook")
async def wompi_webhook(request: Request, db: Session = Depends(deps.get_db)):
    service = BillingService(db)
    payload = await request.json()
    try:
        event = service.handle_webhook(gateway_name="wompi", payload=payload, signature="")
        return {"status": "success"}
    except ValueError as e: raise HTTPException(status_code=400, detail=str(e))
