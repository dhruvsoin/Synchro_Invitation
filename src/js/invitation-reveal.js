/**
 * SYNCHROTECH 2K26 — Master Invitation Reveal Controller
 * Handles the dramatic convergence animation, optical overload burst,
 * and holographic invitation card materialize sequence.
 */

import { soundEngine } from "./sound-engine.js";

export class InvitationRevealController {
  constructor(stageEngine, aiAssistant) {
    this.stageEngine = stageEngine;
    this.aiAssistant = aiAssistant;
    this.isRevealed = false;
    this.isAnimating = false;

    this.cardOverlay = document.getElementById("invitation-overlay");
    this.cardElement = document.getElementById("invitation-card");
    this.closeBtn = document.getElementById("btn-close-invitation");

    this.bindEvents();
  }

  bindEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.close());
    }

    if (this.cardOverlay) {
      this.cardOverlay.addEventListener("click", (e) => {
        if (e.target === this.cardOverlay) this.close();
      });
    }

    // 3D Tilt Shimmer for Invitation Card
    if (this.cardElement) {
      this.cardElement.addEventListener("mousemove", (e) => {
        const rect = this.cardElement.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotY = (x / (rect.width / 2)) * 12;
        const rotX = -(y / (rect.height / 2)) * 12;
        this.cardElement.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      this.cardElement.addEventListener("mouseleave", () => {
        this.cardElement.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      });
    }
  }

  toggleReveal() {
    if (this.isAnimating) return;
    if (this.isRevealed) {
      this.close();
    } else {
      this.triggerReveal();
    }
  }

  triggerReveal() {
    if (this.isRevealed || this.isAnimating) return;
    this.isAnimating = true;

    // Immediately stop any active speech to avoid overlapping voices
    if (this.aiAssistant) {
      this.aiAssistant.stopSpeech();
    }

    // 1. Play full arpeggio chord + overload sweep
    soundEngine.playFullSpectrumArpeggio();

    // 2. Animate reverse convergence on canvas
    if (this.stageEngine) {
      this.stageEngine.triggerConvergence(() => {
        this.showCard();
      });
    } else {
      this.showCard();
    }
  }

  showCard() {
    if (!this.cardOverlay) return;

    this.cardOverlay.classList.add("active");
    this.isRevealed = true;
    this.isAnimating = false;

    // Sound effect for card materialize
    soundEngine.playPrismLaserRefraction();

    // AI voice narration
    if (this.aiAssistant) {
      this.aiAssistant.speak(
        "You are cordially invited to Synchrotech 2026. Department of Computational Studies invites you to Decode the Spectrum, September 7th to 11th, at Kristu Jayanti University."
      );
    }
  }

  close() {
    if (!this.isRevealed) return;
    this.cardOverlay?.classList.remove("active");
    this.isRevealed = false;
    this.isAnimating = false;
    soundEngine.playUIClick();

    if (this.stageEngine) {
      this.stageEngine.restoreFromConvergence();
    }
  }
}
