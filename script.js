/**
 * SYNCHROTECH 2026 — Master Client Controller (Restored Clean Edition)
 */

import { FEST_INFO, DOMAINS } from "./src/js/data.js";
import { soundEngine } from "./src/js/sound-engine.js";
import { MasterCinemaStageEngine } from "./src/js/prism-engine.js";
import { AIAssistant } from "./src/js/ai-assistant.js";
import { InvitationRevealController } from "./src/js/invitation-reveal.js";
import { groqEngine } from "./src/js/groq-engine.js";
import { HologramPassEngine } from "./src/js/3d-card-engine.js";

document.addEventListener("DOMContentLoaded", () => {
  let stageEngine = null;
  let aiAssistant = null;
  let invitationController = null;
  let activeDomain = null;

  // 1. Audio Context Global Unlock
  const unlockAudio = () => {
    soundEngine.ensureContext();
    window.removeEventListener("click", unlockAudio);
    window.removeEventListener("touchstart", unlockAudio);
  };
  window.addEventListener("click", unlockAudio);
  window.addEventListener("touchstart", unlockAudio);

  // 2. Initialize SYNCHRO-AI Concierge
  const orbEl = document.getElementById("ai-floating-orb");
  const orbHoverTag = orbEl?.querySelector(".orb-hover-tag");
  const aiContainer = document.getElementById("synchro-ai-container");
  const messagesScroll = document.getElementById("ai-messages-scroll");

  aiAssistant = new AIAssistant({
    onSpeakingStateChange: ({ speaking, listening }) => {
      if (orbEl) {
        orbEl.classList.toggle("speaking", Boolean(speaking));
        orbEl.classList.toggle("listening", Boolean(listening));
        if (orbHoverTag) {
          if (listening) {
            orbHoverTag.textContent = "🎙️ LISTENING...";
          } else if (speaking) {
            orbHoverTag.textContent = "SYNCHRO-AI SPEAKING...";
          } else {
            orbHoverTag.textContent = "SYNCHRO-AI (Press V)";
          }
        }
      }
      const micBtn = document.getElementById("btn-ai-mic");
      if (micBtn) micBtn.classList.toggle("active", Boolean(listening));
    },
    onStreamToken: (fullText) => {
      updateLastAssistantMessage(fullText);
    },
    onStreamComplete: (fullResponse) => {
      updateLastAssistantMessage(fullResponse);
    },
    onVoiceInputResult: (transcript) => {
      const inputEl = document.getElementById("ai-text-input");
      if (inputEl) inputEl.value = transcript;
      handleSendMessage(transcript);
    }
  });

  // 3. Initialize Master Stage Engine
  const canvasEl = document.getElementById("stage-canvas");
  if (canvasEl) {
    stageEngine = new MasterCinemaStageEngine(
      canvasEl,
      // onIgnitionComplete Callback
      () => {
        document.body.classList.add("stage-ignited");
        setTimeout(() => {
          aiAssistant.speakWelcome();
        }, 400);
      },
      // onSelectDomain Callback
      (domain) => {
        openDomainSidePanel(domain);
      }
    );
  }

  // 4. Initialize Invitation Reveal Controller
  invitationController = new InvitationRevealController(stageEngine, aiAssistant);

  // 5. Setup UI & AI Event Listeners
  setupUIEvents(stageEngine, aiAssistant, invitationController);

  // 6. 3D Pass Engine on Invitation Card
  const invCardEl = document.getElementById("invitation-card");
  if (invCardEl) {
    new HologramPassEngine(invCardEl);
  }

  /* ==========================================================================
     Domain Side Panel Manager
     ========================================================================== */
  function openDomainSidePanel(domain) {
    activeDomain = domain;
    const panel = document.getElementById("domain-side-panel");
    if (!panel) return;

    // Header Color & Tag
    const tagEl = document.getElementById("panel-domain-tag");
    const titleEl = document.getElementById("panel-domain-title");
    const taglineEl = document.getElementById("panel-domain-tagline");
    const loreEl = document.getElementById("panel-domain-lore");
    const leadEl = document.getElementById("panel-lead-name");
    const phoneEl = document.getElementById("panel-lead-phone");
    const callBtn = document.getElementById("panel-btn-call");
    const eventsList = document.getElementById("panel-events-list");

    if (tagEl) {
      tagEl.textContent = domain.colorName + " SPECTRUM";
      tagEl.style.color = domain.color;
      tagEl.style.borderColor = domain.color;
    }
    if (titleEl) {
      titleEl.textContent = domain.fullName;
      titleEl.style.color = "#FFFFFF";
      titleEl.style.textShadow = `0 0 20px ${domain.color}`;
    }
    if (taglineEl) taglineEl.textContent = domain.tagline;
    if (loreEl) loreEl.textContent = domain.lore;

    if (leadEl) leadEl.textContent = `${domain.head.name} (${domain.head.id})`;
    if (phoneEl) phoneEl.textContent = `+91 ${domain.head.phone}`;
    if (callBtn) callBtn.href = `tel:+91${domain.head.phone}`;

    // Render Events & Dynamic Rounds Accordion
    if (eventsList) {
      eventsList.innerHTML = "";
      domain.events.forEach((ev) => {
        const evCard = document.createElement("div");
        evCard.className = "domain-event-card";
        evCard.style.borderLeftColor = domain.color;

        const roundsHtml = ev.rounds.map((r) => `
          <div class="event-round-pill">
            <span class="round-badge">R${r.num}</span>
            <span class="round-name">${escapeHtml(r.name)}</span>
            <span class="round-desc">${escapeHtml(r.desc)}</span>
          </div>
        `).join("");

        evCard.innerHTML = `
          <div class="event-card-head">
            <h4 class="event-name">${escapeHtml(ev.name)}</h4>
            <span class="event-type-badge">${escapeHtml(ev.type)}</span>
          </div>
          <p class="event-tagline">"${escapeHtml(ev.tagline)}"</p>
          <div class="event-rounds-grid">${roundsHtml}</div>
        `;
        eventsList.appendChild(evCard);
      });
    }

    panel.classList.add("open");

    // AI narrates domain intro
    aiAssistant.speakDomain(domain);
  }

  function closeDomainSidePanel() {
    const panel = document.getElementById("domain-side-panel");
    panel?.classList.remove("open");
    activeDomain = null;
    if (stageEngine) stageEngine.setSelectedDomain(null);
  }

  /* ==========================================================================
     AI Chat Message UI
     ========================================================================== */
  function appendUserMessage(text) {
    if (!messagesScroll) return;
    const msgDiv = document.createElement("div");
    msgDiv.className = "ai-msg user";
    msgDiv.innerHTML = `
      <div class="msg-bubble">
        <p>${escapeHtml(text)}</p>
      </div>
    `;
    messagesScroll.appendChild(msgDiv);
    messagesScroll.scrollTop = messagesScroll.scrollHeight;
  }

  function appendAssistantMessagePlaceholder() {
    if (!messagesScroll) return;
    const msgDiv = document.createElement("div");
    msgDiv.className = "ai-msg assistant active-stream";
    msgDiv.innerHTML = `
      <div class="msg-avatar"><i class="fa-solid fa-brain"></i></div>
      <div class="msg-bubble">
        <p class="stream-content">Thinking...</p>
      </div>
    `;
    messagesScroll.appendChild(msgDiv);
    messagesScroll.scrollTop = messagesScroll.scrollHeight;
  }

  function updateLastAssistantMessage(text) {
    if (!messagesScroll) return;
    const activeStream = messagesScroll.querySelector(".ai-msg.assistant.active-stream");
    if (activeStream) {
      const contentEl = activeStream.querySelector(".stream-content");
      if (contentEl) {
        contentEl.innerHTML = formatMarkdown(text);
      }
      messagesScroll.scrollTop = messagesScroll.scrollHeight;
    }
  }

  function finalizeAssistantMessage() {
    if (!messagesScroll) return;
    const activeStream = messagesScroll.querySelector(".ai-msg.assistant.active-stream");
    if (activeStream) {
      activeStream.classList.remove("active-stream");
    }
  }

  function handleSendMessage(query) {
    const text = query.trim();
    if (!text) return;

    soundEngine.playUIClick();
    appendUserMessage(text);
    appendAssistantMessagePlaceholder();

    aiAssistant.ask(text).then(() => {
      finalizeAssistantMessage();
    });

    const input = document.getElementById("ai-text-input");
    if (input) input.value = "";
  }

  /* ==========================================================================
     UI Event Bindings
     ========================================================================== */
  function setupUIEvents(stageEngine, aiAssistant, invitationController) {
    // 1. Audio Dock Toggle
    const btnAudio = document.getElementById("btn-audio-toggle");
    if (btnAudio) {
      btnAudio.addEventListener("click", () => {
        const isMuted = soundEngine.toggleMute();
        btnAudio.classList.toggle("active", !isMuted);
        btnAudio.querySelector("i").className = isMuted ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high";
      });
    }

    // 2. Header Invitation Trigger
    document.getElementById("btn-header-invite")?.addEventListener("click", () => {
      invitationController.toggleReveal();
    });

    // 3. Domain Side Panel Close
    document.getElementById("btn-close-domain-panel")?.addEventListener("click", closeDomainSidePanel);

    // 4. Panel "Ask SYNCHRO-AI" Button
    document.getElementById("btn-ask-ai-domain")?.addEventListener("click", () => {
      if (!activeDomain) return;
      closeDomainSidePanel();
      aiContainer?.classList.add("open");
      handleSendMessage(`Tell me all about ${activeDomain.fullName}, the competitions, and how to win.`);
    });

    // 5. AI Orb Click -> Open Chat Drawer & Start Voice Listening
    orbEl?.addEventListener("click", (e) => {
      e.stopPropagation();
      soundEngine.playUIClick();
      aiContainer?.classList.add("open");
      aiAssistant.toggleVoiceListening();
    });

    // 6. Close / Minimize Chat Drawer
    const closeChatDrawer = (e) => {
      if (e) e.stopPropagation();
      soundEngine.playUIClick();
      if (aiAssistant) {
        aiAssistant.stopRecordingNow();
        aiAssistant.stopSpeech();
      }
      aiContainer?.classList.remove("open");
      document.getElementById("ai-voice-popover")?.classList.remove("open");
      document.getElementById("ai-config-popover")?.classList.remove("open");
    };

    document.getElementById("btn-close-chat")?.addEventListener("click", closeChatDrawer);

    // 7. Voice Toggle in Chat Header
    const voiceToggleBtn = document.getElementById("btn-ai-voice-toggle");
    if (voiceToggleBtn) {
      voiceToggleBtn.addEventListener("click", () => {
        const isEnabled = aiAssistant.toggleVoiceNarration();
        voiceToggleBtn.classList.toggle("active", isEnabled);
        voiceToggleBtn.querySelector("i").className = isEnabled ? "fa-solid fa-volume-high" : "fa-solid fa-volume-xmark";
      });
    }

    // 8. Voice Settings Popover & Voice Selector
    const voiceSelectBtn = document.getElementById("btn-ai-voice-select-toggle");
    const voicePopover = document.getElementById("ai-voice-popover");
    const voiceSelect = document.getElementById("select-ai-voice");
    const rateRange = document.getElementById("range-voice-rate");
    const rateLabel = document.getElementById("label-voice-rate");
    const pitchRange = document.getElementById("range-voice-pitch");
    const pitchLabel = document.getElementById("label-voice-pitch");
    const testVoiceBtn = document.getElementById("btn-test-voice");

    const populateVoiceDropdown = (voices) => {
      if (!voiceSelect || !voices || !voices.length) return;
      voiceSelect.innerHTML = "";
      
      const englishVoices = voices.filter(v => v.lang.startsWith("en"));
      const otherVoices = voices.filter(v => !v.lang.startsWith("en"));

      const addGroup = (groupLabel, voiceList) => {
        if (!voiceList.length) return;
        const optGroup = document.createElement("optgroup");
        optGroup.label = groupLabel;
        voiceList.forEach(v => {
          const opt = document.createElement("option");
          opt.value = v.name;
          opt.textContent = `${v.name} (${v.lang})`;
          if (aiAssistant.selectedVoice && aiAssistant.selectedVoice.name === v.name) {
            opt.selected = true;
          }
          optGroup.appendChild(opt);
        });
        voiceSelect.appendChild(optGroup);
      };

      addGroup("✨ English Voices (Recommended)", englishVoices);
      addGroup("🌐 International Voices", otherVoices);
    };

    window.addEventListener("synchro:voicesLoaded", (e) => {
      populateVoiceDropdown(e.detail);
    });
    if (aiAssistant.availableVoices.length > 0) {
      populateVoiceDropdown(aiAssistant.availableVoices);
    }

    voiceSelectBtn?.addEventListener("click", () => {
      voicePopover?.classList.toggle("open");
      document.getElementById("ai-config-popover")?.classList.remove("open");
    });

    voiceSelect?.addEventListener("change", (e) => {
      aiAssistant.setVoiceByName(e.target.value);
    });

    rateRange?.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      if (rateLabel) rateLabel.textContent = `${val.toFixed(2)}x`;
      aiAssistant.setVoiceRate(val);
    });

    pitchRange?.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      if (pitchLabel) pitchLabel.textContent = `${val.toFixed(2)}x`;
      aiAssistant.setVoicePitch(val);
    });

    testVoiceBtn?.addEventListener("click", () => {
      soundEngine.playAIBleep();
      aiAssistant.speak("Greetings! This is SYNCHRO-AI. Department of Computational Studies welcomes you to Synchrotech 2026.");
    });

    // 9. Groq Config Popover Toggle & Save
    const configBtn = document.getElementById("btn-ai-config-toggle");
    const configPopover = document.getElementById("ai-config-popover");
    const groqKeyInput = document.getElementById("input-groq-key");
    const saveKeyBtn = document.getElementById("btn-save-groq-key");

    if (groqKeyInput && groqEngine.getApiKey()) {
      groqKeyInput.value = groqEngine.getApiKey();
    }

    configBtn?.addEventListener("click", () => {
      configPopover?.classList.toggle("open");
      voicePopover?.classList.remove("open");
    });

    saveKeyBtn?.addEventListener("click", () => {
      const key = groqKeyInput?.value.trim() || "";
      groqEngine.setApiKey(key);
      configPopover?.classList.remove("open");
      soundEngine.playAIBleep();
      const statusEl = document.getElementById("ai-engine-status");
      if (statusEl) {
        statusEl.textContent = key.startsWith("gsk_") 
          ? "Neural Concierge • Groq Active" 
          : "Neural Concierge • Local Engine";
      }
    });

    const initStatusEl = document.getElementById("ai-engine-status");
    if (initStatusEl) {
      initStatusEl.textContent = groqEngine.hasApiKey()
        ? "Neural Concierge • Groq Active"
        : "Neural Concierge • Local Engine";
    }

    // 9. AI Mic Voice Input
    document.getElementById("btn-ai-mic")?.addEventListener("click", () => {
      aiAssistant.toggleVoiceListening();
    });

    // 10. AI Send Button & Enter Key
    const aiInput = document.getElementById("ai-text-input");
    document.getElementById("btn-ai-send")?.addEventListener("click", () => {
      if (aiInput) handleSendMessage(aiInput.value);
    });

    aiInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSendMessage(aiInput.value);
      }
    });

    // 11. Quick Chips
    document.querySelectorAll(".ai-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const query = chip.getAttribute("data-query");
        if (query) {
          if (query.includes("invitation")) {
            invitationController.toggleReveal();
          } else {
            handleSendMessage(query);
          }
        }
      });
    });

    // 12. Export Invitation Pass Button
    document.getElementById("btn-export-invitation-pass")?.addEventListener("click", () => {
      const guestName = document.getElementById("inv-custom-guest-name")?.value || "Rev. Fr. Dr. Augustine George CMI";
      HologramPassEngine.exportPassAsImage(guestName, "Department of Computational Studies", "KJU-ST26-VIP", "Honored Delegate");
    });

    // 13. Hotkeys: Space for Invitation, Esc for Close
    window.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      if (e.code === "KeyV") {
        e.preventDefault();
        // Activate mic directly without opening chat
        aiAssistant.toggleVoiceListening();
      } else if (e.code === "Space") {
        e.preventDefault();
        invitationController.toggleReveal();
      } else if (e.code === "Escape") {
        if (document.getElementById("invitation-overlay")?.classList.contains("active")) {
          invitationController.toggleReveal();
        } else if (activeDomain) {
          closeDomainSidePanel();
        } else if (aiContainer?.classList.contains("open")) {
          aiAssistant.stopContinuousConversation();
          aiContainer.classList.remove("open");
        }
      }
    });
  }

  // Helpers
  function formatMarkdown(text) {
    return text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/•/g, '<span style="color: #00D2FF;">✦</span>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
