from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base
import datetime

class VideoGenerationRequest(Base):
    __tablename__ = "video_generation_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    prompt = Column(Text, nullable=False)
    runwayml_task_id = Column(String, index=True, unique=True)

    status = Column(String, default="pending", nullable=False) # pending, processing, succeeded, failed
    video_url = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

    owner = relationship("Usuario")
