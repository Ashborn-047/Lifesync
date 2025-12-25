from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict
from compute_ocean import PersonalityScorer

app = FastAPI()

# Initialize scorer
scorer = PersonalityScorer('questions.json')

class ComputeRequest(BaseModel):
    answers: Dict[str, int]

@app.post("/compute")
async def compute(request: ComputeRequest):
    try:
        results = scorer.score(request.answers)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok"}
