"""Mistral Vision (mistral-small-latest) provider.

Ref: PRD §13.1 — Provider 3
"""

from openai import AsyncOpenAI
from .base import BaseAIProvider, UNIFIED_PROMPT, clean_json


class MistralProvider(BaseAIProvider):
    """Mistral Vision provider via OpenAI-compatible API."""

    name = "mistral"

    def __init__(self, api_key: str, model_name: str = "mistral-small-latest"):
        self.api_key = api_key
        self.model_name = model_name

    async def analyze(self, image_base64: str) -> dict:
        client = AsyncOpenAI(
            api_key=self.api_key,
            base_url="https://api.mistral.ai/v1",
        )

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
