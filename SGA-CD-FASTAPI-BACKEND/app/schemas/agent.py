from pydantic import BaseModel

class AgentInput(BaseModel):
    thread_id: str
    prompt: str
    area: str # 'Cultura' o 'Deportes'
