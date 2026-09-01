/**
 * SYNCHROTECH 2K26 — Master Optical Prism & 2D Clipart Spectral Ray Engine
 * Features:
 * 1. White laser strikes crystal core -> refractions disperse into 7 ROYGBIV spectral rays
 * 2. High-precision 2D Clipart vector icons for all domains
 * 3. Vibrating guitar string harmonic audio & dynamic ray hover physics
 * 4. Convergence Reverse Explosion method for Spacebar Invitation Card reveal
 */

import { DOMAINS } from "./data.js";
import { soundEngine } from "./sound-engine.js";

export class MasterCinemaStageEngine {
  constructor(canvasElement, onIgnitionComplete, onSelectDomain) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d");
    this.onIgnitionComplete = onIgnitionComplete;
    this.onSelectDomain = onSelectDomain;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.state = 'idle'; // 'idle', 'igniting', 'splitting', 'active', 'converging'
    this.laserProgress = 0; // 0 -> 1
    this.laserAlpha = 1;    // 1 -> 0
    this.splitProgress = 0; // 0 -> 1
    this.convergenceProgress = 0; // 0 -> 1 for reverse animation
    this.time = 0;

    this.mouse = { x: this.width / 2, y: this.height / 2, px: this.width / 2, py: this.height / 2, active: false };
    this.hoveredDomain = null;
    this.selectedDomainId = null;
    this.lastHovered = null;

    this.technicalDomains = DOMAINS.filter(d => d.id !== "spectrum-ceo");
    this.ceoDomain = DOMAINS.find(d => d.id === "spectrum-ceo");

    // Center Crystal
    this.crystal = {
      x: this.width * 0.5,
      y: this.height * 0.5,
      size: 68,
      rot: 0,
      floatY: 0,
      glowMultiplier: 1.0,
      coreColor: "#FFFFFF"
    };

    this.nodes = [];
    this.stars = [];
    this.shockwaves = [];
    this.photons = [];

    this.onConvergenceCallback = null;

    this.init();
  }

  init() {
    this.resize();
    this.initStars();
    this.initNodes();
    this.initPhotons();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);

    const isMobile = this.width < 768;
    this.crystal.x = this.width * 0.5;
    this.crystal.y = this.height * 0.45;
    this.crystal.size = isMobile ? 50 : 66;

    this.initNodes();
  }

  initStars() {
    this.stars = [];
    for (let i = 0; i < 80; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.5 + 0.1,
        twinkle: Math.random() * 0.03 + 0.01
      });
    }
  }

  initNodes() {
    const isMobile = this.width < 768;
    this.nodes = [];

    if (isMobile) {
      const startAngle = 0.10 * Math.PI;
      const endAngle = 0.90 * Math.PI;
      const radius = Math.min(this.width * 0.40, 160);

      this.technicalDomains.forEach((domain, i) => {
        const step = (endAngle - startAngle) / (this.technicalDomains.length - 1);
        const angle = startAngle + i * step;
        const x = this.crystal.x + Math.cos(angle) * radius;
        const y = this.crystal.y + Math.sin(angle) * radius;
        this.nodes.push({
          domain,
          baseX: x,
          baseY: y,
          x,
          y,
          radius: 20,
          angle,
          amplitude: 0,
          vibrationTime: 0
        });
      });
    } else {
      // Scattered 360-Degree Constellation Starburst
      const angles = [
        -0.80 * Math.PI, // 1: AIML (Red) - Upper Left
        -0.56 * Math.PI, // 2: Quantum (Orange) - Top
        -0.32 * Math.PI, // 3: Animation (Yellow) - Upper Right
         0.00 * Math.PI, // 4: Cybersecurity (Green) - Direct Right
         0.30 * Math.PI, // 5: Cloud (Blue) - Lower Right
         0.65 * Math.PI, // 6: Data Science (Indigo) - Lower Left
         0.85 * Math.PI  // 7: Blockchain (Violet) - Mid Left
      ];

      const distX = Math.min(this.width * 0.42, 540);
      const distY = Math.min(this.height * 0.25, 190);

      this.technicalDomains.forEach((domain, i) => {
        const angle = angles[i];
        const x = this.crystal.x + Math.cos(angle) * distX;
        const y = this.crystal.y + Math.sin(angle) * distY;
        this.nodes.push({
          domain,
          baseX: x,
          baseY: y,
          x,
          y,
          radius: 24,
          angle,
          amplitude: 0,
          vibrationTime: 0
        });
      });
    }
  }

  initPhotons() {
    this.laserPhotons = [];
    for (let i = 0; i < 90; i++) {
      this.laserPhotons.push({
        nodeIndex: Math.floor(Math.random() * this.technicalDomains.length),
        progress: Math.random(),
        speed: 0.007 + Math.random() * 0.009,
        size: 1.4 + Math.random() * 2.2
      });
    }
  }

  bindEvents() {
    window.addEventListener("resize", () => this.resize());

    const updatePointer = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.px = this.mouse.x;
      this.mouse.py = this.mouse.y;
      this.mouse.x = clientX - rect.left;
      this.mouse.y = clientY - rect.top;
      this.mouse.active = true;

      if (this.state === 'active') {
        this.checkHover();
      }
    };

    this.canvas.addEventListener("mousemove", (e) => updatePointer(e.clientX, e.clientY));
    this.canvas.addEventListener("touchmove", (e) => {
      if (e.touches[0]) updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.mouse.active = false;
      this.hoveredDomain = null;
      this.canvas.style.cursor = "default";
    });

    const handleTap = (clientX, clientY) => {
      soundEngine.ensureContext();

      if (this.state === 'idle') {
        this.triggerIgnition();
        return;
      }

      if (this.state === 'active') {
        const distToCrystal = Math.hypot(this.mouse.x - this.crystal.x, this.mouse.y - this.crystal.y);
        if (distToCrystal < this.crystal.size + 24) {
          soundEngine.playModalSwoosh();
          if (this.onClickCoreAI) {
            this.onClickCoreAI();
          } else if (this.onSelectDomain) {
            this.selectedDomainId = this.ceoDomain.id;
            this.crystal.coreColor = "#FFFFFF";
            this.onSelectDomain(this.ceoDomain);
          }
          return;
        }

        if (this.hoveredDomain && this.onSelectDomain) {
          soundEngine.playModalSwoosh();
          this.selectedDomainId = this.hoveredDomain.id;
          this.crystal.coreColor = this.hoveredDomain.color;
          this.onSelectDomain(this.hoveredDomain);
        }
      }
    };

    this.canvas.addEventListener("click", (e) => handleTap(e.clientX, e.clientY));
    this.canvas.addEventListener("touchend", (e) => {
      if (e.changedTouches[0]) handleTap(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    });
  }

  setAISpeaking(speaking) {
    this.isAISpeaking = Boolean(speaking);
    this.crystal.glowMultiplier = this.isAISpeaking ? 2.4 : 1.0;
  }

  setAIListening(listening) {
    this.isAIListening = Boolean(listening);
    this.crystal.glowMultiplier = this.isAIListening ? 2.8 : 1.0;
  }

  focusRayOnDomain(domainId) {
    this.selectedDomainId = domainId;
    const found = DOMAINS.find(d => d.id === domainId);
    if (found) {
      this.crystal.coreColor = found.color;
      const node = this.nodes.find(n => n.domain.id === domainId);
      if (node) {
        node.amplitude = 22;
        node.vibrationTime = 0;
      }
    }
  }

  triggerIgnition() {
    if (this.state !== 'idle') return;
    this.state = 'igniting';
    this.laserProgress = 0;
    this.laserAlpha = 1;
    this.splitProgress = 0;

    soundEngine.playPrismLaserRefraction();
  }

  /**
   * Reverse Convergence Animation for Invitation Reveal
   */
  triggerConvergence(onComplete) {
    this.state = 'converging';
    this.convergenceProgress = 0;
    this.onConvergenceCallback = onComplete;
  }

  restoreFromConvergence() {
    this.state = 'active';
    this.convergenceProgress = 0;
    this.crystal.size = (this.width < 768) ? 50 : 68;
    this.crystal.glowMultiplier = 1.0;
  }

  setSelectedDomain(domainId) {
    this.selectedDomainId = domainId;
    const found = DOMAINS.find(d => d.id === domainId);
    if (found) {
      this.crystal.coreColor = found.color;
    } else {
      this.crystal.coreColor = "#FFFFFF";
    }
  }

  checkHover() {
    let matched = null;

    // Check central crystal
    const distToCrystal = Math.hypot(this.mouse.x - this.crystal.x, this.mouse.y - this.crystal.y);
    if (distToCrystal < this.crystal.size + 16) {
      matched = this.ceoDomain;
    }

    // Check 7 spectral rays & nodes
    if (!matched) {
      for (const node of this.nodes) {
        const distToNode = Math.hypot(this.mouse.x - node.x, this.mouse.y - node.y);
        if (distToNode < node.radius + 20) {
          matched = node.domain;
          this.pluckRay(node);
          break;
        }

        const dRay = this.distToSegment(
          this.mouse.x, this.mouse.y,
          this.crystal.x, this.crystal.y,
          node.x, node.y
        );
        if (dRay < 24) {
          matched = node.domain;
          this.pluckRay(node);
          break;
        }
      }
    }

    this.hoveredDomain = matched;
    this.canvas.style.cursor = (matched || this.state === 'idle') ? "pointer" : "default";

    if (matched && matched !== this.lastHovered) {
      soundEngine.pluckGuitarString(matched.id, matched.frequencyHz || 440, 1.0);
      window.dispatchEvent(new CustomEvent("synchro:rayHover", { detail: matched }));
    }
    this.lastHovered = matched;
  }

  pluckRay(node) {
    if (node.amplitude < 2) {
      node.amplitude = 16;
      node.vibrationTime = 0;
    }
  }

  distToSegment(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  animate() {
    this.time += 0.02;

    this.crystal.floatY = Math.sin(this.time * 2.2) * 6;
    this.crystal.rot += 0.008;

    // STEP 1: White Laser Strikes Crystal
    if (this.state === 'igniting') {
      this.laserProgress += 0.045;
      if (this.laserProgress >= 1) {
        this.laserProgress = 1;
        this.state = 'splitting';

        // Impact shockwave
        this.shockwaves.push({
          x: this.crystal.x,
          y: this.crystal.y + this.crystal.floatY,
          radius: 10,
          alpha: 1,
          speed: 18
        });

        // Arpeggio pluck
        this.nodes.forEach((node, i) => {
          setTimeout(() => {
            node.amplitude = 16;
            node.vibrationTime = 0;
            soundEngine.pluckGuitarString(node.domain.id, node.domain.frequencyHz || 440, 0.85);
          }, i * 65);
        });
      }
    }

    // STEP 2: Refract Rays & Fade Out White Laser Ray
    if (this.state === 'splitting') {
      this.splitProgress += 0.025;
      if (this.laserAlpha > 0) {
        this.laserAlpha = Math.max(0, this.laserAlpha - 0.05);
      }

      if (this.splitProgress >= 1) {
        this.splitProgress = 1;
        this.laserAlpha = 0;
        this.state = 'active';
        if (this.onIgnitionComplete) this.onIgnitionComplete();
      }
    }

    // STEP 3: Convergence Reverse Animation
    if (this.state === 'converging') {
      this.convergenceProgress += 0.03;
      this.crystal.rot += 0.04;
      this.crystal.glowMultiplier = 1.0 + this.convergenceProgress * 2.5;

      if (this.convergenceProgress >= 1) {
        this.convergenceProgress = 1;
        this.shockwaves.push({
          x: this.crystal.x,
          y: this.crystal.y + this.crystal.floatY,
          radius: 20,
          alpha: 1,
          speed: 25
        });
        if (this.onConvergenceCallback) {
          const cb = this.onConvergenceCallback;
          this.onConvergenceCallback = null;
          cb();
        }
      }
    }

    // Ray Damped Vibrations
    this.nodes.forEach(node => {
      if (node.amplitude > 0.05) {
        node.vibrationTime += 0.05;
        node.amplitude *= 0.94;
      } else {
        node.amplitude = 0;
      }
    });

    this.render();
    requestAnimationFrame(() => this.animate());
  }

  render() {
    // Obsidian Void Background
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 1. Ambient Starlight
    this.drawStars();

    // 2. Shockwaves
    this.drawShockwaves();

    // 3. Incoming White Laser Beam (Ignition phase)
    if (this.state !== 'idle' && this.laserAlpha > 0.01) {
      this.drawIncomingWhiteLaser();
    }

    // 4. Refracted 7 Spectral Rays
    if (this.splitProgress > 0) {
      this.drawSpectralRays();
      this.drawPhotons();
    }

    // 5. Central 3D Faceted Crystal Gemstone
    this.drawCrystalPrism();

    // 6. Minimal Pulse Dot in Idle State (No verbose text strings)
    if (this.state === 'idle') {
      this.drawIdlePulseDot();
    }
  }

  drawStars() {
    this.ctx.save();
    this.stars.forEach(s => {
      const alpha = s.alpha + Math.sin(this.time * 4 * s.twinkle) * 0.15;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.08, alpha)})`;
      this.ctx.fill();
    });
    this.ctx.restore();
  }

  drawShockwaves() {
    this.shockwaves.forEach((sw, idx) => {
      sw.radius += sw.speed;
      sw.alpha -= 0.025;

      if (sw.alpha <= 0) {
        this.shockwaves.splice(idx, 1);
        return;
      }

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${sw.alpha})`;
      this.ctx.lineWidth = 3.5;
      this.ctx.shadowColor = "#00D2FF";
      this.ctx.shadowBlur = 35;
      this.ctx.stroke();
      this.ctx.restore();
    });
  }

  drawIncomingWhiteLaser() {
    const isMobile = this.width < 768;
    const startX = isMobile ? this.width * 0.5 : 0;
    const startY = isMobile ? 0 : this.crystal.y - 140;
    const endX = this.crystal.x;
    const endY = this.crystal.y + this.crystal.floatY;

    const curX = startX + (endX - startX) * this.laserProgress;
    const curY = startY + (endY - startY) * this.laserProgress;

    this.ctx.save();
    // Volumetric Beam Glow
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(curX, curY);
    this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 * this.laserAlpha})`;
    this.ctx.lineWidth = 16;
    this.ctx.shadowColor = "#FFFFFF";
    this.ctx.shadowBlur = 40 * this.laserAlpha;
    this.ctx.stroke();

    // Laser Core
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(curX, curY);
    this.ctx.strokeStyle = `rgba(255, 255, 255, ${this.laserAlpha})`;
    this.ctx.lineWidth = 4;
    this.ctx.shadowBlur = 0;
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawSpectralRays() {
    const crystalY = this.crystal.y + this.crystal.floatY;
    const convFactor = (this.state === 'converging') ? (1 - this.convergenceProgress) : 1;

    this.nodes.forEach((node) => {
      const isHovered = this.hoveredDomain && this.hoveredDomain.id === node.domain.id;
      const isSelected = this.selectedDomainId && this.selectedDomainId === node.domain.id;
      const domain = node.domain;

      // Handle convergence pull back to crystal
      const targetBaseX = this.crystal.x + (node.baseX - this.crystal.x) * convFactor;
      const targetBaseY = crystalY + (node.baseY - crystalY) * convFactor;
      node.x = targetBaseX;
      node.y = targetBaseY;

      const targetX = this.crystal.x + (node.x - this.crystal.x) * this.splitProgress;
      const targetY = crystalY + (node.y - crystalY) * this.splitProgress;

      let controlX = (this.crystal.x + targetX) / 2;
      let controlY = (crystalY + targetY) / 2;

      // Harmonic string vibration
      if (node.amplitude > 0.05) {
        const wave = Math.sin(node.vibrationTime * 30) * node.amplitude;
        controlY += wave;
      }

      // Magnetic curve toward cursor on hover
      if (isHovered && this.mouse.active && this.state === 'active') {
        controlX += (this.mouse.x - controlX) * 0.35;
        controlY += (this.mouse.y - controlY) * 0.35;
      }

      this.ctx.save();
      // Volumetric Laser Glow
      this.ctx.beginPath();
      this.ctx.moveTo(this.crystal.x, crystalY);
      this.ctx.quadraticCurveTo(controlX, controlY, targetX, targetY);
      this.ctx.strokeStyle = (isHovered || isSelected) ? domain.color : domain.glowColor;
      this.ctx.lineWidth = (isHovered || isSelected) ? 9 : 4;
      this.ctx.shadowColor = domain.color;
      this.ctx.shadowBlur = (isHovered || isSelected) ? 40 : 20;
      this.ctx.stroke();

      // Sharp Core Filament
      this.ctx.beginPath();
      this.ctx.moveTo(this.crystal.x, crystalY);
      this.ctx.quadraticCurveTo(controlX, controlY, targetX, targetY);
      this.ctx.strokeStyle = (isHovered || isSelected) ? "#FFFFFF" : "rgba(255, 255, 255, 0.9)";
      this.ctx.lineWidth = (isHovered || isSelected) ? 2.8 : 1.5;
      this.ctx.shadowBlur = 0;
      this.ctx.stroke();
      this.ctx.restore();

      // Draw 2D Clipart Node
      if (this.splitProgress >= 0.85 && convFactor > 0.3) {
        this.drawClipartNode(node, targetX, targetY, isHovered || isSelected);
      }
    });
  }

  drawClipartNode(node, x, y, isHighlighted) {
    const { domain, radius } = node;
    const r = isHighlighted ? radius + 5 : radius;

    this.ctx.save();
    this.ctx.translate(x, y);

    // Outer Halo Ring
    this.ctx.beginPath();
    this.ctx.arc(0, 0, r + 6, 0, Math.PI * 2);
    this.ctx.strokeStyle = domain.color;
    this.ctx.lineWidth = 1.4;
    this.ctx.shadowColor = domain.color;
    this.ctx.shadowBlur = isHighlighted ? 25 : 12;
    this.ctx.stroke();

    // Node Circle Background
    this.ctx.beginPath();
    this.ctx.arc(0, 0, r, 0, Math.PI * 2);
    this.ctx.fillStyle = isHighlighted ? domain.color : "rgba(4, 8, 24, 0.95)";
    this.ctx.strokeStyle = isHighlighted ? "#FFFFFF" : domain.color;
    this.ctx.lineWidth = 2;
    this.ctx.fill();
    this.ctx.stroke();

    // 2D Vector Clipart Icon
    const iconColor = isHighlighted ? "#000000" : domain.color;
    this.ctx.strokeStyle = iconColor;
    this.ctx.fillStyle = iconColor;
    this.ctx.lineWidth = 1.8;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    const s = r * 0.54;

    switch (domain.id) {
      case "aiml": // Cybernetic Neural Brain with Lobes & Synapses
        this.ctx.beginPath();
        this.ctx.arc(-s * 0.35, -s * 0.25, s * 0.25, Math.PI, Math.PI * 1.8);
        this.ctx.arc(-s * 0.35, s * 0.2, s * 0.25, Math.PI * 0.6, Math.PI * 1.3);
        this.ctx.arc(s * 0.35, -s * 0.25, s * 0.25, -Math.PI * 0.8, 0);
        this.ctx.arc(s * 0.35, s * 0.2, s * 0.25, -Math.PI * 0.3, Math.PI * 0.4);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(0, -s * 0.5);
        this.ctx.lineTo(0, s * 0.5);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(-s * 0.3, 0, s * 0.1, 0, Math.PI * 2);
        this.ctx.arc(s * 0.3, 0, s * 0.1, 0, Math.PI * 2);
        this.ctx.fill();
        break;

      case "datascience": // Database Stack with Waveform
        this.ctx.beginPath();
        this.ctx.ellipse(0, -s * 0.45, s * 0.6, s * 0.18, 0, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(-s * 0.6, -s * 0.45);
        this.ctx.lineTo(-s * 0.6, -s * 0.1);
        this.ctx.ellipse(0, -s * 0.1, s * 0.6, s * 0.18, 0, 0, Math.PI);
        this.ctx.lineTo(s * 0.6, -s * 0.45);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(-s * 0.6, -s * 0.1);
        this.ctx.lineTo(-s * 0.6, s * 0.25);
        this.ctx.ellipse(0, s * 0.25, s * 0.6, s * 0.18, 0, 0, Math.PI);
        this.ctx.lineTo(s * 0.6, -s * 0.1);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(-s * 0.4, s * 0.55);
        this.ctx.lineTo(-s * 0.1, s * 0.55);
        this.ctx.lineTo(0, s * 0.35);
        this.ctx.lineTo(s * 0.15, s * 0.65);
        this.ctx.lineTo(s * 0.4, s * 0.55);
        this.ctx.stroke();
        break;

      case "animation": // Gamepad Controller
        this.ctx.beginPath();
        this.ctx.roundRect(-s * 0.7, -s * 0.4, s * 1.4, s * 0.8, s * 0.3);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(-s * 0.4, -s * 0.2);
        this.ctx.lineTo(-s * 0.4, s * 0.2);
        this.ctx.moveTo(-s * 0.55, 0);
        this.ctx.lineTo(-s * 0.25, 0);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(s * 0.42, -s * 0.1, s * 0.07, 0, Math.PI * 2);
        this.ctx.arc(s * 0.28, 0.05, s * 0.07, 0, Math.PI * 2);
        this.ctx.arc(s * 0.45, 0.15, s * 0.07, 0, Math.PI * 2);
        this.ctx.fill();
        break;

      case "cybersecurity": // Aegis Shield with Keyhole
        this.ctx.beginPath();
        this.ctx.moveTo(0, -s * 0.7);
        this.ctx.lineTo(s * 0.65, -s * 0.4);
        this.ctx.lineTo(s * 0.5, s * 0.3);
        this.ctx.lineTo(0, s * 0.75);
        this.ctx.lineTo(-s * 0.5, s * 0.3);
        this.ctx.lineTo(-s * 0.65, -s * 0.4);
        this.ctx.closePath();
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(0, -s * 0.1, s * 0.14, 0, Math.PI * 2);
        this.ctx.moveTo(0, -s * 0.05);
        this.ctx.lineTo(0, s * 0.2);
        this.ctx.stroke();
        break;

      case "cloud": // Cloud with Arrows
        this.ctx.beginPath();
        this.ctx.arc(-s * 0.3, s * 0.05, s * 0.28, Math.PI * 0.5, Math.PI * 1.5);
        this.ctx.arc(0, -s * 0.2, s * 0.38, Math.PI * 1, Math.PI * 2);
        this.ctx.arc(s * 0.3, s * 0.05, s * 0.28, Math.PI * 1.5, Math.PI * 0.5);
        this.ctx.closePath();
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(-s * 0.12, s * 0.15);
        this.ctx.lineTo(-s * 0.12, -s * 0.05);
        this.ctx.lineTo(-s * 0.2, 0);
        this.ctx.moveTo(s * 0.12, -s * 0.05);
        this.ctx.lineTo(s * 0.12, s * 0.15);
        this.ctx.lineTo(s * 0.2, s * 0.1);
        this.ctx.stroke();
        break;

      case "quantum": // Quantum Orbital Core
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, s * 0.85, s * 0.32, Math.PI / 4, 0, Math.PI * 2);
        this.ctx.ellipse(0, 0, s * 0.85, s * 0.32, -Math.PI / 4, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2);
        this.ctx.fill();
        break;

      case "blockchain": // Interconnected Cubes
        this.ctx.beginPath();
        this.ctx.moveTo(0, -s * 0.65);
        this.ctx.lineTo(s * 0.55, -s * 0.3);
        this.ctx.lineTo(s * 0.55, s * 0.35);
        this.ctx.lineTo(0, s * 0.7);
        this.ctx.lineTo(-s * 0.55, s * 0.35);
        this.ctx.lineTo(-s * 0.55, -s * 0.3);
        this.ctx.closePath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, s * 0.7);
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(s * 0.55, -s * 0.3);
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(-s * 0.55, -s * 0.3);
        this.ctx.stroke();
        break;

      default:
        this.ctx.beginPath();
        this.ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    this.ctx.restore();

    // Domain Typography Below Node
    this.ctx.save();
    this.ctx.font = isHighlighted ? "800 12px 'Space Grotesk', sans-serif" : "600 11px 'Space Grotesk', sans-serif";
    this.ctx.fillStyle = isHighlighted ? "#FFFFFF" : "rgba(255, 255, 255, 0.85)";
    this.ctx.textAlign = "center";
    this.ctx.shadowColor = domain.color;
    this.ctx.shadowBlur = isHighlighted ? 12 : 0;
    this.ctx.fillText(domain.name, x, y + r + 16);
    this.ctx.restore();
  }

  drawPhotons() {
    if (this.splitProgress < 0.9 || this.state === 'converging') return;
    const crystalY = this.crystal.y + this.crystal.floatY;

    this.ctx.save();
    this.laserPhotons.forEach(p => {
      p.progress += p.speed;
      if (p.progress > 1) {
        p.progress = 0;
        p.nodeIndex = Math.floor(Math.random() * this.nodes.length);
      }

      const node = this.nodes[p.nodeIndex];
      if (!node) return;

      const px = this.crystal.x + (node.x - this.crystal.x) * p.progress;
      const py = crystalY + (node.y - crystalY) * p.progress;

      this.ctx.beginPath();
      this.ctx.arc(px, py, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.shadowColor = node.domain.color;
      this.ctx.shadowBlur = 12;
      this.ctx.fill();
    });
    this.ctx.restore();
  }

  drawCrystalPrism() {
    const cx = this.crystal.x;
    const cy = this.crystal.y + this.crystal.floatY;
    const size = this.crystal.size;
    const glowMul = this.crystal.glowMultiplier || 1.0;

    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(this.crystal.rot);

    // Radiant Optical Flare
    const flare = this.ctx.createRadialGradient(0, 0, 4, 0, 0, size * 2.2 * glowMul);
    flare.addColorStop(0, "rgba(255, 255, 255, 0.98)");
    flare.addColorStop(0.3, "rgba(0, 210, 255, 0.4)");
    flare.addColorStop(0.7, "rgba(168, 85, 247, 0.25)");
    flare.addColorStop(1, "rgba(0, 0, 0, 0)");

    this.ctx.beginPath();
    this.ctx.arc(0, 0, size * 2.2 * glowMul, 0, Math.PI * 2);
    this.ctx.fillStyle = flare;
    this.ctx.fill();

    // 6-Sided Faceted Diamond Outline
    const sides = 6;
    this.ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const a = (i * 2 * Math.PI) / sides;
      const px = Math.cos(a) * size;
      const py = Math.sin(a) * size;
      if (i === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);
    }
    this.ctx.closePath();

    const glassGrad = this.ctx.createLinearGradient(-size, -size, size, size);
    glassGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    glassGrad.addColorStop(0.5, "rgba(180, 220, 255, 0.45)");
    glassGrad.addColorStop(1, "rgba(150, 100, 255, 0.65)");

    this.ctx.fillStyle = glassGrad;
    this.ctx.shadowColor = this.crystal.coreColor || "#FFFFFF";
    this.ctx.shadowBlur = (this.state !== 'idle') ? 35 * glowMul : 18;
    this.ctx.fill();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "#FFFFFF";
    this.ctx.stroke();

    // Internal Facets
    for (let i = 0; i < sides; i++) {
      const a = (i * 2 * Math.PI) / sides;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawIdlePulseDot() {
    const cx = this.crystal.x;
    const cy = this.crystal.y + this.crystal.floatY + this.crystal.size + 36;
    const pulse = (Math.sin(this.time * 3.5) + 1) / 2;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 3 + pulse * 2, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(0, 210, 255, ${0.4 + pulse * 0.6})`;
    this.ctx.shadowColor = "#00D2FF";
    this.ctx.shadowBlur = 12;
    this.ctx.fill();
    this.ctx.restore();
  }
}
