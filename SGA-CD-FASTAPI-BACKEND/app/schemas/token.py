from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    sub: int | None = None
    username: str | None = None
    rol: str | None = None
