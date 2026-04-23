import fitz  # PyMuPDF
import io
from typing import Union


def extract_text_from_pdf(file_bytes: Union[bytes, io.BytesIO]) -> str:
    if isinstance(file_bytes, io.BytesIO):
        file_bytes = file_bytes.read()

    text_parts = []

    try:
        with fitz.open(stream=file_bytes, filetype="pdf") as doc:
            if doc.page_count == 0:
                raise ValueError("PDF has no pages")

            for page_num in range(doc.page_count):
                page = doc[page_num]
                text = page.get_text("text")
                if text.strip():
                    text_parts.append(text.strip())

    except fitz.FileDataError as e:
        raise ValueError(f"Invalid or corrupted PDF file: {str(e)}")
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {str(e)}")

    if not text_parts:
        raise ValueError(
            "Could not extract text from PDF. "
            "The file may be image-based or encrypted. "
            "Please use a text-based PDF."
        )

    full_text = "\n\n".join(text_parts)
    lines = full_text.splitlines()
    cleaned_lines = [line.strip() for line in lines if line.strip()]

    cleaned_text = "\n".join(cleaned_lines)

    if len(cleaned_text) < 100:
        raise ValueError(
            "Extracted text is too short. "
            "Please ensure your PDF contains readable text content."
        )

    return cleaned_text