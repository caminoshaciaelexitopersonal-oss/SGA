from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.api import deps
from app.schemas import video as video_schema
from app.video_generator import service as video_service
from app.crud import video as crud_video
from app import models
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class VideoGenerationInput(BaseModel):
    prompt: str

@router.post("/generate", status_code=status.HTTP_202_ACCEPTED)
def generate_video(
    *,
    db: Session = Depends(deps.get_db),
    video_in: VideoGenerationInput,
    current_user: models.Usuario = Depends(deps.get_current_active_admin_general),
    background_tasks: BackgroundTasks
):
    """
    Endpoint to start a new video generation task.
    """
    logger.info(f"Received video generation request from user {current_user.id}")
    try:
        task_id = video_service.create_video_generation_task(
            db=db,
            prompt=video_in.prompt,
            user_id=current_user.id
        )
        # Add a background task to periodically check the status
        # In a real production system, this would be a more robust Celery/Redis setup.
        background_tasks.add_task(video_service.check_and_update_task_status, db, task_id)

        return {"task_id": task_id, "message": "Video generation started."}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/status/{task_id}", response_model=video_schema.VideoGenerationRequest)
def get_video_status(
    *,
    db: Session = Depends(deps.get_db),
    task_id: str,
    current_user: models.Usuario = Depends(deps.get_current_active_user) # Secure endpoint
):
    """
    Endpoint to check the status of a video generation task.
    """
    logger.info(f"User {current_user.id} checking status for task {task_id}")
    db_request = crud_video.get_video_request(db, task_id=task_id)

    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")

    # Ensure users can only check the status of their own requests
    if db_request.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this task.")

    return db_request
