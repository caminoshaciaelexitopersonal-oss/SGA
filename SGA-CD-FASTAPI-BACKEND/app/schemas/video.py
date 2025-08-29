from pydantic import BaseModel
from typing import Optional
import datetime

class VideoGenerationRequestBase(BaseModel):
    prompt: str
    runwayml_task_id: Optional[str] = None
    status: str = "pending"
    video_url: Optional[str] = None

class VideoGenerationRequestCreate(VideoGenerationRequestBase):
    pass

class VideoGenerationRequestUpdate(BaseModel):
    status: Optional[str] = None
    video_url: Optional[str] = None

class VideoGenerationRequest(VideoGenerationRequestBase):
    id: int
    user_id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True
