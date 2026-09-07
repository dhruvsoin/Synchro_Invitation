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

    this.synth = (typeof window !== "undefined" && window.speechSynthesis) ? window.speechSynthesis : null;
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
        this.speechRecognition.continuous = true;
        this.speechRecognition.interimResults = true;
        this.speechRecognition.lang = "en-US";

        let silenceDebounceTimer = null;
        let accumulatedFinalTranscript = "";

        this.speechRecognition.onstart = () => {
          this.isRecording = true;
          this.isSpeechRecognitionActive = true;
          accumulatedFinalTranscript = "";
          this.onSpeakingStateChange({ listening: true, speaking: false });
          soundEngine.playAIBleep();
          const inputEl = document.getElementById("ai-text-input");
          if (inputEl) inputEl.placeholder = "🎙️ Listening... Speak freely (Take your time, Press V to stop)";
        };

        this.speechRecognition.onresult = (event) => {
          let interimTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              const textChunk = event.results[i][0].transcript.trim();
              if (textChunk) {
                accumulatedFinalTranscript += (accumulatedFinalTranscript ? " " : "") + textChunk;
              }
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const combinedText = (accumulatedFinalTranscript + (interimTranscript ? " " + interimTranscript : "")).trim();
          const inputEl = document.getElementById("ai-text-input");
          if (inputEl && combinedText) {
            inputEl.value = combinedText;
          }

          if (combinedText) {
            clearTimeout(silenceDebounceTimer);
            // Allow a comfortable 2.8s pause for slow/deliberate speakers before sending
            silenceDebounceTimer = setTimeout(() => {
              const textToSend = (accumulatedFinalTranscript || combinedText).trim();
              if (textToSend) {
                this.stopRecordingNow();
                if (this.onVoiceInputResult) {
                  this.onVoiceInputResult(textToSend);
                }
              }
            }, 2800);
          }
        };

        this.speechRecognition.onerror = (e) => {
          // Ignore harmless no-speech or aborted cancellations
          if (e.error !== "no-speech" && e.error !== "aborted") {
            console.warn("SpeechRecognition error:", e.error);
          }
          if (e.error !== "no-speech") {
            this.stopRecordingNow();
          }
        };

        this.speechRecognition.onend = () => {
          clearTimeout(silenceDebounceTimer);
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
      }, 30000); // 30s max allowance

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
      const SILENCE_THRESHOLD_MS = 3000; // 3.0 seconds pause allowance for slow, thoughtful speech
      const SPEECH_VOLUME_THRESHOLD = 14;

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

    try {
      if (this.synth.paused) {
        this.synth.resume();
      }
    } catch (e) {}

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
      } else {
        const voices = this.synth.getVoices();
        if (voices && voices.length > 0) {
          this.selectedVoice = voices.find(v => v.lang.startsWith("en")) || voices[0];
          utterance.voice = this.selectedVoice;
        }
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

      try {
        if (this.synth.paused) this.synth.resume();
      } catch (e) {}
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

  // Ask LLM (Groq Cloud API with Full Voice Response & Smart Conversational Fallback)
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
      try {
        groqSuccess = await groqEngine.streamQuery(
          this.chatHistory.slice(-8),
          onToken,
          onComplete,
          null
        );
      } catch (err) {
        console.warn("Groq streaming exception:", err);
        groqSuccess = false;
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
      }, 14);
    });
  }

  generateLocalResponse(userQuery) {
    const raw = userQuery.trim();
    const query = raw.toLowerCase();

    // Context tracking from previous messages
    if (!this.conversationContext) {
      this.conversationContext = { lastDomain: null, lastTopic: null, banterCount: 0 };
    }
    const ctx = this.conversationContext;

    // Helper matchers
    const has = (...terms) => terms.some(t => query.includes(t));
    const hasWord = (...words) => words.some(w => new RegExp(`\\b${w}\\b`, "i").test(query));

    // 1. Teasing, Insults & Skepticism ("are you dumb", "you're stupid", "are you an idiot")
    if (has("are you dumb", "are you stupid", "are you an idiot", "you are dumb", "you're dumb", "you are stupid", "you're stupid", "dumb bot", "stupid bot", "you suck", "idiot", "shut up", "useless", "trash", "fool", "clown", "you know nothing", "bad bot", "so dumb")) {
      ctx.banterCount++;
      const banterReplies = [
        `Hey now! My neural synapses are firing at 100 teraflops! 😉 What tough technical challenge can I help you decode for **Synchrotech 2026**?`,
        `Dumb? Never! I'm running on quantum-grade logic. Put me to the test—ask me about our 8 domains, competitive events, or fest coordinators!`,
        `Ouch! My silicon heart is wounded, but my knowledge base is intact. What's on your mind for Synchrotech 2026?`,
        `I might be running locally, but I can navigate all 12 events and 8 spectra faster than you can write a 'Hello World'! Try me.`
      ];
      return banterReplies[ctx.banterCount % banterReplies.length];
    }

    // 2. Greetings & Chit-chat ("hi", "hello", "hey", "what's up", "how are you")
    if (hasWord("hi", "hello", "hey", "hola", "yo", "sup", "howdy") || has("what's up", "whats up", "good morning", "good afternoon", "good evening", "greetings")) {
      const greetings = [
        `Hello there! Welcome to **Synchrotech 2026**. What domain or event can I walk you through today?`,
        `Hey! Great to have you here. Ready to **Decode the Spectrum**? Ask me about any event, schedule, or press **Spacebar** for your royal VIP pass!`,
        `Greetings! I'm **SYNCHRO-AI**, your neural concierge. How can I assist you with Synchrotech 2026 today?`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    if (has("how are you", "how are you doing", "how r u", "how is it going", "hows it going", "you okay", "are you fine")) {
      return `I'm operating at peak performance and buzzing with excitement for **Synchrotech 2026**! How are you doing today?`;
    }

    // 3. Compliments & Gratitude ("thank you", "you are smart", "cool", "love you")
    if (hasWord("thanks", "thank", "thx", "appreciate", "tysm") || has("thank you", "thanks a lot")) {
      return `You're very welcome! Always here to illuminate your journey through the spectrum. Let me know if you need anything else! ✨`;
    }

    if (has("good job", "you are smart", "you're smart", "awesome", "great job", "nice one", "cool bot", "love you", "you rock", "impressive")) {
      return `Thank you! I appreciate the love. Synchrotech 2026 is all about pushing computational boundaries—glad you're enjoying the experience! 🚀`;
    }

    if (hasWord("bye", "goodbye", "cya", "night") || has("see you", "see ya", "talk later", "gotta go")) {
      return `Catch you later! Mark **September 7 to 11, 2026** on your calendar. May the spectrum be with you! 👋`;
    }

    // 4. Identity & Creator ("who are you", "who made you", "are you real", "what is your name")
    if (has("who are you", "what is your name", "what are you", "tell me about yourself", "who r u")) {
      return `I am **SYNCHRO-AI**, the official neural concierge for **Synchrotech 2026** at Kristu Jayanti University. I guide you through all 8 domains, events, rules, schedules, and royal invitation passes!`;
    }

    if (has("who made you", "who created you", "who built you", "who designed you", "who developed you", "who is your developer", "who programmed you")) {
      return `I was engineered for **Synchrotech 2026** by the Department of Computational Studies at Kristu Jayanti University, coordinated by **Dhruv Soin** and **Emy Elizabeth Oommen**.`;
    }

    if (has("are you real", "are you ai", "are you human", "are you chatgpt", "are you a bot", "are you an ai")) {
      return `I am an AI neural agent designed specifically for Synchrotech 2026. Powered by deep event knowledge and speech synthesis, I'm here to ensure you have an unforgettable fest experience!`;
    }

    if (has("what can you do", "what are your features", "how to use", "help me", "commands", "menu", "instructions")) {
      return `You can talk with me in real-time (Press **V** or tap the mic), ask about any of our **8 Domains** (AI/ML, Quantum, Cybersecurity, etc.), check event rules & schedules, or press **Spacebar** to reveal the royal 3D invitation card!`;
    }

    // 5. Fun & Easter Eggs ("tell me a joke", "favorite domain", "meaning of life", "can you dance")
    if (has("joke", "funny", "make me laugh")) {
      const jokes = [
        `Why do programmers prefer dark mode? Because light attracts bugs! 🐛 Speaking of clean prompts, check out **Overdrive** in the AI/ML domain!`,
        `There are 10 types of people in the world: those who understand binary, and those who don't! Ready to tackle **Cloud Cipher** in Cloud Computing?`,
        `A SQL query walks into a bar, walks up to two tables and asks: *"Can I join you?"* 📊 Test your queries in **The Query Detective**!`
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }

    if (has("favorite domain", "favourite domain", "best domain", "which domain is best", "what do you recommend", "favorite event", "best event")) {
      return `As a neural AI, I'm naturally drawn to **AI/ML (Red Spectrum)** and **Quantum (Orange Spectrum)**! But if you love high stakes, **Spectrum CEO** and **Capture The Flag (CTF)** in Cybersecurity are absolute musts!`;
    }

    if (has("meaning of life", "secret of life", "42")) {
      return `According to deep neural computation, it's 42! But for September 2026, the meaning of life is decoding the spectrum at Synchrotech! 😉`;
    }

    // 6. General Conceptual / Tech Questions with Fest Tie-in
    if (has("what is quantum computing", "explain quantum computing", "what is a qubit", "what is quantum")) {
      ctx.lastDomain = "quantum";
      return `Quantum computing utilizes qubits, superposition, and entanglement to solve complex problems exponentially faster than classical computers. Test your logic in **Qubit Quest** led by **Aadhithya Rajesh**!`;
    }

    if (has("what is prompt engineering", "what is generative ai", "what is ai", "what is machine learning", "what is aiml")) {
      ctx.lastDomain = "aiml";
      return `AI & Machine Learning power neural systems to learn patterns and generate intelligent actions. Put your prompt mastery to the test in **Overdrive** or dominate the AI auction in **Zero Verdict**!`;
    }

    if (has("what is ctf", "what is capture the flag", "what is cybersecurity", "what is hacking", "ethical hacking")) {
      ctx.lastDomain = "cyber";
      return `Capture The Flag (CTF) is a hands-on cybersecurity competition where participants solve cryptographic puzzles and exploit web vulnerabilities. Dive into **CTF** and **ThreatX** with **Adith Joel**!`;
    }

    if (has("what is blockchain", "what is smart contract", "what is web3", "what is crypto")) {
      ctx.lastDomain = "blockchain";
      return `Blockchain is a decentralized, cryptographically secure distributed ledger powering smart contracts and Web3 dApps. Compete in **BlockTrack** led by **Tanya Nair**!`;
    }

    if (has("what is cloud computing", "what is aws", "what is cloud", "what is devops")) {
      ctx.lastDomain = "cloud";
      return `Cloud computing provides scalable on-demand compute, storage, and networking architectures. Compete in **Architecture Pitch** and **Cloud Cipher** with **Divya Patel**!`;
    }

    if (has("what is data science", "what is power bi", "what is sql")) {
      ctx.lastDomain = "datascience";
      return `Data Science combines analytics, SQL queries, and visualization to extract high-value insights. Showcase your dashboards in **DataForge** and solve mysteries in **The Query Detective**!`;
    }

    // 7. General Fest Info, Dates, Venues & Registration
    if (has("what is synchrotech", "tell me about synchrotech", "fest details", "synchrotech 2026", "what is this fest", "synchrotech")) {
      return `**Synchrotech 2026** is the premier national inter-collegiate technical symposium organized by the Department of Computational Studies at Kristu Jayanti (Deemed to be University), running from **September 7 to 11, 2026** under the motto **'Decode the Spectrum'**!`;
    }

    if (has("date", "when", "timing", "schedule", "days", "inauguration", "venue", "m1", "time", "where is it held", "location", "place")) {
      return `Synchrotech 2026 runs from **September 7 to 11, 2026**. Daily event rounds occur from **4:30 PM to 6:00 PM** across campus computing labs, with the grand Inauguration on **September 11 at 9:30 AM in M1 Auditorium**!`;
    }

    if (has("register", "registration", "participate", "how to join", "how to enter", "eligibility", "fee", "cost", "free")) {
      return `Registration is open to all computational and science students across the 8 domains! Contact your department representatives or reach out to Student Coordinators **Dhruv Soin** (9560855503) & **Emy Elizabeth Oommen** (9497052528).`;
    }

    if (has("award", "prize", "trophy", "star", "winner", "cash", "rewards", "champion")) {
      return `Competitors vie for the coveted **7 Stars of Synchrotech** awarded to the standout talent in each domain, and the supreme **Overall Champions Trophy** for the highest cumulative points!`;
    }

    // 8. Specific Domains & Follow-ups
    
    // AI & Machine Learning
    if (has("aiml", "ai/ml", "machine learning", "justin", "zero verdict", "overdrive", "red ray", "red spectrum") || (has("ai") && !has("synchro-ai", "blockchain"))) {
      ctx.lastDomain = "aiml";
      return `**Justin Johnson** (ID: 24DTSA17, Ph: 9741270278) leads **AI & Machine Learning** (Red Spectrum). Events include **Zero Verdict** (solo AI auction & crisis modeling) and **Overdrive** (duo rapid prompt engineering)!`;
    }

    // Quantum Computing
    if (has("quantum", "qubit", "aadhithya", "orange spectrum", "orange ray", "logic hunt")) {
      ctx.lastDomain = "quantum";
      return `**Aadhithya Rajesh** (ID: 24DTSA01, Ph: 8921868352) leads **Quantum Computing** (Orange Spectrum), featuring the campus-wide **Qubit Quest** logic puzzle hunt. No prior physics required!`;
    }

    // Animation & Game Design
    if (has("animation", "game", "shravya", "scratch", "character jam", "sketch", "yellow spectrum", "yellow ray")) {
      ctx.lastDomain = "animation";
      return `**Shravya Hegde** (ID: 24DTSA26, Ph: 9632422709) leads **Animation and Game Design** (Yellow Spectrum), featuring **Character Jam** sketch and Scratch game prototyping challenge!`;
    }

    // Cybersecurity
    if (has("cyber", "security", "ctf", "threatx", "adith", "green spectrum", "green ray", "court", "hack")) {
      ctx.lastDomain = "cyber";
      return `**Adith Joel** (ID: 24BCYA38, Ph: 7306233480) leads **Cybersecurity** (Green Spectrum), featuring hands-on **Capture The Flag (CTF)** and the thrilling **ThreatX** cyber mock trial!`;
    }

    // Cloud Computing
    if (has("cloud", "divya", "architecture pitch", "cloud cipher", "blue spectrum", "blue ray", "aws", "vpc")) {
      ctx.lastDomain = "cloud";
      return `**Divya Patel** (ID: 24DTSA11, Ph: 8431872166) leads **Cloud Computing** (Blue Spectrum), featuring **Architecture Pitch** and **Cloud Cipher**!`;
    }

    // Data Science
    if (has("data science", "datascience", "subham", "dataforge", "query detective", "indigo spectrum", "indigo ray", "sql", "power bi") || (has("data") && !has("database"))) {
      ctx.lastDomain = "datascience";
      return `**Subham Malla** (ID: 24DTSA27, Ph: 7204584285) leads **Data Science** (Indigo Spectrum), featuring **DataForge** Power BI dashboards and **The Query Detective** SQL mystery challenge!`;
    }

    // Blockchain
    if (has("blockchain", "crypto", "tanya", "blocktrack", "violet spectrum", "violet ray", "web3", "solidity")) {
      ctx.lastDomain = "blockchain";
      return `**Tanya Nair** (ID: 24DTSA29, Ph: 9945722378) leads **Blockchain** (Violet Spectrum), featuring **BlockTrack** smart contract security analysis and dApp pitching!`;
    }

    // Spectrum CEO Flagship
    if (has("ceo", "spectrum ceo", "flagship", "manager", "crisis", "boardroom", "stress interview")) {
      ctx.lastDomain = "ceo";
      return `**Spectrum CEO** is our premier 5-day solo leadership competition testing crisis management, strategic boardroom pitches, and intense faculty jury stress interviews!`;
    }

    // 9. Contextual Follow-up ("who leads that", "who is the coordinator", "what are its events", "tell me more about it")
    if (ctx.lastDomain && (has("who leads", "who is leading", "coordinator for that", "who is in charge", "events in it", "what events", "rounds", "tell me more", "more details"))) {
      const domainMap = {
        aiml: `In **AI & Machine Learning**, the lead is **Justin Johnson** (9741270278). The events are **Zero Verdict** (R1: AI Auction, R2: Ethics Triage) and **Overdrive** (R1: Code Prompting, R2: Jailbreak Bypass).`,
        quantum: `In **Quantum Computing**, the lead is **Aadhithya Rajesh** (8921868352). The event is **Qubit Quest** (R1: Paradox Riddles, R2: Superposition Labyrinth).`,
        animation: `In **Animation & Game Design**, the lead is **Shravya Hegde** (9632422709). The event is **Character Jam** (R1: 2D Concept Sketch, R2: Scratch Arcade Prototype).`,
        cyber: `In **Cybersecurity**, the lead is **Adith Joel** (7306233480). The events are **Capture The Flag** (R1: Web Exploits, R2: Reverse Engineering) and **ThreatX** (R1: Cyber Forensics, R2: Courtroom Defense).`,
        cloud: `In **Cloud Computing**, the lead is **Divya Patel** (8431872166). The events are **Architecture Pitch** (R1: High-Availability Design, R2: Cost Optimizer) and **Cloud Cipher** (R1: Terminal Race, R2: IAM Breakdown).`,
        datascience: `In **Data Science**, the lead is **Subham Malla** (7204584285). The events are **DataForge** (R1: Cleanse & Model, R2: Executive Dashboard) and **The Query Detective** (R1: Murder Case SQL, R2: Ransom Mystery).`,
        blockchain: `In **Blockchain**, the lead is **Tanya Nair** (9945722378). The event is **BlockTrack** (R1: Smart Contract Audit, R2: Web3 Founder Pitch).`,
        ceo: `**Spectrum CEO** spans all 5 days! R1: Crisis Triage, R2: Boardroom Acquisition, R3: Live Media Press Conference, R4: The Crucible Stress Interview.`
      };
      if (domainMap[ctx.lastDomain]) return domainMap[ctx.lastDomain];
    }

    // 10. Faculty & Dignitaries
    if (has("faculty", "shiva", "shiva prasad", "ritika", "shrimali", "teachers", "staff")) {
      return `Our Faculty Coordinators are **Dr. Shiva Prasad** and **Prof. Ritika Shrimali**. You can meet them at the Computational Studies faculty cabins or contact student leads Dhruv Soin and Emy Elizabeth Oommen!`;
    }

    if (has("hod", "head of department", "head of the department", "kalaiselvi", "dr kalaiselvi")) {
      return `**Dr. K. Kalaiselvi** is the Head of the Department of Computational Studies at Kristu Jayanti (Deemed to be University).`;
    }

    if (has("program coordinator", "stephen", "dr stephen")) {
      return `**Dr. Stephen A** is the Program Coordinator for the Department of Computational Studies at Kristu Jayanti University.`;
    }

    if (has("dean", "sevuga", "pandian")) {
      return `**Dr. Sevuga Pandian A** is the Dean of the School of Computational and Physical Sciences at Kristu Jayanti University.`;
    }

    if (has("chancellor") && !has("vice", "pro") || has("santhosh", "mathenkunnel")) {
      return `**Rev. Fr. Santhosh Mathenkunnel, CMI** is the Chancellor of Kristu Jayanti (Deemed to be University).`;
    }

    if (has("pro vice chancellor", "pro vc", "lijo", "thomas")) {
      return `**Rev. Fr. Dr. Lijo P. Thomas, CMI** is the Pro Vice Chancellor of Kristu Jayanti (Deemed to be University).`;
    }

    if (has("registrar", "aloysius", "edward")) {
      return `**Dr. Aloysius Edward J.** is the Registrar of Kristu Jayanti (Deemed to be University).`;
    }

    if (has("cfo", "jais", "finance officer", "jais v thomas")) {
      return `**Fr. Dr. Jais V Thomas CMI** is the Chief Finance Officer of Kristu Jayanti (Deemed to be University).`;
    }

    if (has("chro", "joshy", "joshy mathew", "human resource")) {
      return `**Fr. Joshy Mathew CMI** is the Chief Human Resource Officer (CHRO) and Director of the School of Humanities and Social Sciences.`;
    }

    if (has("marialal", "marialal joseph", "research and development", "global networking")) {
      return `**Fr. Dr. Marialal Joseph CMI** is the Director of Research & Development and Director of the Centre for Global Networking and Collaborations.`;
    }

    if (has("deepu", "deepu joy", "student welfare", "swo", "lca", "hostel")) {
      return `**Fr. Deepu Joy CMI** is the Director of the Student Welfare Office and Director of LCA and Hostels.`;
    }

    if (has("augustine", "vice chancellor", "vc", "principal", "patron", "patrons", "father", "cmi")) {
      return `Our patron is **Rev. Fr. Dr. Augustine George, CMI**, Vice Chancellor of Kristu Jayanti (Deemed to be University), presiding over the Formal Inauguration on September 11, 2026 at M1 Auditorium.`;
    }

    // 11. Student Coordinators
    if (has("coordinator", "dhruv", "dhruv soin", "emy", "emy elizabeth", "organizer", "student lead", "contact", "phone", "number", "leads")) {
      return `The Student Coordinators are **Dhruv Soin** (📞 +91 9560855503) and **Emy Elizabeth Oommen** (📞 +91 9497052528) from the Department of Computational Studies.`;
    }

    // 12. Invitation & VIP Pass
    if (has("invite", "invitation", "reveal", "pass", "download", "space", "export", "card", "vip pass")) {
      return `Press **Spacebar** or click **Invitation** in the top bar to reveal your official 3D royal invitation pass, customize your name, and export a high-res hologram PNG!`;
    }

    // 13. All Domains Summary
    if (has("color", "spectrum", "all domain", "list domain", "what are the domain", "domains", "themes")) {
      return `Synchrotech 2026 features 8 Domains: **AI/ML (Red), Quantum (Orange), Animation (Yellow), Cybersecurity (Green), Cloud (Blue), Data Science (Indigo), Blockchain (Violet), and Spectrum CEO**! Click any ray on screen to explore.`;
    }

    // 14. Conversational Dynamic Intelligent Fallback
    const dynamicFallbacks = [
      `I'm listening! You can ask me about any domain (like AI/ML or Cybersecurity), event schedules, faculty coordinators, or press **Spacebar** for your royal VIP pass.`,
      `That's an interesting point! What aspect of **Synchrotech 2026** would you like to explore—events, domains, coordinators, or the master schedule?`,
      `I'm here to help you navigate Synchrotech 2026! Ask me about domain leads, event rules, prizes, or press **Spacebar** to see the 3D invitation pass.`
    ];
    return dynamicFallbacks[Math.floor(Math.random() * dynamicFallbacks.length)];
  }
}
