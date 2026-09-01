/**
 * SYNCHROTECH 2026 — SYNCHRO-AI Voice Engine & LLM Concierge
 * One-Shot Voice Trigger (Listens ONLY on Press V or Click Mic),
 * Powered by Groq Whisper Audio Transcription, Groq Qwen Streaming & Natural Speech Synthesis.
 */

import { FEST_INFO, DOMAINS, SCHEDULE_DAYS } from "./data.js";
import { soundEngine } from "./sound-engine.js";
import { groqEngine } from "./groq-engine.js";
import { CONFIG } from "./config.js";

export class AIAssistant {
  constructor(options = {}) {
    this.onSpeakingStateChange = options.onSpeakingStateChange || (() => {});
    this.onStreamToken = options.onStreamToken || (() => {});
    this.onStreamComplete = options.onStreamComplete || (() => {});
    this.onVoiceInputResult = options.onVoiceInputResult || (() => {});

    this.synth = window.speechSynthesis || null;
    this.availableVoices = [];
    this.selectedVoice = null;
    this.voicePitch = 1.0;
    this.voiceRate = 1.05;
    this.isSpeaking = false;
    this.isVoiceEnabled = CONFIG.ENABLE_VOICE_AUTO_SPEAK !== false;
    this.currentStreamingInterval = null;

    // Chat History for LLM context
    this.chatHistory = [];

    // Hardware MediaRecorder Audio State (One-Shot Trigger)
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.recordingTimeout = null;
    this.audioStream = null;
    this.audioContext = null;
    this.analyser = null;
    this.animFrameId = null;

    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;

    const populateVoices = () => {
      this.availableVoices = this.synth.getVoices();
      if (!this.availableVoices.length) return;

      // Prioritize modern natural neural voices
      const naturalKeywords = [
        "Natural", "Neural", "Jenny", "Aria", "Guy", "Google UK English Female",
        "Google US English", "Samantha", "Ava", "Victoria", "Oliver", "George", "Emma"
      ];
      
      let bestVoice = null;
      for (const kw of naturalKeywords) {
        bestVoice = this.availableVoices.find(v => v.name.includes(kw) && v.lang.startsWith("en"));
        if (bestVoice) break;
      }

      if (!bestVoice) {
        bestVoice = this.availableVoices.find(v => (v.lang === "en-US" || v.lang === "en-GB") && !v.name.includes("David"))
          || this.availableVoices.find(v => v.lang.startsWith("en"))
          || this.availableVoices[0];
      }

      // Check user saved preference
      const savedVoiceName = localStorage.getItem("SYNCHRO_SELECTED_VOICE");
      if (savedVoiceName) {
        const found = this.availableVoices.find(v => v.name === savedVoiceName);
        if (found) bestVoice = found;
      }

      this.selectedVoice = bestVoice;
      window.dispatchEvent(new CustomEvent("synchro:voicesLoaded", { detail: this.availableVoices }));
    };

    populateVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = populateVoices;
    }
  }

  setVoiceByName(voiceName) {
    const found = this.availableVoices.find(v => v.name === voiceName);
    if (found) {
      this.selectedVoice = found;
      localStorage.setItem("SYNCHRO_SELECTED_VOICE", voiceName);
      return true;
    }
    return false;
  }

  setVoiceRate(rate) {
    this.voiceRate = Math.max(0.5, Math.min(2.0, parseFloat(rate) || 1.0));
    localStorage.setItem("SYNCHRO_VOICE_RATE", this.voiceRate);
  }

  setVoicePitch(pitch) {
    this.voicePitch = Math.max(0.5, Math.min(2.0, parseFloat(pitch) || 1.0));
    localStorage.setItem("SYNCHRO_VOICE_PITCH", this.voicePitch);
  }

  /**
   * Toggle Voice Listening (Triggered ONLY when user presses 'V' or clicks Mic)
   */
  async toggleVoiceListening() {
    if (this.isRecording) {
      this.stopRecordingNow();
      return false;
    }

    this.stopSpeech();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.showChatNotice("⚠️ Microphone is not supported on this device/browser.");
      return false;
    }

    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      this.mediaRecorder = mimeType ? new MediaRecorder(this.audioStream, { mimeType }) : new MediaRecorder(this.audioStream);

      const inputEl = document.getElementById("ai-text-input");
      if (inputEl) inputEl.placeholder = "🎙️ Listening... Speak now (Auto-stops on silence)";

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        this.cleanupAudioStream();
        this.isRecording = false;
        this.onSpeakingStateChange({ listening: false });

        if (this.audioChunks.length === 0) {
          if (inputEl) inputEl.placeholder = "Ask SYNCHRO-AI anything...";
          return;
        }

        const audioBlob = new Blob(this.audioChunks, { type: mimeType || "audio/webm" });
        if (inputEl) inputEl.placeholder = "⚡ Transcribing with Groq Whisper...";

        try {
          const transcribedText = await groqEngine.transcribeAudio(audioBlob);
          if (transcribedText && transcribedText.trim() && transcribedText.length > 1) {
            if (inputEl) {
              inputEl.value = transcribedText;
              inputEl.placeholder = "Ask SYNCHRO-AI anything...";
            }
            if (this.onVoiceInputResult) {
              this.onVoiceInputResult(transcribedText);
            }
          } else {
            if (inputEl) inputEl.placeholder = "Ask SYNCHRO-AI anything...";
          }
        } catch (err) {
          console.warn("Whisper transcription error:", err);
          if (inputEl) inputEl.placeholder = "Ask SYNCHRO-AI anything...";
        }
      };

      // Voice Activity Detection to auto-stop recording after user finishes speaking
      this.setupVAD(this.audioStream);

      this.mediaRecorder.start(250);
      this.isRecording = true;
      soundEngine.playAIBleep();
      this.onSpeakingStateChange({ listening: true, speaking: false });

      // Max safety timeout for single question (20 seconds)
      clearTimeout(this.recordingTimeout);
      this.recordingTimeout = setTimeout(() => {
        if (this.isRecording) {
          this.stopRecordingNow();
        }
      }, 20000);

      return true;
    } catch (permErr) {
      console.warn("Microphone access error:", permErr);
      this.isRecording = false;
      this.onSpeakingStateChange({ listening: false });
      this.showChatNotice("🔒 Microphone access was blocked. Please click the Lock icon in your browser address bar to Allow Microphone access.");
      return false;
    }
  }

  setupVAD(stream) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let speechDetected = false;
      let lastSpeechTimestamp = Date.now();
      const SILENCE_THRESHOLD_MS = 1500; // Exact 1.5 seconds of silence required
      const SPEECH_VOLUME_THRESHOLD = 16; // Noise floor threshold

      const checkAudioLevel = () => {
        if (!this.isRecording) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // If user is actively speaking (volume above threshold)
        if (average > SPEECH_VOLUME_THRESHOLD) {
          speechDetected = true;
          lastSpeechTimestamp = Date.now();
        } else if (speechDetected) {
          const silenceDuration = Date.now() - lastSpeechTimestamp;
          // Stop ONLY after 1.5 full seconds of uninterrupted silence
          if (silenceDuration >= SILENCE_THRESHOLD_MS) {
            this.stopRecordingNow();
            return;
          }
        }

        this.animFrameId = requestAnimationFrame(checkAudioLevel);
      };

      this.animFrameId = requestAnimationFrame(checkAudioLevel);
    } catch (e) {
      console.warn("VAD init notice:", e);
    }
  }

  stopRecordingNow() {
    clearTimeout(this.recordingTimeout);
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }
    this.isRecording = false;
  }

  cleanupAudioStream() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }

  stopContinuousConversation() {
    this.stopRecordingNow();
    this.cleanupAudioStream();
    this.stopSpeech();
    this.onSpeakingStateChange({ listening: false, speaking: false });
  }

  showChatNotice(message) {
    const messagesScroll = document.getElementById("ai-messages-scroll");
    if (!messagesScroll) return;
    const msgDiv = document.createElement("div");
    msgDiv.className = "ai-msg assistant";
    msgDiv.innerHTML = `
      <div class="msg-avatar"><i class="fa-solid fa-microphone-lines"></i></div>
      <div class="msg-bubble" style="border-color: #00D2FF; background: rgba(0, 210, 255, 0.12);">
        <p>${message}</p>
      </div>
    `;
    messagesScroll.appendChild(msgDiv);
    messagesScroll.scrollTop = messagesScroll.scrollHeight;
  }

  toggleVoiceNarration() {
    this.isVoiceEnabled = !this.isVoiceEnabled;
    if (!this.isVoiceEnabled) {
      this.stopSpeech();
    }
    return this.isVoiceEnabled;
  }

  /**
   * Speak full text aloud in smooth natural voice.
   * Stops when finished — does NOT restart listening on its own!
   */
  speak(text) {
    if (!this.synth || !this.isVoiceEnabled) return;
    this.stopSpeech();
    const currentSessionId = ++this.speechSessionId;

    // Clean text of markdown, bullet symbols, asterisks, URLs for natural human speech
    const cleanText = text
      .replace(/\*\*|__|\*|_/g, "")
      .replace(/#+\s/g, "")
      .replace(/•|\-|\➔|\–|\—/g, ",")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) return;

    // Split text into natural sentence chunks to prevent browser speech synthesis timeouts
    const sentences = cleanText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleanText];
    let currentIndex = 0;

    const speakNextSentence = () => {
      if (currentSessionId !== this.speechSessionId) return; // Discard older speech queue

      if (!this.isVoiceEnabled || currentIndex >= sentences.length) {
        this.isSpeaking = false;
        this.onSpeakingStateChange({ speaking: false });
        return;
      }

      const sentence = sentences[currentIndex].trim();
      if (!sentence) {
        currentIndex++;
        speakNextSentence();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentence);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.rate = this.voiceRate;
      utterance.pitch = this.voicePitch;

      utterance.onstart = () => {
        if (currentSessionId !== this.speechSessionId) {
          this.synth.cancel();
          return;
        }
        this.isSpeaking = true;
        this.onSpeakingStateChange({ speaking: true });
      };

      utterance.onend = () => {
        if (currentSessionId !== this.speechSessionId) return;
        currentIndex++;
        speakNextSentence();
      };

      utterance.onerror = () => {
        if (currentSessionId !== this.speechSessionId) return;
        currentIndex++;
        speakNextSentence();
      };

      this.synth.speak(utterance);
    };

    speakNextSentence();
  }

  stopSpeech() {
    this.speechSessionId = (this.speechSessionId || 0) + 1;
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.onSpeakingStateChange({ speaking: false });
  }

  speakWelcome() {
    this.speak("Welcome to Synchrotech 2026. Department of Computational Studies invites you to Decode the Spectrum. Click any spectral ray or press V to speak with me.");
  }

  speakDomain(domain) {
    const text = `${domain.fullName}. Domain Lead is ${domain.head.name}. ${domain.tagline}.`;
    this.speak(text);
  }

  // Ask LLM (Groq Cloud API with Full Voice Response & Local Fallback)
  async ask(userQuery) {
    this.chatHistory.push({ role: "user", content: userQuery });
    let streamedTokens = "";

    const onToken = (token, fullText) => {
      streamedTokens = fullText;
      this.onStreamToken(fullText);
    };

    const onComplete = (fullResponse) => {
      this.chatHistory.push({ role: "assistant", content: fullResponse });
      this.onStreamComplete(fullResponse);

      // Read complete answer with natural voice
      if (this.isVoiceEnabled) {
        this.speak(fullResponse);
      }
    };

    let groqSuccess = false;
    if (groqEngine.hasApiKey()) {
      try {
        groqSuccess = await groqEngine.streamQuery(
          this.chatHistory.slice(-6),
          onToken,
          onComplete,
          null
        );
      } catch (err) {
        console.warn("Groq streaming exception:", err);
        groqSuccess = false;
      }
    }

    if (!groqSuccess) {
      this.streamLocalFallback(userQuery);
    }
  }

  // Fast offline local response generator
  streamLocalFallback(userQuery) {
    if (this.currentStreamingInterval) {
      clearInterval(this.currentStreamingInterval);
      this.currentStreamingInterval = null;
    }

    const fullResponse = this.generateLocalResponse(userQuery);
    this.chatHistory.push({ role: "assistant", content: fullResponse });

    const words = fullResponse.split(" ");
    let currentText = "";
    let index = 0;

    if (this.isVoiceEnabled) {
      this.speak(fullResponse);
    }

    this.currentStreamingInterval = setInterval(() => {
      if (index < words.length) {
        currentText += (index === 0 ? "" : " ") + words[index];
        this.onStreamToken(currentText);
        index++;
      } else {
        clearInterval(this.currentStreamingInterval);
        this.currentStreamingInterval = null;
        this.onStreamComplete(fullResponse);
      }
    }, 20);
  }

  generateLocalResponse(userQuery) {
    const query = userQuery.toLowerCase().trim();

    if (query.includes("who are you") || query.includes("what is synchro ai") || query.includes("hello") || query.includes("hi") || query.includes("hey")) {
      return `Greetings! I am SYNCHRO-AI, your neural concierge for Synchrotech 2026 at Kristu Jayanti University.\n\nI can answer questions regarding our 8 Domains, 12 Events, the 5-Day Schedule, and coordinators. You can also press Spacebar anytime to reveal the official invitation!`;
    }

    if (query.includes("date") || query.includes("when") || query.includes("timing") || query.includes("schedule")) {
      return `Synchrotech 2026 runs from September 7 to 11, 2026. The formal inauguration is on September 11 at M1 Auditorium. Competitive event rounds take place daily from 4:30 PM to 6:00 PM across campus labs.`;
    }

    if (query.includes("color") || query.includes("spectrum") || query.includes("domain") || query.includes("list domain")) {
      return `The 8 Domains of Synchrotech 2026 are: AI and Machine Learning in Red, Quantum Computing in Orange, Animation and Game Design in Yellow, Cybersecurity in Green, Cloud Computing in Blue, Data Science in Indigo, Blockchain in Violet, and our Flagship Spectrum CEO. Click any spectral ray on screen to explore!`;
    }

    if (query.includes("aiml") || query.includes("ai") || query.includes("machine learning") || query.includes("zero verdict") || query.includes("overdrive") || query.includes("justin")) {
      return `The AI and Machine Learning domain is led by Justin Johnson. It features two flagship competitive events: Zero Verdict, a solo AI detective bid-war challenge, and Overdrive, a duo prompt engineering battle.`;
    }

    if (query.includes("cyber") || query.includes("ctf") || query.includes("threatx") || query.includes("adith")) {
      return `Cybersecurity is led by Adith Joel. It features CTF Capture The Flag hands-on exploitation labs and ThreatX cyber defense court debate.`;
    }

    if (query.includes("cloud") || query.includes("divya") || query.includes("architecture pitch")) {
      return `Cloud Computing is led by Divya Patel. It features Architecture Pitch where students architect cloud solutions, and Cloud Cipher mastery.`;
    }

    if (query.includes("data") || query.includes("subham") || query.includes("dataforge") || query.includes("sql")) {
      return `Data Science is led by Subham Malla. It features DataForge for Power BI dashboard creation and The Query Detective for SQL crime-solving investigations.`;
    }

    if (query.includes("coordinator") || query.includes("dhruv") || query.includes("emy") || query.includes("contact") || query.includes("organizer")) {
      return `The overall student coordinators are Dhruv Soin and Emy Elizabeth Oommen from the Department of Computational Studies at Kristu Jayanti University.`;
    }

    if (query.includes("augustine") || query.includes("principal") || query.includes("patron") || query.includes("delegate") || query.includes("guest")) {
      return `Our honored patron and delegate is Reverend Father Doctor Augustine George CMI, Principal of Kristu Jayanti University.`;
    }

    if (query.includes("invite") || query.includes("invitation") || query.includes("reveal") || query.includes("pass")) {
      return `Press Spacebar on your keyboard or click the Invitation button on the top right to reveal the official royal invitation card.`;
    }

    return `Synchrotech 2026 is the intra-university technical fest of the Department of Computational Studies at Kristu Jayanti University, from September 7 to 11, 2026. Ask me about any domain, events, schedule, or press Spacebar for the invitation!`;
  }
}
