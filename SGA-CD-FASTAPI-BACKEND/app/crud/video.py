from sqlalchemy.orm import Session
from app.models import video as video_model
from app.schemas import video as video_schema

def create_video_request(db: Session, request: video_schema.VideoGenerationRequestCreate, user_id: int) -> video_model.VideoGenerationRequest:
    db_obj = video_model.VideoGenerationRequest(
        **request.model_dump(),
        user_id=user_id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_video_request(db: Session, task_id: str) -> video_model.VideoGenerationRequest | None:
    return db.query(video_model.VideoGenerationRequest).filter(video_model.VideoGenerationRequest.runwayml_task_id == task_id).first()

def update_video_request_status(db: Session, task_id: str, status: str, video_url: str | None = None) -> video_model.VideoGenerationRequest | None:
    db_obj = get_video_request(db, task_id)
    if db_obj:
        db_obj.status = status
        if video_url:
            db_obj.video_url = video_url
        db.commit()
        db.refresh(db_obj)
    return db_obj
