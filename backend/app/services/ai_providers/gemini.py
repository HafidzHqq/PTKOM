"""Google Gemini 2.5 Flash provider.

Ref: PRD §13.1 — Provider 1
Uses the new google.genai SDK (replacing deprecated google.generativeai).
"""

import base64
from google import genai
from google.genai import types
from .base import BaseAIProvider, UNIFIED_PROMPT, clean_json


class GeminiProvider(BaseAIProvider):
    """Google Gemini 2.5 Flash provider."""

    name = "gemini"

    def __init__(self, api_key: str, model_name: str = "gemini-2.5-flash"):
        self.client = genai.Client(api_key=api_key)
        self.model_name = model_name

    async def analyze(self, image_base64: str = None, text: str = None) -> dict:
        parts = [types.Part.from_text(text=UNIFIED_PROMPT)]
        
        if image_base64:
            image_bytes = base64.b64decode(image_base64)
            parts.append(types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"))
        
        if text:
            parts.append(types.Part.from_text(text=f"Makanan yang diinput: {text}"))

        response = await self.client.aio.models.generate_content(
            model=self.model_name,
            contents=[types.Content(parts=parts)],
        )
        return clean_json(response.text)
