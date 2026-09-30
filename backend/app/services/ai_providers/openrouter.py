"""OpenRouter free model provider.

Ref: PRD §13.1 — Provider 4
"""

from openai import AsyncOpenAI
from .base import BaseAIProvider, UNIFIED_PROMPT, clean_json


class OpenRouterProvider(BaseAIProvider):
    """OpenRouter free model provider via OpenAI-compatible API."""

    name = "openrouter"

    def __init__(self, api_key: str, model_name: str = "qwen/qwen-2.5-vl-72b-instruct:free"):
        self.api_key = api_key
        self.model_name = model_name

    async def analyze(self, image_base64: str) -> dict:
        client = AsyncOpenAI(
            api_key=self.api_key,
            base_url="https://openrouter.ai/api/v1",
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
