with open("frontend/src/lib/ai/index.ts", "r") as f:
    content = f.read()

content = content.replace(
    'return cleanJson(result.choices[0]?.message?.content || "{}");\n  },\n};\n\nconst mistralAdapter',
    '''const parsed = cleanJson(result.choices[0]?.message?.content || "{}");
    
    parsed.metadata = {
      provider: "Groq",
      model: process.env.GROQ_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct",
      usage: result.usage ? {
        promptTokens: result.usage.prompt_tokens || 0,
        completionTokens: result.usage.completion_tokens || 0,
        totalTokens: result.usage.total_tokens || 0,
      } : undefined
    };

    return parsed;
  },
};

const mistralAdapter'''
)

content = content.replace(
    'return cleanJson(result.choices[0]?.message?.content || "{}");\n  },\n};\n\nconst openrouterAdapter',
    '''const parsed = cleanJson(result.choices[0]?.message?.content || "{}");
    
    parsed.metadata = {
      provider: "Mistral",
      model: process.env.MISTRAL_MODEL || "mistral-small-latest",
      usage: result.usage ? {
        promptTokens: result.usage.prompt_tokens || 0,
        completionTokens: result.usage.completion_tokens || 0,
        totalTokens: result.usage.total_tokens || 0,
      } : undefined
    };

    return parsed;
  },
};

const openrouterAdapter'''
)

content = content.replace(
    'return cleanJson(result.choices[0]?.message?.content || "{}");\n  },\n};\n\nconst AI_PROVIDERS',
    '''const parsed = cleanJson(result.choices[0]?.message?.content || "{}");
    
    parsed.metadata = {
      provider: "OpenRouter",
      model: "qwen/qwen-2.5-vl-72b-instruct:free",
      usage: result.usage ? {
        promptTokens: result.usage.prompt_tokens || 0,
        completionTokens: result.usage.completion_tokens || 0,
        totalTokens: result.usage.total_tokens || 0,
      } : undefined
    };

    return parsed;
  },
};

const AI_PROVIDERS'''
)

with open("frontend/src/lib/ai/index.ts", "w") as f:
    f.write(content)
