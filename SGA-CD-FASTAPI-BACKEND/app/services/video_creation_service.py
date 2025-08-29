import time
import uuid
from typing import Dict, Any
from runwayml import RunwayML, TaskFailedError
from openai import OpenAI

# --- In-memory Job Store (for this example) ---
# In a real production app, you would use a persistent database like Redis or a SQL table.
JOB_DB: Dict[str, Dict[str, Any]] = {}

class VideoCreationService:
    """
    A service to interact with RunwayML and OpenAI APIs.
    """
    def __init__(self, runway_api_key: str, openai_api_key: str):
        if not runway_api_key:
            raise ValueError("RunwayML API key is required.")
        if not openai_api_key:
            raise ValueError("OpenAI API key is required.")

        self.runway_client = RunwayML(api_key=runway_api_key)
        self.openai_client = OpenAI(api_key=openai_api_key)

    def start_video_generation(self, prompt: str) -> str:
        """
        Starts a two-step video generation process:
        1. Generate an image from the prompt using DALL-E 3.
        2. Use that image to generate a video using RunwayML.
        """
        print(f"REAL API: Starting video generation for prompt: '{prompt}'")

        # Step 1: Generate an image with DALL-E 3
        try:
            print("Generating seed image with DALL-E 3...")
            image_response = self.openai_client.images.generate(
                model="dall-e-3",
                prompt=f"A cinematic, high-quality seed image for a video. {prompt}",
                n=1,
                size="1024x1024", # or "1792x1024"
                response_format="url"
            )
            image_url = image_response.data[0].url
            print(f"Seed image generated: {image_url}")
        except Exception as e:
            print(f"Error generating image with DALL-E: {e}")
            raise ValueError(f"Failed to generate seed image: {e}")

        # Step 2: Generate a video with RunwayML using the image
        try:
            print("Starting video generation task with RunwayML...")
            task = self.runway_client.image_to_video.create(
                model='gen4_turbo',
                prompt_image_url=image_url,
                prompt_text=prompt,
                # These are example parameters, they might need adjustment
                ratio='16:9',
                duration=4,
                motion_score=10
            )
            job_id = task.id
            print(f"RunwayML task created with ID: {job_id}")

            # Store job info
            JOB_DB[job_id] = {
                "status": "pending",
                "prompt": prompt,
                "created_at": time.time(),
                "video_url": None,
                "error": None
            }
            return job_id
        except Exception as e:
            print(f"Error starting RunwayML task: {e}")
            raise ValueError(f"Failed to start video generation task: {e}")


    def get_video_generation_status(self, job_id: str) -> Dict[str, Any]:
        """
        Checks the status of a video generation job using the RunwayML SDK.
        """
        print(f"REAL API: Checking status for job ID: {job_id}")

        if job_id not in JOB_DB:
            raise ValueError("Job not found in our local tracking DB.")

        try:
            task = self.runway_client.tasks.retrieve(job_id)

            JOB_DB[job_id]['status'] = task.status

            if task.status == 'SUCCEEDED':
                JOB_DB[job_id]['video_url'] = task.output.video_url
            elif task.status == 'FAILED':
                JOB_DB[job_id]['error'] = task.output.error_message

            return {
                "job_id": job_id,
                "status": task.status,
                "video_url": getattr(task.output, 'video_url', None),
                "error": getattr(task.output, 'error_message', None)
            }
        except Exception as e:
            print(f"Error retrieving task status from RunwayML: {e}")
            raise ValueError(f"Failed to retrieve task status: {e}")


def get_video_service(db_session) -> VideoCreationService:
    """
    Dependency to get the video creation service, configured with API keys.
    """
    from app import crud
    runway_key_obj = crud.settings.get_setting(db_session, key="runwayml_api_key")
    openai_key_obj = crud.settings.get_setting(db_session, key="openai_api_key")

    runway_api_key = runway_key_obj.value if runway_key_obj else None
    openai_api_key = openai_key_obj.value if openai_key_obj else None

    # The service will raise an error if keys are missing.
    return VideoCreationService(runway_api_key=runway_api_key, openai_api_key=openai_api_key)

def get_completed_videos() -> list:
    """
    Scans the mock job database and returns a list of completed videos.
    """
    completed = []
    for job_id, job_details in JOB_DB.items():
        if job_details["status"] == "SUCCEEDED":
            completed.append({
                "job_id": job_id,
                "prompt": job_details["prompt"],
                "video_url": job_details["video_url"]
            })
    return completed
