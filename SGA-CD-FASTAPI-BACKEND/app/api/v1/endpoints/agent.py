from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas
import models
from app.api import deps

router = APIRouter()

@router.post("/invoke", response_model=schemas.AgentInput) # Placeholder response
async def invoke_agent(
    *,
    db: Session = Depends(deps.get_db),
    agent_in: schemas.AgentInput,
    current_user: models.Usuario = Depends(deps.get_current_active_user),
):
    """
    Invokes the appropriate AI agent based on the user's area.
    """
    # TODO: Implement the logic to call the agent service

    if agent_in.area not in ["Cultura", "Deportes"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Area must be 'Cultura' or 'Deportes'."
        )

    # Placeholder logic
    print(f"Agent invoked for thread {agent_in.thread_id} with prompt: {agent_in.prompt} in area {agent_in.area}")

    # This is a placeholder response. The real response will be the agent's output.
    return {"response": "Agent logic not yet implemented."}
