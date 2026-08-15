# AI Service – CareerPath (Optional Module)

**This module is optional.** The main CareerPath platform (frontend + backend) works completely fine without it. Every core feature — skill gap analysis, recommendations, roadmap, the analyzer tools — is rule-based and does not depend on this service in any way.

## What This Does

When it's running and enabled, this service adds short AI-generated explanations on top of results the backend has already calculated, for example:

- A plain-language explanation of your skill gap report
- A short summary of why certain courses were recommended
- Suggestions for improving a resume
- A written summary of a GitHub profile
- Feedback on a portfolio site

If this service is off, not configured, or crashes, none of that breaks anything — those specific extra explanation sections just don't show up, and the rest of the app keeps working normally.

## How It Talks to the Main Platform

The React frontend never talks to this service directly. The Node backend calls it internally (server-to-server) through a small gateway module, using a shared internal key so this service can't be reached from anywhere else. If the request fails for any reason, the backend just falls back to showing the rule-based result on its own.

## Technology Stack

- Python
- FastAPI
- An LLM provider (OpenAI-compatible API — this project was tested with Gemini's OpenAI-compatible endpoint, but any compatible provider works)

## Setup

```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

## Environment Variables

INTERNAL_API_KEY=YOUR_SHARED_SECRET
LLM_API_KEY=YOUR_LLM_API_KEY
LLM_BASE_URL=YOUR_LLM_PROVIDER_BASE_URL
LLM_MODEL=YOUR_MODEL_NAME


`INTERNAL_API_KEY` needs to match the backend's `AI_SERVICE_INTERNAL_KEY` value.

## Running

```bash
uvicorn app.main:app --reload --port 8000
```

Check it's up: `GET http://localhost:8000/health`

## Enabling It in the Main App

Even with this service running, it also needs to be turned on from the Admin Panel in the main app (Feature Flags → AI Feature Enabled). This is a separate on/off switch so AI features can be turned off instantly at any time without touching any code or restarting anything.

## Example Workflow

1. User runs a Skill Gap Analysis in the app
2. The backend calculates the score and gaps itself (this always happens, AI or not)
3. If this service is running and enabled, the backend sends it the calculated data and asks for a short written explanation
4. If that succeeds, the explanation shows up on the page with an "AI Enhanced" label
5. If it fails or isn't running, the page just shows the calculated result with no explanation section — nothing breaks