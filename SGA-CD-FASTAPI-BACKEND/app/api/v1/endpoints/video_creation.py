from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api import deps
from app.services.video_creation_service import VideoCreationService, get_video_service

router = APIRouter()

class VideoPrompt(BaseModel):
    prompt: str

@router.post("/generate", status_code=202)
def generate_video(
    *,
    prompt_in: VideoPrompt,
    db: Session = Depends(deps.get_db),
    video_service: VideoCreationService = Depends(get_video_service),
    current_user = Depends(deps.role_required(["admin_general"])),
):
    """
    Start the video generation process.
    """
    try:
        job_id = video_service.start_video_generation(prompt=prompt_in.prompt)
        return {"job_id": job_id, "message": "Video generation started."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Generic error for other issues (e.g., could not connect to RunwayML)
        raise HTTPException(status_code=503, detail=f"Video service unavailable: {e}")


@router.get("/status/{job_id}")
def get_video_status(
    job_id: str,
    video_service: VideoCreationService = Depends(get_video_service),
    current_user = Depends(deps.role_required(["admin_general"])),
):
    """
    Get the status of a video generation job.
    """
    try:
        status = video_service.get_video_generation_status(job_id=job_id)
        return status
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Video service unavailable: {e}")

@router.get("/completed")
def list_completed_videos(
    current_user = Depends(deps.role_required(["admin_general"])),
):
    """
    Get a list of all successfully generated videos.
    """
    # This is a bit of a hack since the service is a class, but for this mock,
    # we can import the function directly. A better design might have this
    # as a static method or part of a different service.
    from app.services.video_creation_service import get_completed_videos
    return get_completed_videos()
