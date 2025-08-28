from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

class PaymentIntentCreate(BaseModel):
    amount: float
    currency: str = "USD"

class PaymentIntent(BaseModel):
    client_secret: str

class MercadoPagoPreference(BaseModel):
    redirect_url: str

class WompiTransaction(BaseModel):
    redirect_url: str
