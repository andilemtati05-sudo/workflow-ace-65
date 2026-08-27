import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Lovable AI Gateway provider. Server-only: the API key never reaches the browser.
 */
export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey },
  });
}

export const WORKFLOW_MODEL = "google/gemini-3.7-flash";

export function requireGatewayKey() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured for this workspace.");
  return key;
}

export function gatewayErrorMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error);
  if (raw.includes("429")) return "The AI service is rate limited right now. Please try again shortly.";
  if (raw.includes("402"))
    return "This workspace is out of AI credits. Add credits in Lovable to continue generating.";
  if (raw.includes("403")) return "AI access is blocked for this workspace by an administrator.";
  if (raw.includes("401")) return "AI is not configured correctly (invalid API key).";
  return raw || "The AI request failed. Please try again.";
}
