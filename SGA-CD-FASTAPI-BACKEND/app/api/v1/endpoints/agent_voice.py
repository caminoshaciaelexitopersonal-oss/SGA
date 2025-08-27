import speech_recognition as sr
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Any
import tempfile
import os

from app.api import deps
# Assuming the text-based agent logic is in a callable function
# from app.agents.main_agent import invoke_agent_with_text

router = APIRouter()

# Placeholder for the actual agent invocation logic
async def invoke_agent_with_text(db: Session, prompt: str, thread_id: str) -> Any:
    print(f"--- Mock Agent Invocation ---")
    print(f"Received text prompt: '{prompt}' for thread '{thread_id}'")
    response_text = f"He recibido tu audio. Has dicho: '{prompt}'"
    print(f"Agent response: '{response_text}'")
    return {"response": response_text}


@router.post("/invoke_voice")
async def handle_voice_command(
    db: Session = Depends(deps.get_db),
    audio_file: UploadFile = File(...),
    # thread_id would likely be passed as another form field
    # current_user: models.Usuario = Depends(deps.get_current_user),
) -> Any:
    """
    Accepts an audio file, transcribes it to text, and passes it to the agent.
    """

    # The recognizer instance
    r = sr.Recognizer()

    # Save the uploaded file temporarily because the library works with file paths
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_audio_file:
            content = await audio_file.read()
            tmp_audio_file.write(content)
            tmp_audio_file_path = tmp_audio_file.name

        print(f"Audio file saved temporarily to: {tmp_audio_file_path}")

        # Use the audio file as the source
        with sr.AudioFile(tmp_audio_file_path) as source:
            audio_data = r.record(source)  # read the entire audio file

        print("Audio data recorded from file. Starting recognition...")

        # Recognize speech using Google's free web API (as an example)
        # This is a simple, no-key-required option provided by the library.
        # For production, a more robust engine like Whisper or a paid Google API key would be used.
        try:
            text_prompt = r.recognize_google(audio_data, language="es-ES")
            print(f"Speech recognized: '{text_prompt}'")

            # Now, invoke the agent with the transcribed text
            # A placeholder thread_id is used here.
            thread_id = "voice_thread_123"
            agent_response = await invoke_agent_with_text(db, prompt=text_prompt, thread_id=thread_id)

            return agent_response

        except sr.UnknownValueError:
            print("Google Speech Recognition could not understand audio")
            raise HTTPException(status_code=400, detail="No se pudo entender el audio.")
        except sr.RequestError as e:
            print(f"Could not request results from Google Speech Recognition service; {e}")
            raise HTTPException(status_code=500, detail="Error en el servicio de reconocimiento de voz.")

    finally:
        # Clean up the temporary file
        if 'tmp_audio_file_path' in locals() and os.path.exists(tmp_audio_file_path):
            os.remove(tmp_audio_file_path)
            print(f"Temporary audio file {tmp_audio_file_path} removed.")
