/**
 * SYNCHROTECH 2026 — Configuration & API Keys
 * Powered by Groq Ultra-Low Latency Inference & Festival Knowledge Base
 */

export const CONFIG = {
  // Set your Groq API Key here or enter it via the browser localStorage / UI
  GROQ_API_KEY: "",
  GROQ_MODEL: "qwen/qwen3.8-27b",
  GROQ_MODELS_FALLBACK: ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"],
  GROQ_ENDPOINT: "https://api.groq.com/openai/v1/chat/completions",
  ENABLE_VOICE_AUTO_SPEAK: true,
  FEST_NAME: "SYNCHROTECH 2026",
  TAGLINE: "DECODE THE SPECTRUM"
};
