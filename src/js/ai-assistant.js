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
    this.speechRecognition = null;
    this.isSpeechRecognitionActive = false;
    this.isTogglingVoice = false;
    this.initSpeechRecognition();
    this.initVoices();
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.speechRecognition = new SpeechRecognition();
        this.speechRecognition.continuous = false;
        this.speechRecognition.interimResults = true;
        this.speechRecognition.lang = "en-US";

        this.speechRecognition.onstart = () => {
          this.isRecording = true;
          this.isSpeechRecognitionActive = true;
          this.onSpeakingStateChange({ listening: true, speaking: false });
          soundEngine.playAIBleep();
          const inputEl = document.getElementById("ai-text-input");
          if (inputEl) inputEl.placeholder = "🎙️ Listening... Speak now (Press V to stop)";
        };

        this.speechRecognition.onresult = (event) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const inputEl = document.getElementById("ai-text-input");
          if (inputEl) {
            inputEl.value = finalTranscript || interimTranscript;
          }

          if (finalTranscript && finalTranscript.trim()) {
            this.stopRecordingNow();
            if (this.onVoiceInputResult) {
              this.onVoiceInputResult(finalTranscript.trim());
            }
          }
        };

        this.speechRecognition.onerror = (e) => {
          // Ignore harmless no-speech or aborted cancellations
          if (e.error !== "no-speech" && e.error !== "aborted") {
            console.warn("SpeechRecognition error:", e.error);
          }
          this.stopRecordingNow();
        };

        this.speechRecognition.onend = () => {
          this.isRecording = false;
          this.isSpeechRecognitionActive = false;
          this.onSpeakingStateChange({ listening: false });
          const inputEl = document.getElementById("ai-text-input");
          if (inputEl) inputEl.placeholder = "Ask SYNCHRO-AI anything...";
        };
      } catch (err) {
        console.warn("Web SpeechRecognition initialization notice:", err);
      }
    }
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

    if (this.synth) {
      try {
        this.synth.cancel(); // Flush any stale speech synthesis queue
      } catch (e) {}
    }

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
   * Toggle Voice Listening (Listens ONLY on Press V or Click Mic)
   * Uses real-time Native SpeechRecognition first with Groq Whisper as fallback
   */
  async toggleVoiceListening() {
    if (this.isTogglingVoice) return false;
    this.isTogglingVoice = true;

    try {
      if (this.isRecording || this.isSpeechRecognitionActive) {
        this.stopRecordingNow();
        return false;
      }

      this.stopSpeech();

      // 1. Prefer Native Web Speech Recognition for instant zero-lag real-time live typing
      if (this.speechRecognition) {
        try {
          this.speechRecognition.start();
          return true;
        } catch (e) {
          console.warn("Native SpeechRecognition retry:", e);
          try { this.speechRecognition.stop(); } catch (err) {}
          // Fall through to MediaRecorder + Whisper
        }
      }

      // 2. MediaRecorder + Whisper Fallback for browsers without native SpeechRecognition
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }

      this.cleanupAudioStream();
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") 
        ? "audio/webm;codecs=opus" 
        : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      
      this.mediaRecorder = mimeType ? new MediaRecorder(this.audioStream, { mimeType }) : new MediaRecorder(this.audioStream);

      const inputEl = document.getElementById("ai-text-input");
      if (inputEl) inputEl.placeholder = "🎙️ Listening... Speak now (Press V to stop)";

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
        if (audioBlob.size < 2000) {
          if (inputEl) inputEl.placeholder = "Ask SYNCHRO-AI anything...";
          return;
        }

        if (groqEngine.hasApiKey()) {
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
        } else {
          if (inputEl) inputEl.placeholder = "Ask SYNCHRO-AI anything...";
        }
      };

      // Voice Activity Detection to auto-stop recording after user finishes speaking
      this.setupVAD(this.audioStream);

      this.mediaRecorder.start(250);
      this.isRecording = true;
      soundEngine.playAIBleep();
      this.onSpeakingStateChange({ listening: true, speaking: false });

      clearTimeout(this.recordingTimeout);
      this.recordingTimeout = setTimeout(() => {
        if (this.isRecording) {
          this.stopRecordingNow();
        }
      }, 15000);

      return true;
    } catch (err) {
      console.warn("Voice recording error:", err);
      this.isRecording = false;
      this.onSpeakingStateChange({ listening: false });
      return false;
    } finally {
      setTimeout(() => {
        this.isTogglingVoice = false;
      }, 300);
    }
  }

  setupVAD(stream) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let speechDetected = false;
      let lastSpeechTimestamp = Date.now();
      const SILENCE_THRESHOLD_MS = 1500;
      const SPEECH_VOLUME_THRESHOLD = 16;

      const checkAudioLevel = () => {
        if (!this.isRecording) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        if (average > SPEECH_VOLUME_THRESHOLD) {
          speechDetected = true;
          lastSpeechTimestamp = Date.now();
        } else if (speechDetected) {
          const silenceDuration = Date.now() - lastSpeechTimestamp;
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

    if (this.speechRecognition && this.isSpeechRecognitionActive) {
      try {
        this.speechRecognition.stop();
      } catch (e) {}
      this.isSpeechRecognitionActive = false;
    }

    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      try {
        this.mediaRecorder.requestData();
        this.mediaRecorder.stop();
      } catch (e) {}
    }

    this.isRecording = false;
    this.isSpeechRecognitionActive = false;
    this.cleanupAudioStream();
    this.onSpeakingStateChange({ listening: false });
    const inputEl = document.getElementById("ai-text-input");
    if (inputEl) inputEl.placeholder = "Ask SYNCHRO-AI anything...";
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

    // Clean text of markdown, bullet symbols, asterisks, URLs, and raw punctuation for natural human speech
    const cleanText = text
      .replace(/\*\*|__|\*|_/g, "")
      .replace(/#+\s/g, "")
      .replace(/•|\-|\➔|\–|\—|\✦|\|/g, " ")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
      .replace(/\s+,/g, ", ")
      .replace(/,\s*,+/g, ", ")
      .replace(/^[\s,;:.]+/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) return;

    // Split text into natural sentence chunks to prevent browser speech synthesis timeouts
    const sentences = cleanText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleanText];
    let currentIndex = 0;

    const speakNextSentence = () => {
      if (currentSessionId !== this.speechSessionId) return;

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
    this.speak("Welcome to Synchrotech 2026. Department of Computational Studies invites you to Decode the Spectrum. Click any spectral ray or ask me anything.");
  }

  speakDomain(domain) {
    const text = `${domain.fullName}. Domain Lead is ${domain.head.name}. ${domain.tagline}.`;
    this.speak(text);
  }

  // Ask LLM (Groq Cloud API with Full Voice Response & Local Fallback)
  async ask(userQuery) {
    this.chatHistory.push({ role: "user", content: userQuery });
    let streamedTokens = "";

    return new Promise(async (resolve) => {
      const onToken = (token, fullText) => {
        streamedTokens = fullText;
        this.onStreamToken(fullText);
      };

      const onComplete = (fullResponse) => {
        this.chatHistory.push({ role: "assistant", content: fullResponse });
        this.onStreamComplete(fullResponse);

        if (this.isVoiceEnabled) {
          this.speak(fullResponse);
        }
        resolve(fullResponse);
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
        await this.streamLocalFallback(userQuery, onComplete);
      }
    });
  }

  // Fast offline local response generator with animated typing
  streamLocalFallback(userQuery, onCompleteCallback) {
    return new Promise((resolve) => {
      if (this.currentStreamingInterval) {
        clearInterval(this.currentStreamingInterval);
        this.currentStreamingInterval = null;
      }

      const fullResponse = this.generateLocalResponse(userQuery);
      const words = fullResponse.split(" ");
      let currentText = "";
      let index = 0;

      this.currentStreamingInterval = setInterval(() => {
        if (index < words.length) {
          currentText += (index === 0 ? "" : " ") + words[index];
          this.onStreamToken(currentText);
          index++;
        } else {
          clearInterval(this.currentStreamingInterval);
          this.currentStreamingInterval = null;
          if (onCompleteCallback) {
            onCompleteCallback(fullResponse);
          } else {
            this.chatHistory.push({ role: "assistant", content: fullResponse });
            this.onStreamComplete(fullResponse);
            if (this.isVoiceEnabled) {
              this.speak(fullResponse);
            }
          }
          resolve(fullResponse);
        }
      }, 15);
    });
  }

  generateLocalResponse(userQuery) {
    const query = userQuery.toLowerCase().trim();

    // 1. Identity & Greeting
    if (query.includes("who are you") || query.includes("what is synchro ai") || query.includes("hello") || query.includes("hi") || query.includes("hey") || query.includes("what can you do")) {
      return `Greetings! I am **SYNCHRO-AI**, your neural concierge for **Synchrotech 2026** at Kristu Jayanti University. Ask me about any domain, events, coordinators, schedule, or press **Spacebar** for the royal invitation pass!`;
    }

    // 2. Specific Domain Queries
    
    // Cloud Computing
    if (query.includes("cloud") || query.includes("divya") || query.includes("architecture pitch") || query.includes("cloud cipher") || query.includes("aws") || query.includes("vpc")) {
      return `**Divya Patel** is the Domain Lead for **Cloud Computing** (Blue Spectrum). The domain features **Architecture Pitch** and **Cloud Cipher**.`;
    }

    // AI & Machine Learning
    if (query.includes("aiml") || query.includes("ai/ml") || (query.includes("ai") && !query.includes("synchro-ai") && !query.includes("chain")) || query.includes("machine learning") || query.includes("zero verdict") || query.includes("overdrive") || query.includes("justin")) {
      return `**Justin Johnson** leads the **AI and Machine Learning** domain (Red Spectrum), featuring **Zero Verdict** (solo AI auction) and **Overdrive** (duo prompt engineering).`;
    }

    // Quantum Computing
    if (query.includes("quantum") || query.includes("qubit") || query.includes("aadhithya") || query.includes("pair-adox")) {
      return `**Aadhithya Rajesh** leads **Quantum Computing** (Orange Spectrum), featuring the campus-wide **Qubit Quest** logic puzzle hunt. No prior physics is required!`;
    }

    // Animation & Game Design
    if (query.includes("animation") || query.includes("game") || query.includes("shravya") || query.includes("scratch") || query.includes("character jam") || query.includes("sketch")) {
      return `**Shravya Hegde** leads **Animation and Game Design** (Yellow Spectrum), featuring the **Character Jam** sketch and Scratch prototyping challenge.`;
    }

    // Cybersecurity
    if (query.includes("cyber") || query.includes("security") || query.includes("ctf") || query.includes("threatx") || query.includes("adith") || query.includes("hack") || query.includes("court")) {
      return `**Adith Joel** leads **Cybersecurity** (Green Spectrum), featuring hands-on **Capture The Flag (CTF)** and the **ThreatX** cyber court trial.`;
    }

    // Data Science
    if (query.includes("data") || query.includes("subham") || query.includes("dataforge") || query.includes("query detective") || query.includes("sql") || query.includes("power bi") || query.includes("tableau")) {
      return `**Subham Malla** leads **Data Science** (Indigo Spectrum), featuring **DataForge** Power BI dashboards and **The Query Detective** SQL mystery challenge.`;
    }

    // Blockchain
    if (query.includes("blockchain") || query.includes("crypto") || query.includes("tanya") || query.includes("blocktrack") || query.includes("smart contract") || query.includes("web3")) {
      return `**Tanya Nair** leads **Blockchain** (Violet Spectrum), featuring the **BlockTrack** smart contract security and dApp pitch.`;
    }

    // Spectrum CEO Flagship
    if (query.includes("ceo") || query.includes("spectrum ceo") || query.includes("flagship") || query.includes("manager") || query.includes("crisis") || query.includes("boardroom") || query.includes("stress interview")) {
      return `**Spectrum CEO** is the premier 5-day solo leadership event testing crisis triage, boardroom pitch, and jury stress interviews.`;
    }

    // 3. Faculty & Department Leadership
    if (query.includes("faculty") || query.includes("shiva") || query.includes("shiva prasad") || query.includes("ritika") || query.includes("shrimali") || query.includes("staff")) {
      return `The Faculty Coordinators are **Dr. Shiva Prasad** and **Prof. Ritika Shrimali**. You can meet them at the Department of Computational Studies faculty cabins, or contact student coordinators Dhruv Soin (9560855503) and Emy Elizabeth Oommen (9497052528).`;
    }

    if (query.includes("hod") || query.includes("head of department") || query.includes("head of the department") || query.includes("kalaiselvi") || query.includes("dr kalaiselvi")) {
      return `**Dr. K. Kalaiselvi** is the Head of the Department of Computational Studies at Kristu Jayanti (Deemed to be University).`;
    }

    if (query.includes("program coordinator") || query.includes("stephen") || query.includes("dr stephen")) {
      return `**Dr. Stephen A** is the Program Coordinator for the Department of Computational Studies at Kristu Jayanti University.`;
    }

    // 4. University Leadership (Chancellor, VC, Pro VC, Registrar)
    if (query.includes("chancellor") && !query.includes("vice") && !query.includes("pro") || query.includes("santhosh") || query.includes("mathenkunnel")) {
      return `**Rev. Fr. Santhosh Mathenkunnel, CMI** is the Chancellor of Kristu Jayanti (Deemed to be University).`;
    }

    if (query.includes("pro vice chancellor") || query.includes("pro vc") || query.includes("lijo") || query.includes("thomas")) {
      return `**Rev. Fr. Dr. Lijo P. Thomas, CMI** is the Pro Vice Chancellor of Kristu Jayanti (Deemed to be University).`;
    }

    if (query.includes("registrar") || query.includes("aloysius") || query.includes("edward")) {
      return `**Dr. Aloysius Edward J.** is the Registrar of Kristu Jayanti (Deemed to be University).`;
    }

    if (query.includes("dean") || query.includes("sevuga") || query.includes("pandian")) {
      return `**Dr. Sevuga Pandian A** is the Dean of the School of Computational and Physical Sciences at Kristu Jayanti (Deemed to be University).`;
    }

    if (query.includes("augustine") || query.includes("vice chancellor") || query.includes("vc") || query.includes("principal") || query.includes("patron") || query.includes("kristu jayanti") || query.includes("father") || query.includes("cmi")) {
      return `Our honored patron is **Rev. Fr. Dr. Augustine George, CMI**, Vice Chancellor of Kristu Jayanti (Deemed to be University), presiding over the Formal Inauguration on September 11, 2026 at M1 Auditorium.`;
    }

    // 5. Student Coordinators & General Contact
    if (query.includes("coordinator") || query.includes("dhruv") || query.includes("emy") || query.includes("organizer") || query.includes("student lead") || query.includes("contact") || query.includes("phone") || query.includes("number") || query.includes("leads")) {
      return `The Student Coordinators are **Dhruv Soin** (📞 9560855503) and **Emy Elizabeth Oommen** (📞 9497052528) from the Department of Computational Studies.`;
    }

    // 6. Dates & Schedule
    if (query.includes("date") || query.includes("when") || query.includes("timing") || query.includes("schedule") || query.includes("days") || query.includes("inauguration") || query.includes("venue") || query.includes("m1")) {
      return `Synchrotech 2026 runs from **September 7 to 11, 2026**. Daily event rounds take place from 4:30 PM to 6:00 PM in campus labs, with the grand Inauguration on September 11 at 9:30 AM in M1 Auditorium.`;
    }

    // 7. Awards & Scoring
    if (query.includes("award") || query.includes("stars") || query.includes("winner") || query.includes("champion") || query.includes("point") || query.includes("prize") || query.includes("trophy")) {
      return `Synchrotech awards the **7 Stars of Synchrotech** to the top individual in each domain, and the **Overall Champions Trophy** to the domain with highest cumulative points.`;
    }

    // 8. Generic Domains Overview
    if (query.includes("color") || query.includes("spectrum") || query.includes("all domain") || query.includes("list domain") || query.includes("what are the domain") || query.includes("domain") || query.includes("themes")) {
      return `Synchrotech 2026 features 8 Domains: **AI/ML (Red), Quantum (Orange), Animation (Yellow), Cybersecurity (Green), Cloud (Blue), Data Science (Indigo), Blockchain (Violet), and Spectrum CEO**. Click any ray on screen to explore!`;
    }

    // 9. Invitation & Pass
    if (query.includes("invite") || query.includes("invitation") || query.includes("reveal") || query.includes("pass") || query.includes("download") || query.includes("space") || query.includes("export")) {
      return `Press **Spacebar** or click **Invitation** in the top bar to reveal your royal VIP pass, customize your name, and export a high-res PNG!`;
    }

    // Default Fallback
    return `Welcome to **Synchrotech 2026** at Kristu Jayanti University! Ask me about any domain, events, coordinators, or press **Spacebar** for the official royal invitation.`;
  }
}
