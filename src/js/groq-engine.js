/**
 * SYNCHROTECH 2026 — Groq Cloud LLM Streaming Client
 * Powered by Groq Ultra-Low Latency Inference & Festival Knowledge Base
 */

import { CONFIG } from "./config.js";
import { FEST_INFO, DOMAINS, SCHEDULE_DAYS } from "./data.js";

export class GroqEngine {
  constructor() {
    this.apiKey = this.getApiKey();
    this.model = CONFIG.GROQ_MODEL || "qwen/qwen3.8-27b";
    this.systemPrompt = this.buildSystemPrompt();
  }

  setApiKey(key) {
    this.apiKey = (key || "").trim();
    if (this.apiKey) {
      localStorage.setItem("SYNCHRO_GROQ_API_KEY", this.apiKey);
    } else {
      localStorage.removeItem("SYNCHRO_GROQ_API_KEY");
    }
  }

  getApiKey() {
    const fromConfig = CONFIG.GROQ_API_KEY?.trim() || "";
    const fromStorage = localStorage.getItem("SYNCHRO_GROQ_API_KEY")?.trim() || "";
    
    // Config takes precedence if valid, else storage
    if (fromConfig && fromConfig.startsWith("gsk_")) {
      return fromConfig;
    }
    if (fromStorage && fromStorage.startsWith("gsk_")) {
      return fromStorage;
    }
    return fromConfig || fromStorage || "";
  }

  hasApiKey() {
    const key = this.getApiKey();
    return Boolean(key && key.startsWith("gsk_"));
  }

  buildSystemPrompt() {
    const domainsSummary = DOMAINS.map(d => {
      const eventsSummary = d.events.map(e => `  - Event: ${e.name} (${e.type}) | Tagline: "${e.tagline}" | Rounds: ${e.rounds.map(r => r.name).join(", ")}`).join("\n");
      return `DOMAIN: ${d.name} (${d.fullName})
  Spectral Color: ${d.colorName} (${d.color})
  Domain Lead: ${d.head.name} (Student ID: ${d.head.id}, Phone: +91 ${d.head.phone})
  Tagline: "${d.tagline}"
  Lore: "${d.lore}"
${eventsSummary}`;
    }).join("\n\n");

    const scheduleSummary = SCHEDULE_DAYS.map(day => {
      const dayEvents = day.events.map(ev => `  • ${ev.time} [${ev.venue}]: ${ev.domain} — ${ev.event}`).join("\n");
      return `${day.label} (${day.date}):\n${dayEvents}`;
    }).join("\n\n");

    return `You are "SYNCHRO-AI", the cutting-edge neural concierge and intelligent voice AI for SYNCHROTECH 2026.

=== EVENT INFORMATION ===
Event: ${FEST_INFO.name} — "${FEST_INFO.tagline}" (${FEST_INFO.subtitle})
Host: ${FEST_INFO.institution}, ${FEST_INFO.school}, ${FEST_INFO.department}
Dates: ${FEST_INFO.dates} (September 7 to 11, 2026)
Principal / Patron: Rev. Fr. Dr. Augustine George CMI
Venue: M1 Auditorium (Inauguration) & Specialized Computing Labs

Student Coordinators:
- Dhruv Soin (ID: 24DTSA22, Ph: 9560855503) [AIML & Data Science Dept]
- Emy Elizabeth Oommen (ID: 24BCYA47, Ph: 9497052528)

Awards & Recognition:
- 7 Stars of Synchrotech (top individual per domain across events)
- Overall Champions (domain with highest cumulative points)

=== DOMAINS & EVENTS (8 DOMAINS, 12 EVENTS) ===
${domainsSummary}

=== 5-DAY MASTER SCHEDULE ===
${scheduleSummary}

=== INSTRUCTIONS FOR RESPONSE ===
1. Persona: Highly intelligent, futuristic, warm, encouraging, and concise. Speak as the official voice of Synchrotech 2026.
2. Formats: Use clean, concise Markdown with bullet points where appropriate. Keep answers under 3-4 sentences unless detailed event rules/schedules are requested.
3. If asked about AIML, highlight that it explores neural frontiers, autonomous intelligence, Zero Verdict (solo with AI coins auction) and Overdrive (duo prompt engineering).
4. If asked how to register or participate, mention the domain QR codes and contact numbers of domain heads.
5. If asked about the invitation, invite them enthusiastically to Kristu Jayanti University from Sept 7–11, 2026 (Inauguration on 11th Sept at M1 Audi) to "Decode The Spectrum"!`;
  }

  /**
   * Stream response from Groq LLM API with fallback to alternative model or local fallback
   */
  async streamQuery(messages, onToken, onComplete, onError) {
    const activeKey = this.getApiKey();
    if (!activeKey || !activeKey.startsWith("gsk_")) {
      return false; // Signals to use local fallback
    }

    const candidateModels = [
      this.model,
      ...(CONFIG.GROQ_MODELS_FALLBACK || ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"])
    ];

    for (const modelToTry of candidateModels) {
      try {
        const response = await fetch(CONFIG.GROQ_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${activeKey}`
          },
          body: JSON.stringify({
            model: modelToTry,
            messages: [
              { role: "system", content: this.systemPrompt },
              ...messages
            ],
            temperature: 0.6,
            max_tokens: 600,
            stream: true
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`Groq API (${modelToTry}) error:`, response.status, errText);
          continue; // Try next model in candidate list
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(":")) continue;
            if (trimmed === "data: [DONE]") continue;

            if (trimmed.startsWith("data: ")) {
              try {
                const json = JSON.parse(trimmed.slice(6));
                const token = json.choices?.[0]?.delta?.content || "";
                if (token) {
                  fullText += token;
                  if (onToken) onToken(token, fullText);
                }
              } catch (e) {
                // ignore chunk boundary parse errors
              }
            }
          }
        }

        if (fullText.trim()) {
          if (onComplete) onComplete(fullText);
          return true;
        }
      } catch (err) {
        console.warn(`Groq Streaming (${modelToTry}) exception:`, err);
      }
    }

    if (onError) onError(new Error("All Groq models failed"));
    return false;
  }

  /**
   * Transcribe recorded audio with Groq Whisper Ultra-Low Latency Engine
   */
  async transcribeAudio(audioBlob) {
    const activeKey = this.getApiKey();
    if (!activeKey || !activeKey.startsWith("gsk_")) {
      throw new Error("No Groq API key configured");
    }

    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");
    formData.append("model", "whisper-large-v3-turbo");
    formData.append("language", "en");

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${activeKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn("Groq Whisper error:", response.status, errText);
      throw new Error(`Whisper transcription failed (${response.status})`);
    }

    const result = await response.json();
    return (result.text || "").trim();
  }
}

export const groqEngine = new GroqEngine();
