"""Round-Robin AI Load Balancer.

Distributes requests evenly across 4 AI providers with auto-failover.
Ref: PRD §6 — Mekanisme Round-Robin
"""

import logging
from typing import Optional

from app.core.config import get_settings
from app.models.schemas import FoodAnalysisResult
from .ai_providers.gemini import GeminiProvider
from .ai_providers.groq_provider import GroqProvider
from .ai_providers.mistral import MistralProvider
from .ai_providers.openrouter import OpenRouterProvider

logger = logging.getLogger(__name__)


class AILoadBalancer:
    """Round-robin load balancer across 4 AI providers with failover."""

    def __init__(self):
        settings = get_settings()
        self._providers = []
        self._current_index = 0
        self._daily_usage: dict[str, int] = {}
        self._daily_limits = {
            "gemini": 1500,
            "groq": 1000,
            "mistral": 500,
            "openrouter": 500,
        }

        # Initialize providers with available API keys
        if settings.GEMINI_API_KEY:
            self._providers.append(GeminiProvider(settings.GEMINI_API_KEY, settings.GEMINI_MODEL))
        if settings.GROQ_API_KEY:
            self._providers.append(GroqProvider(settings.GROQ_API_KEY, settings.GROQ_MODEL))
        if settings.MISTRAL_API_KEY:
            self._providers.append(MistralProvider(settings.MISTRAL_API_KEY, settings.MISTRAL_MODEL))
        if settings.OPENROUTER_API_KEY:
            self._providers.append(OpenRouterProvider(settings.OPENROUTER_API_KEY, settings.OPENROUTER_MODEL))

        if not self._providers:
            logger.warning("No AI providers configured! Set API keys in .env")

        # Initialize usage counters
        for p in self._providers:
            self._daily_usage[p.name] = 0

    async def analyze_food(self, image_base64: Optional[str] = None, text: Optional[str] = None) -> FoodAnalysisResult:
        """Analyze food image or text using round-robin AI providers with failover."""
        if not self._providers:
            raise RuntimeError("No AI providers configured. Set API keys in .env")

        max_retries = len(self._providers)
        last_error: Optional[Exception] = None

        for attempt in range(max_retries):
            provider = self._providers[self._current_index % len(self._providers)]
            self._current_index += 1

            # Skip if provider has reached daily limit
            limit = self._daily_limits.get(provider.name, 500)
            if self._daily_usage.get(provider.name, 0) >= limit:
                logger.info(f"[Load Balancer] {provider.name} at daily limit, skipping")
                continue

            try:
                logger.info(f"[Load Balancer] Using provider: {provider.name}")
                if image_base64:
                    result_dict = await provider.analyze(image_base64=image_base64)
                else:
                    result_dict = await provider.analyze(text=text)
                self._daily_usage[provider.name] = (
                    self._daily_usage.get(provider.name, 0) + 1
                )
                return FoodAnalysisResult(**result_dict)
            except Exception as e:
                logger.warning(
                    f"[Load Balancer] {provider.name} failed: {e}, trying next..."
                )
                last_error = e
                continue

        raise RuntimeError(
            f"Semua AI provider sedang tidak tersedia. Last error: {last_error}"
        )

    def reset_daily_counters(self):
        """Reset daily usage counters (call at midnight)."""
        for name in self._daily_usage:
            self._daily_usage[name] = 0
        logger.info("[Load Balancer] Daily counters reset")

    def get_status(self) -> dict:
        """Get current status of all providers."""
        return {
            "providers": [
                {
                    "name": p.name,
                    "used": self._daily_usage.get(p.name, 0),
                    "limit": self._daily_limits.get(p.name, 500),
                }
                for p in self._providers
            ],
            "total_configured": len(self._providers),
        }


# Singleton instance
_load_balancer: Optional[AILoadBalancer] = None


def get_load_balancer() -> AILoadBalancer:
    global _load_balancer
    if _load_balancer is None:
        _load_balancer = AILoadBalancer()
    return _load_balancer
