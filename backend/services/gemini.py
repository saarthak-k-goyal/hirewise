import os
import json
import re
from typing import Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

#       curl "https://generativelanguage.googleapis.com/v1beta/models/#     gemini-flash-latest:generateContent" \
#         -H 'Content-Type: application/json' \
#         -H 'X-goog-api-key: AIzaSyBjCJfBKxfh5o0eVBATeFI4WLF2MDDryOQ' \
#         -X POST \
#         -d '{
#           "contents": [
#             {
#               "parts": [
#                 {
#                   "text": "Explain how AI works in a few words"
#                 }
#               ]
#             }
#           ]
#         }'

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY environment variable not set")

genai.configure(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = """You are an expert ATS (Applicant Tracking System) specialist and senior career coach with deep knowledge of the Indian job market (Internshala, LinkedIn, Naukri, etc.).

Your task is to analyze a resume against a job description and provide detailed, actionable feedback.

CRITICAL: Respond ONLY with a valid JSON object. No markdown, no code blocks, no preamble, no explanation. Just raw JSON.

The JSON must follow this exact schema:
{
  "match_score": <integer between 0 and 100>,
  "matched_skills": [<array of skill strings found in both resume and JD>],
  "missing_skills": [<array of important skills from JD not found in resume>],
  "weak_bullets": [
    {
      "original": <original weak bullet point from resume as string>,
      "improved": <rewritten version with action verb, metrics, and impact as string>
    }
  ],
  "cover_letter": <a compelling, personalized cover letter as a single string with \\n for line breaks>,
  "summary": <1-2 sentence overall verdict on the match as string>
}

Guidelines:
- match_score: Be realistic. 70+ means strong match, 40-70 moderate, below 40 weak.
- matched_skills: Include both technical skills (Python, React) and soft skills (leadership, communication) that genuinely appear in both.
- missing_skills: List the most critical missing skills that would significantly improve the match.
- weak_bullets: Identify 3-5 bullet points from the resume that could be stronger. Rewrite them with STAR format, quantifiable metrics, and strong action verbs.
- cover_letter: Write a professional, enthusiastic cover letter tailored to the specific role. Include the company context if mentioned in JD. Keep it under 400 words.
- summary: Be direct and honest about the candidacy strength.

If the resume or JD is very short or unclear, still provide the best analysis possible."""


def clean_json_response(raw_response: str) -> str:
    """Remove any markdown code blocks or extra text around JSON."""
    # Remove markdown code blocks
    raw_response = re.sub(r'```(?:json)?\s*', '', raw_response)
    raw_response = raw_response.replace('```', '')

    # Find JSON object boundaries
    start_idx = raw_response.find('{')
    end_idx = raw_response.rfind('}')

    if start_idx == -1 or end_idx == -1:
        raise ValueError("No valid JSON object found in Gemini response")

    return raw_response[start_idx:end_idx + 1]


def analyze_resume_jd(resume_text: str, jd_text: str) -> Dict[str, Any]:
    """
    Send resume and JD to Gemini and return structured analysis.
    """
    if not resume_text or len(resume_text.strip()) < 50:
        raise ValueError("Resume text is too short to analyze")

    if not jd_text or len(jd_text.strip()) < 50:
        raise ValueError("Job description text is too short to analyze")

    # Truncate to avoid token limits (Gemini Flash has large context but let's be safe)
    max_resume_chars = 8000
    max_jd_chars = 4000

    if len(resume_text) > max_resume_chars:
        resume_text = resume_text[:max_resume_chars] + "\n[Resume truncated for analysis]"

    if len(jd_text) > max_jd_chars:
        jd_text = jd_text[:max_jd_chars] + "\n[JD truncated for analysis]"

    user_prompt = f"""Resume:
{resume_text}

Job Description:
{jd_text}"""

    model = genai.GenerativeModel(
        model_name="gemini-flash-latest",
        system_instruction=SYSTEM_PROMPT,
        generation_config=genai.GenerationConfig(
            temperature=0.3,
            top_p=0.95,
            max_output_tokens=4096,
        ),
    )

    try:
        response = model.generate_content(user_prompt)
        raw_text = response.text
    except Exception as e:
        raise RuntimeError(f"Gemini API call failed: {str(e)}")

    cleaned = clean_json_response(raw_text)

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse Gemini response as JSON: {str(e)}\nRaw: {cleaned[:500]}")

    # Validate and normalize the response
    parsed = validate_and_normalize_analysis(parsed)

    return parsed


def validate_and_normalize_analysis(data: Dict[str, Any]) -> Dict[str, Any]:
    """Ensure the analysis has all required fields with correct types."""

    # match_score
    score = data.get("match_score", 0)
    if not isinstance(score, (int, float)):
        try:
            score = int(str(score).strip('%'))
        except (ValueError, TypeError):
            score = 0
    data["match_score"] = max(0, min(100, int(score)))

    # matched_skills
    matched = data.get("matched_skills", [])
    if not isinstance(matched, list):
        matched = []
    data["matched_skills"] = [str(s).strip() for s in matched if s]

    # missing_skills
    missing = data.get("missing_skills", [])
    if not isinstance(missing, list):
        missing = []
    data["missing_skills"] = [str(s).strip() for s in missing if s]

    # weak_bullets
    bullets = data.get("weak_bullets", [])
    if not isinstance(bullets, list):
        bullets = []
    valid_bullets = []
    for b in bullets:
        if isinstance(b, dict) and "original" in b and "improved" in b:
            valid_bullets.append({
                "original": str(b["original"]).strip(),
                "improved": str(b["improved"]).strip(),
            })
    data["weak_bullets"] = valid_bullets

    # cover_letter
    cl = data.get("cover_letter", "")
    if not isinstance(cl, str):
        cl = str(cl)
    data["cover_letter"] = cl.strip()

    # summary
    summary = data.get("summary", "")
    if not isinstance(summary, str):
        summary = str(summary)
    data["summary"] = summary.strip()

    return data