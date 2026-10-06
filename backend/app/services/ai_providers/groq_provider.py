"""Groq — Llama 4 Scout provider.

Ref: PRD §13.1 — Provider 2
"""

from groq import AsyncGroq
from .base import BaseAIProvider, UNIFIED_PROMPT, clean_json


class GroqProvider(BaseAIProvider):
    """Groq — Llama 4 Scout provider."""

    name = "groq"

    def __init__(self, api_key: str, model_name: str = "llama-3.2-11b-vision-preview"):
        self.api_key = api_key
        self.model_name = model_name

    async def analyze(self, image_base64: str) -> dict:
        client = AsyncGroq(api_key=self.api_key)

        result = await client.chat.completions.create(
            model=self.model_name,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": UNIFIED_PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            },
                        },
                    ],
                }
            ],
            response_format={"type": "json_object"},
        )
        return clean_json(result.choices[0].message.content or "{}")
