from abc import ABC, abstractmethod
from typing import Dict

class BaseAdapter(ABC):
    """
    Abstract Base Class for all payment gateway adapters.
    Defines the common interface for creating payments and handling webhooks.
    """

    @abstractmethod
    def create_payment_intent(self, *, amount: int, currency: str, user_id: int) -> Dict:
        """
        Creates a payment intent (or equivalent) with the gateway.

        Should return a dictionary containing the necessary details for the frontend,
        e.g., {'client_secret': '...'} for Stripe.
        """
        pass

    @abstractmethod
    def verify_webhook(self, *, payload: dict, signature: str) -> any:
        """
        Verifies the authenticity of an incoming webhook.

        Should raise an exception if the signature is invalid.
        Should return the parsed event object if successful.
        """
        pass
