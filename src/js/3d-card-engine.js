/**
 * SYNCHROTECH 2026 — 3D Holographic Pass & Parallax Engine
 * Renders 3D Gyro/Cursor responsive tilt, metallic gold glare sheen, and personalized ticket generation
 */

import { soundEngine } from "./sound-engine.js";

export class HologramPassEngine {
  constructor(cardElement, options = {}) {
    this.card = cardElement;
    this.container = cardElement.parentElement;
    this.glare = cardElement.querySelector(".card-gold-sheen");
    this.options = Object.assign({ maxTilt: 14, perspective: 1000 }, options);

    this.isHovered = false;
    this.initParallax();
  }

  initParallax() {
    if (!this.card || !this.container) return;

    const handleMove = (x, y) => {
      const rect = this.container.getBoundingClientRect();
      const cardX = x - rect.left;
      const cardY = y - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const percentX = (cardX - centerX) / centerX;
      const percentY = (cardY - centerY) / centerY;

      const rotateY = percentX * this.options.maxTilt;
      const rotateX = -percentY * this.options.maxTilt;

      this.card.style.transform = `perspective(${this.options.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

      if (this.glare) {
        const glareX = (percentX + 1) * 50;
        const glareY = (percentY + 1) * 50;
        this.glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 240, 180, 0.22) 0%, rgba(212, 175, 55, 0.12) 35%, transparent 70%)`;
      }
    };

    this.container.addEventListener("mousemove", (e) => {
      this.isHovered = true;
      handleMove(e.clientX, e.clientY);
    });

    this.container.addEventListener("mouseleave", () => {
      this.isHovered = false;
      this.card.style.transform = `perspective(${this.options.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      this.card.style.transition = "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)";
      if (this.glare) {
        this.glare.style.background = "none";
      }
    });

    this.container.addEventListener("mouseenter", () => {
      this.card.style.transition = "none";
    });

    // Mobile Device Orientation Gyroscope
    if (window.DeviceOrientationEvent && "ontouchstart" in window) {
      window.addEventListener("deviceorientation", (e) => {
        if (!e.gamma || !e.beta) return;
        const tiltX = Math.max(-16, Math.min(16, e.gamma)); // Left/Right
        const tiltY = Math.max(-16, Math.min(16, e.beta - 45)); // Front/Back
        
        this.card.style.transform = `perspective(${this.options.perspective}px) rotateX(${-tiltY * 0.4}deg) rotateY(${tiltX * 0.4}deg)`;
      });
    }
  }

  // Generate Personalized Royal Academic Pass Canvas Download
  static exportPassAsImage(name, dept, regNo, role) {
    soundEngine.playUIClick();
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 700;
    const ctx = canvas.getContext("2d");

    // Background Gradient (Obsidian Velvet)
    const bgGrad = ctx.createRadialGradient(600, 200, 50, 600, 350, 650);
    bgGrad.addColorStop(0, "#0F172E");
    bgGrad.addColorStop(0.7, "#060914");
    bgGrad.addColorStop(1, "#03050A");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 700);

    // Double Royal Gold Border
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, 1152, 652);

    ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(36, 36, 1128, 628);

    // Gold Corner Accents
    const cornerSize = 28;
    ctx.strokeStyle = "#FFF0B4";
    ctx.lineWidth = 3;

    // TL
    ctx.strokeRect(28, 28, cornerSize, cornerSize);
    // TR
    ctx.strokeRect(1200 - 28 - cornerSize, 28, cornerSize, cornerSize);
    // BL
    ctx.strokeRect(28, 700 - 28 - cornerSize, cornerSize, cornerSize);
    // BR
    ctx.strokeRect(1200 - 28 - cornerSize, 700 - 28 - cornerSize, cornerSize, cornerSize);

    // University Header
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 24px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("KRISTU JAYANTI (DEEMED TO BE UNIVERSITY)", 600, 80);

    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.font = "600 15px 'JetBrains Mono', monospace";
    ctx.fillText("SCHOOL OF COMPUTATIONAL AND PHYSICAL SCIENCES", 600, 105);

    ctx.fillStyle = "#00D2FF";
    ctx.font = "700 15px 'JetBrains Mono', monospace";
    ctx.fillText("DEPARTMENT OF COMPUTATIONAL STUDIES", 600, 128);

    // Gold Divider
    ctx.strokeStyle = "rgba(212, 175, 55, 0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(200, 146);
    ctx.lineTo(1000, 146);
    ctx.stroke();

    ctx.fillStyle = "#D4AF37";
    ctx.font = "700 18px serif";
    ctx.fillText("✦", 600, 152);

    // Proclamation
    ctx.fillStyle = "#E2D9C8";
    ctx.font = "italic 16px 'Space Grotesk', serif";
    ctx.fillText("The Management, Faculty & Students cordially invite you to", 600, 178);

    ctx.fillStyle = "#D4AF37";
    ctx.font = "700 14px 'JetBrains Mono', monospace";
    ctx.fillText("THE INTRA-UNIVERSITY TECHNICAL FEST", 600, 202);

    // Fest Title
    ctx.fillStyle = "#FFF6D6";
    ctx.font = "900 56px 'Space Grotesk', serif";
    ctx.fillText("SYNCHROTECH", 600, 260);

    ctx.font = "900 38px 'Space Grotesk', serif";
    ctx.fillText("2026", 600, 302);

    ctx.fillStyle = "#00FFCC";
    ctx.font = "700 20px 'Space Grotesk', sans-serif";
    ctx.fillText("“ DECODE THE SPECTRUM ”", 600, 335);

    // VIP Plaque Box
    ctx.fillStyle = "rgba(212, 175, 55, 0.08)";
    ctx.fillRect(200, 360, 800, 95);
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(200, 360, 800, 95);

    ctx.fillStyle = "#D4AF37";
    ctx.font = "700 13px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("HONORED DELEGATE PASS", 220, 385);
    ctx.textAlign = "right";
    ctx.fillText("PASS NO: KJU-ST26-VIP", 980, 385);

    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 26px 'Space Grotesk', sans-serif";
    ctx.fillText(name || "Rev. Fr. Dr. Augustine George CMI", 600, 424);

    // Schedule Pill Grid
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fillRect(150, 480, 900, 60);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.strokeRect(150, 480, 900, 60);

    ctx.textAlign = "center";
    ctx.fillStyle = "#D4AF37";
    ctx.font = "700 15px 'JetBrains Mono', monospace";
    ctx.fillText("DATE: 11TH SEPTEMBER 2026   •   VENUE: M1 AUDITORIUM", 600, 516);

    // Signatories Footer
    ctx.textAlign = "left";
    ctx.fillStyle = "#D4AF37";
    ctx.font = "700 13px 'JetBrains Mono', monospace";
    ctx.fillText("STUDENT COORDINATOR", 150, 575);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 18px 'Space Grotesk', sans-serif";
    ctx.fillText("Dhruv Soin (24DTSA22)", 150, 600);

    ctx.textAlign = "right";
    ctx.fillStyle = "#D4AF37";
    ctx.font = "700 13px 'JetBrains Mono', monospace";
    ctx.fillText("STUDENT COORDINATOR", 1050, 575);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 18px 'Space Grotesk', sans-serif";
    ctx.fillText("Emy Elizabeth Oommen (24BCYA47)", 1050, 600);

    // Convert to Downloadable PNG
    const link = document.createElement("a");
    link.download = `SYNCHROTECH_2026_VIP_PASS_${(name || "DELEGATE").replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
