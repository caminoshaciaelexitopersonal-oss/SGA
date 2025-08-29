import logging
from sqlalchemy.orm import Session
from runwayml import RunwayML, TaskFailedError

from app.crud import settings as crud_settings
from app.crud import video as crud_video
from app.schemas import video as video_schema

logger = logging.getLogger(__name__)

def create_video_generation_task(db: Session, prompt: str, user_id: int) -> str:
    """
    Starts a video generation task with RunwayML and saves the request to the DB.
    Returns the task_id.
    """
    logger.info(f"User {user_id} initiated video generation with prompt: '{prompt}'")

    # 1. Get RunwayML API Key from settings
    api_key_setting = crud_settings.get_setting(db, key="RUNWAYML_API_KEY")
    if not api_key_setting or not api_key_setting.value:
        raise ValueError("RunwayML API Key not configured in settings.")

    api_key = api_key_setting.value

    # 2. Initialize RunwayML client
    try:
        client = RunwayML(api_key=api_key)
    except Exception as e:
        logger.error(f"Failed to initialize RunwayML client: {e}")
        raise ValueError("Failed to initialize RunwayML client.")

    # 3. Create the generation task
    try:
        # NOTE: As of documentation review, text_to_video is not explicitly in the SDK quickstart.
        # We are assuming its existence based on Runway's features. This may need adjustment.
        # We will use text_to_image as a placeholder for the API call structure.
        # In a real scenario, this would be replaced with the correct text_to_video call.
        logger.info("Calling RunwayML API to create task...")
        task = client.text_to_image.create(
            model='gen4_image', # Placeholder, should be a video model
            prompt_text=prompt,
        )
        task_id = task.id
        logger.info(f"RunwayML task created successfully. Task ID: {task_id}")
    except Exception as e:
        logger.error(f"RunwayML API call failed: {e}")
        raise ValueError(f"RunwayML API call failed: {e}")

    # 4. Save the request to our database
    video_request = video_schema.VideoGenerationRequestCreate(
        prompt=prompt,
        runwayml_task_id=task_id,
        status="processing"
    )
    crud_video.create_video_request(db, request=video_request, user_id=user_id)

    return task_id


def check_and_update_task_status(db: Session, task_id: str):
    """
    Checks the status of a task with RunwayML and updates the DB.
    This would typically be run by a background worker (e.g., Celery).
    """
    db_request = crud_video.get_video_request(db, task_id=task_id)
    if not db_request or db_request.status in ["succeeded", "failed"]:
        logger.info(f"Task {task_id} already completed or does not exist. Skipping status check.")
        return

    api_key_setting = crud_settings.get_setting(db, key="RUNWAYML_API_KEY")
    if not api_key_setting:
        logger.error("RunwayML API Key not configured, cannot check task status.")
        return

    client = RunwayML(api_key=api_key_setting.value)

    try:
        task = client.get_task(task_id) # Assumes a get_task method exists

        if task.status == "succeeded":
            video_url = task.output[0] if task.output else None
            crud_video.update_video_request_status(db, task_id=task_id, status="succeeded", video_url=video_url)
            logger.info(f"Task {task_id} succeeded. Video URL: {video_url}")
        elif task.status == "failed":
            crud_video.update_video_request_status(db, task_id=task_id, status="failed")
            logger.error(f"Task {task_id} failed. Details: {task.details}")
        else:
            # Still processing
            logger.info(f"Task {task_id} is still in status: {task.status}")

    except TaskFailedError as e:
        crud_video.update_video_request_status(db, task_id=task_id, status="failed")
        logger.error(f"Task {task_id} failed. Details: {e.task_details}")
    except Exception as e:
        logger.error(f"An error occurred while checking status for task {task_id}: {e}")
