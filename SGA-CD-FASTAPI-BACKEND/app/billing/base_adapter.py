from abc import ABC, abstractmethod
from typing import Dict

class BaseAdapter(ABC):
    @abstractmethod
    def create_payment_intent(self, *, amount: int, currency: str, user_id: int, payment_methods: Dict = None) -> Dict:
        pass

    @abstractmethod
    def verify_webhook(self, *, payload: dict, signature: str) -> any:
        pass
