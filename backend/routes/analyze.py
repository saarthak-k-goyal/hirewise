from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse
from typing import List
from datetime import datetime, timezone
from bson import ObjectId
import io

from db import get_db
from auth_utils import get_current_user
from services.pdf_parser import extract_text_from_pdf
from services.gemini import analyze_resume_jd
from models.analysis import AnalysisDocument, AnalysisListItem, AnalysisResult

from datetime import datetime, timezone, timedelta

router = APIRouter(tags=["Analysis"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
COOLDOWN_SECONDS = 30  # one analysis per 30 seconds per user

def check_rate_limit(user_id: str, db):
    recent = db["analyses"].find_one(
        {"user_id": user_id},
        sort=[("created_at", -1)]
    )
    if recent:
        elapsed = datetime.now(timezone.utc) - recent["created_at"].replace(tzinfo=timezone.utc)
        if elapsed.total_seconds() < COOLDOWN_SECONDS:
            remaining = int(COOLDOWN_SECONDS - elapsed.total_seconds())
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {remaining} seconds before analyzing again"
            )

def serialize_analysis(doc: dict) -> dict:
    """Convert MongoDB document to JSON-serializable dict."""
    return {
        "id": str(doc["_id"]),
        "user_id": str(doc["user_id"]),
        "resume_text": doc.get("resume_text", ""),
        "jd_text": doc.get("jd_text", ""),
        "result": doc.get("result", {}),
        "created_at": doc["created_at"].isoformat(),
        "jd_preview": doc.get("jd_preview", ""),
    }


def serialize_list_item(doc: dict) -> dict:
    """Convert MongoDB document to list item format."""
    return {
        "id": str(doc["_id"]),
        "jd_preview": doc.get("jd_preview", "No preview available"),
        "match_score": doc.get("result", {}).get("match_score", 0),
        "summary": doc.get("result", {}).get("summary", ""),
        "created_at": doc["created_at"].isoformat(),
    }


@router.post("/analyze")
async def analyze(
    resume: UploadFile = File(..., description="Resume PDF file"),
    jd_text: str = Form(..., description="Job description text"),
    current_user: dict = Depends(get_current_user),
):
    # Validate file type
    if not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are accepted for resume upload",
        )

    if resume.content_type and resume.content_type != "application/pdf":
        if "pdf" not in resume.content_type.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file must be a PDF",
            )

    # Read file
    file_bytes = await resume.read()

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed size of {MAX_FILE_SIZE // 1024 // 1024}MB",
        )

    # Validate JD
    jd_text = jd_text.strip()
    if len(jd_text) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description is too short. Please provide a complete job description.",
        )

    # Parse PDF
    try:
        resume_text = extract_text_from_pdf(file_bytes)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process PDF: {str(e)}",
        )

    # Call Gemini
    try:
        analysis_result = analyze_resume_jd(resume_text, jd_text)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}",
        )

    # Create JD preview (first 150 chars)
    jd_preview = jd_text[:150].strip()
    if len(jd_text) > 150:
        jd_preview += "..."

    # Save to MongoDB
    db = get_db()
    check_rate_limit(current_user["id"], db)
    now = datetime.now(timezone.utc)

    doc = {
        "user_id": current_user["id"],
        "resume_text": resume_text,
        "jd_text": jd_text,
        "jd_preview": jd_preview,
        "result": analysis_result,
        "created_at": now,
    }

    result = db["analyses"].insert_one(doc)
    doc["_id"] = result.inserted_id

    return JSONResponse(
        content=serialize_analysis(doc),
        status_code=status.HTTP_201_CREATED,
    )


@router.get("/history")
async def get_history(
    current_user: dict = Depends(get_current_user),
    limit: int = 20,
    skip: int = 0,
):
    db = get_db()

    # Only fetch fields needed for list view
    projection = {
        "_id": 1,
        "jd_preview": 1,
        "result.match_score": 1,
        "result.summary": 1,
        "created_at": 1,
    }

    cursor = (
        db["analyses"]
        .find({"user_id": current_user["id"]}, projection)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )

    items = [serialize_list_item(doc) for doc in cursor]
    total = db["analyses"].count_documents({"user_id": current_user["id"]})

    return {
        "items": items,
        "total": total,
        "limit": limit,
        "skip": skip,
    }


@router.get("/history/{analysis_id}")
async def get_analysis(
    analysis_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()

    try:
        obj_id = ObjectId(analysis_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid analysis ID format",
        )

    doc = db["analyses"].find_one({
        "_id": obj_id,
        "user_id": current_user["id"],
    })

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found",
        )

    return JSONResponse(content=serialize_analysis(doc))


@router.delete("/history/{analysis_id}", status_code=status.HTTP_200_OK)
async def delete_analysis(
    analysis_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()

    try:
        obj_id = ObjectId(analysis_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid analysis ID format",
        )

    result = db["analyses"].delete_one({
        "_id": obj_id,
        "user_id": current_user["id"],
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found or already deleted",
        )

    return {"message": "Analysis deleted successfully"}