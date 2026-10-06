"""Mistral Vision (mistral-small-latest) provider.

Ref: PRD §13.1 — Provider 3
"""

from openai import AsyncOpenAI
from .base import BaseAIProvider, UNIFIED_PROMPT, clean_json


class MistralProvider(BaseAIProvider):
    """Mistral Vision provider via OpenAI-compatible API."""

    name = "mistral"

    def __init__(self, api_key: str, model_name: str = "pixtral-12b-2409"):
        self.api_key = api_key
        self.model_name = model_name

    async def analyze(self, image_base64: str = None, text: str = None) -> dict:
        client = AsyncOpenAI(
            api_key=self.api_key,
            base_url="https://api.mistral.ai/v1",
        )

        content = [{"type": "text", "text": UNIFIED_PROMPT}]
        if image_base64:
            content.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{image_base64}"
                },
            })
        if text:
            content.append({"type": "text", "text": f"Makanan yang diinput: {text}"})

        result = await client.chat.completions.create(
            model=self.model_name,
            messages=[
                {
                    "role": "user",
                    "content": content,
                }
            ],
            response_format={"type": "json_object"},
        )
        return clean_json(result.choices[0].message.content or "{}")
