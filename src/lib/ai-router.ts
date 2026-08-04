// src/lib/ai-router.ts

import OpenAI from "openai";

// ==================== Types ====================
export interface AIModelConfig {
  name: string;
  baseURL: string;
  apiKey: string;
  model: string;
  priority: number;
}

export interface AIResponse {
  success: boolean;
  text: string;
  modelUsed: string;
  attempts: number;
  error?: string;
}

// ==================== Model Configs ====================
const MODELS: AIModelConfig[] = [
  {
    name: "DeepSeek V4 Flash",
    baseURL: process.env.GAPGPT_BASE_URL || "https://api.gapgpt.app/v1",
    apiKey: process.env.GAPGPT_API_KEY || "",
    model: "deepseek-v4-flash",
    priority: 4,
  },
  {
    name: "GPT-4o Mini",
    baseURL: process.env.GAPGPT_BASE_URL || "https://api.gapgpt.app/v1",
    apiKey: process.env.GAPGPT_API_KEY || "",
    model: "gpt-4o-mini",
    priority: 2,
  },
  {
    name: "Gemini 2.5 Flash Lite",
    baseURL: process.env.GAPGPT_BASE_URL || "https://api.gapgpt.app/v1",
    apiKey: process.env.GAPGPT_API_KEY || "",
    model: "gemini-2.5-flash-lite",
    priority: 1,
  },
  {
    name: "Gemini 3.1 Flash Lite",
    baseURL: process.env.GAPGPT_BASE_URL || "https://api.gapgpt.app/v1",
    apiKey: process.env.GAPGPT_API_KEY || "",
    model: "gemini-3.1-flash-lite",
    priority: 3,
  },
];

// ==================== AI Router ====================
class AIRouter {
  private getActiveModels(): AIModelConfig[] {
    return MODELS
      .filter((m) => m.apiKey && m.apiKey.length > 0)
      .sort((a, b) => a.priority - b.priority);
  }

  async generateText(
    systemPrompt: string,
    userPrompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      responseFormat?: "text" | "json_object";
    }
  ): Promise<AIResponse> {
    const models = this.getActiveModels();

    if (models.length === 0) {
      return {
        success: false,
        text: "",
        modelUsed: "none",
        attempts: 0,
        error: "هیچ مدل فعالی با API Key معتبر یافت نشد",
      };
    }

    let lastError: string | undefined;

    for (const modelConfig of models) {
      console.log(`🔄 Trying: ${modelConfig.name} (${modelConfig.model})`);

      try {
        const client = new OpenAI({
          baseURL: modelConfig.baseURL,
          apiKey: modelConfig.apiKey,
          timeout: 120000,
          maxRetries: 1,
        });

        const completion = await client.chat.completions.create({
          model: modelConfig.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: options?.temperature || 0.8,
          max_tokens: options?.maxTokens || 4096,
          response_format: options?.responseFormat
            ? { type: options.responseFormat }
            : undefined,
        });

        const text = completion.choices[0]?.message?.content || "";

        console.log(`✅ Success: ${modelConfig.name}`);
        console.log(`   Tokens: ${completion.usage?.total_tokens || "N/A"}`);

        return {
          success: true,
          text,
          modelUsed: `${modelConfig.name}`,
          attempts: 1,
        };
      } catch (error: any) {
        lastError = error.message;
        console.error(`❌ ${modelConfig.name} failed:`, error.message?.slice(0, 150));

        if (
          error.status === 429 ||
          error.message?.includes("rate") ||
          error.message?.includes("too many requests")
        ) {
          console.log("⏳ Rate limited, waiting 2 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        continue;
      }
    }

    return {
      success: false,
      text: "",
      modelUsed: "all-failed",
      attempts: models.length,
      error: `همه مدل‌ها خطا دادن: ${lastError}`,
    };
  }

  getAvailableModels(): { name: string; model: string; available: boolean }[] {
    return MODELS.map((m) => ({
      name: m.name,
      model: m.model,
      available: !!(m.apiKey && m.apiKey.length > 0),
    }));
  }
}

export const aiRouter = new AIRouter();