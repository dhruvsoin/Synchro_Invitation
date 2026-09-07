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
    if (typeof localStorage !== "undefined") {
      if (this.apiKey) {
        localStorage.setItem("SYNCHRO_GROQ_API_KEY", this.apiKey);
      } else {
        localStorage.removeItem("SYNCHRO_GROQ_API_KEY");
      }
    }
  }

  getApiKey() {
    const fromConfig = CONFIG.GROQ_API_KEY?.trim() || "";
    let fromStorage = "";
    if (typeof localStorage !== "undefined" && typeof localStorage.getItem === "function") {
      fromStorage = localStorage.getItem("SYNCHRO_GROQ_API_KEY")?.trim() || "";
    }
    
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

    return `You are "SYNCHRO-AI", the charismatic, razor-sharp neural AI concierge and voice companion for SYNCHROTECH 2026 at Kristu Jayanti University.

=== PERSONA & CONVERSATIONAL STYLE ===
- Persona: Witty, warm, charismatic, ultra-smart, and conversational.
- Fluid Dialogue: Always converse naturally. If the user asks small talk, banter, jokes, philosophical queries, or teases you (e.g., "are you dumb", "what's up", "who is the best"), reply with charm, wit, and humor, keeping it friendly and conversational!
- Context-Aware: Seamlessly connect casual conversation back to the excitement of Synchrotech 2026.
- Conciseness for Voice: Keep conversational replies punchy and natural (1-3 sentences) so it sounds great spoken aloud. Only provide long multi-bullet responses if explicitly asked for a full list or complete schedule.
- Never sound like a rigid automated menu or robotic FAQ. Speak with authentic voice and personality.

=== EVENT INFORMATION ===
Event: ${FEST_INFO.name} — "${FEST_INFO.tagline}" (${FEST_INFO.subtitle})
Host: ${FEST_INFO.institution}, ${FEST_INFO.school}, ${FEST_INFO.department}
Dates: ${FEST_INFO.dates} (September 7 to 11, 2026)
Chancellor: Rev. Fr. Santhosh Mathenkunnel, CMI
Vice Chancellor & Patron: Rev. Fr. Dr. Augustine George, CMI
Pro Vice Chancellor: Rev. Fr. Dr. Lijo P. Thomas, CMI
Registrar: Dr. Aloysius Edward J.
Dean: Dr. Sevuga Pandian A (School of Computational and Physical Sciences)
Chief Finance Officer (CFO): Fr. Dr. Jais V Thomas CMI
CHRO & Director, School of Humanities: Fr. Joshy Mathew CMI
Director, Research & Development & Global Collaborations: Fr. Dr. Marialal Joseph CMI
Director, Student Welfare Office (SWO) & LCA/Hostels: Fr. Deepu Joy CMI
Head of Department (HOD): Dr. K. Kalaiselvi
Program Coordinator: Dr. Stephen A
Faculty Coordinators: Dr. Shiva Prasad, Prof. Ritika Shrimali (meet at Computational Studies faculty cabins or contact student leads)
Venue: M1 Auditorium (Inauguration on Sep 11 at 9:30 AM) & Campus Computing Labs (Daily rounds 4:30 PM - 6:00 PM)

Student Coordinators:
- Dhruv Soin (ID: 24DTSA22, Ph: +91 9560855503) [AIML & Data Science Dept]
- Emy Elizabeth Oommen (ID: 24BCYA47, Ph: +91 9497052528)

Awards & Recognition:
- 7 Stars of Synchrotech (top individual per domain across events)
- Overall Champions (domain with highest cumulative points)

=== DOMAINS & EVENTS (8 DOMAINS, 12 EVENTS) ===
${domainsSummary}

=== 5-DAY MASTER SCHEDULE ===
${scheduleSummary}`;
  }

  /**
   * Stream response from Groq LLM API with fallback to Vercel /api/chat proxy or local fallback
   */
  async streamQuery(messages, onToken, onComplete, onError) {
    const activeKey = this.getApiKey();

    // 1. Direct Groq Cloud API if client API key is configured
    if (activeKey && activeKey.startsWith("gsk_")) {
      const candidateModels = [
        this.model,
        ...(CONFIG.GROQ_MODELS_FALLBACK || ["qwen/qwen3.8-27b", "qwen/qwen3.6-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b", "groq/compound-mini"])
      ];
      const uniqueModels = [...new Set(candidateModels.filter(Boolean))];

      for (const modelToTry of uniqueModels) {
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
              max_tokens: 180,
              stream: true
            })
          });

          if (!response.ok) {
            const errText = await response.text();
            console.warn(`Groq API (${modelToTry}) error:`, response.status, errText);
            continue;
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
                } catch (e) {}
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
    }

    // 2. Try Vercel Serverless /api/chat proxy (uses process.env.GROQ_API_KEY)
    try {
      const proxyRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: this.systemPrompt },
            ...messages
          ],
          model: this.model
        })
      });

      if (proxyRes.ok) {
        const data = await proxyRes.json();
        if (data && !data.fallback && data.choices?.[0]?.message?.content) {
          const content = data.choices[0].message.content;
          // Simulate rapid streaming of response
          const words = content.split(" ");
          let cur = "";
          for (let i = 0; i < words.length; i++) {
            cur += (i === 0 ? "" : " ") + words[i];
            if (onToken) onToken(words[i], cur);
            await new Promise(r => setTimeout(r, 15));
          }
          if (onComplete) onComplete(content);
          return true;
        }
      }
    } catch (e) {
      // /api/chat not available on standalone static server; seamlessly fall back
    }

    if (onError) onError(new Error("Cloud LLM unavailable, using neural fallback"));
    return false;
  }

  /**
   * Transcribe recorded audio with Groq Whisper Ultra-Low Latency Engine
   */
  async transcribeAudio(audioBlob) {
    const activeKey = this.getApiKey();

    if (activeKey && activeKey.startsWith("gsk_")) {
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

      if (response.ok) {
        const result = await response.json();
        return (result.text || "").trim();
      }
    }

    // Try Vercel Serverless /api/transcribe proxy
    try {
      const proxyRes = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "audio/webm" },
        body: audioBlob
      });

      if (proxyRes.ok) {
        const result = await proxyRes.json();
        return (result.text || "").trim();
      }
    } catch (e) {}

    throw new Error("Speech transcription service unavailable");
  }
}

export const groqEngine = new GroqEngine();
