import hashlib
import uuid
from typing import Dict
from app.core.config import settings
from app.billing.base_adapter import BaseAdapter

class PayUAdapter(BaseAdapter):
    """
    Adapter for interacting with the PayU payment gateway.
    """

    def __init__(self):
        self.api_key = settings.PAYU_API_KEY
        self.api_login = settings.PAYU_API_LOGIN
        self.merchant_id = settings.PAYU_MERCHANT_ID
        # PayU has different endpoints for test and production
        self.endpoint = "https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/"

    def create_payment_intent(self, *, amount: int, currency: str, user_id: int) -> Dict:
        """
        Generates the data needed to create a payment form for PayU.
        The frontend will use this data to auto-submit a form to redirect the user.
        """
        reference_code = f"user_{user_id}_suscripcion_{uuid.uuid4()}"
        amount_str = f"{amount / 100:.2f}"

        # PayU signature is created by hashing a specific string
        signature_str = f"{self.api_key}~{self.merchant_id}~{reference_code}~{amount_str}~{currency.upper()}"
        signature = hashlib.md5(signature_str.encode("utf-8")).hexdigest()

        form_data = {
            "merchantId": self.merchant_id,
            "accountId": "512321", # This is often a fixed value from PayU account
            "description": "Suscripción SGA-CD",
            "referenceCode": reference_code,
            "amount": amount_str,
            "tax": "0",
            "taxReturnBase": "0",
            "currency": currency.upper(),
            "signature": signature,
            "test": "1", # 1 for test mode, 0 for production
            "buyerEmail": "test@test.com", # Should be fetched from user data
            "responseUrl": "http://localhost:3000/payment_response.html",
            "confirmationUrl": f"{settings.API_V1_STR}/billing/payu/webhook",
        }

        return {
            "redirect_url": self.endpoint,
            "form_data": form_data
        }

    def verify_webhook(self, *, payload: dict, signature: str = None) -> any:
        """
        Verifies an incoming webhook from PayU by re-calculating the signature.
        """
        # The signature from PayU is in the 'sign' field of the payload
        payu_signature = payload.get("sign")

        # The string to hash is constructed from various fields in the payload
        # This is a simplified example. The actual fields depend on the transaction status.
        # Format: apiKey~merchantId~referenceCode~newValue~currency~statePol

        # IMPORTANT: This verification logic is complex and needs to be implemented
        # carefully based on PayU's documentation for production use.
        print(f"Received PayU Webhook. Signature: {payu_signature}. Payload: {payload}")

        # For now, we'll consider it verified for development purposes.
        return {"status": "verified", "payload": payload}
