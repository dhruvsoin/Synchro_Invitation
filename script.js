/* ==========================================================================
   SYNCHROTECH 2026 — ENGINE & DATA ARCHITECTURE
   Complete Brochure Integration & Interactive Domain/Schedule System
   ========================================================================== */

(function () {
    'use strict';

    /* -----------------------------------------------------------------------
       1. BROCHURE DATA: 8 DOMAINS & 12 EVENTS
       ----------------------------------------------------------------------- */
    const DOMAIN_DATA = [
        {
            id: 'aiml',
            name: 'AI & Machine Learning',
            tag: 'Domain 01 · AIML',
            tagline: 'Intelligence, amplified through neural horizons',
            color: '#FF3131',
            rgb: '255, 49, 49',
            starTitle: 'Crimson Mind',
            head: { name: 'Justin Johnson', id: '24AIML27', contact: '7696811958' },
            events: [
                {
                    name: 'Zero Verdict',
                    type: 'Solo Event',
                    concept: 'AI tools and intuition to solve forensic murder case.',
                    rounds: [
                        { num: 'R1', name: 'Zero In', desc: 'Case brief & time-capped logic filter test.' },
                        { num: 'R2', name: 'The Verdict', desc: 'Expose the culprit with an airtight evidence dossier.' }
                    ]
                },
                {
                    name: 'Synth-a-Song',
                    type: 'Team Event',
                    concept: 'AI music synthesis and cover art generation from random genre prompts.',
                    rounds: [
                        { num: 'R1', name: 'Sound Prompt & Synthesis', desc: 'Compose a complete track using Suno/Udio AI.' },
                        { num: 'R2', name: 'Album Visuals & Live Pitch', desc: 'Generate cover art & defend thematic choices to judges.' }
                    ]
                }
            ]
        },
        {
            id: 'cyber',
            name: 'Cybersecurity',
            tag: 'Domain 02 · Cybersecurity',
            tagline: 'Defending the perimeter, breaking the unbreakable',
            color: '#8BC54B',
            rgb: '139, 197, 75',
            starTitle: 'Emerald Sentinel',
            head: { name: 'Adith Joel', id: '24BCYA13', contact: '8884002302' },
            events: [
                {
                    name: 'CTF (Capture The Flag)',
                    type: 'Team Event',
                    concept: 'Live hands-on vulnerability exploit & flag hunt.',
                    rounds: [
                        { num: 'R1', name: 'Mind Clash', desc: 'Cybersecurity fundamentals & threat MCQs.' },
                        { num: 'R2', name: 'CTF Challenge', desc: 'Live system exploitation & hidden flag extraction.' }
                    ]
                },
                {
                    name: 'ThreatX',
                    type: 'Team Event',
                    concept: 'Defensive strategies, incident response, and cyber court.',
                    rounds: [
                        { num: 'R1', name: 'Cyber Quiz', desc: 'Security concepts and protocol screen.' },
                        { num: 'R2', name: 'Security Sense', desc: 'Match defense countermeasures to live attacks.' },
                        { num: 'R3', name: 'Cyber Court', desc: 'High-stakes debate defending cyber incident positions.' }
                    ]
                }
            ]
        },
        {
            id: 'cloud',
            name: 'Cloud Computing',
            tag: 'Domain 03 · Cloud Computing',
            tagline: 'Infinite scale, resilient global architecture',
            color: '#38B6FF',
            rgb: '56, 182, 255',
            starTitle: 'Blue Nimbus',
            head: { name: 'Divya Patel', id: '24BCLA16', contact: '9620877001' },
            events: [
                {
                    name: 'Architecture Pitch',
                    type: 'Team Event',
                    concept: 'Design, adapt, and defend real-world cloud architectures.',
                    rounds: [
                        { num: 'R1', name: 'Cloud Aptitude MCQ', desc: 'AWS core services & compute principles.' },
                        { num: 'R2', name: "Architect's Gambit", desc: 'Adapt architecture to unexpected scale constraints.' },
                        { num: 'R3', name: 'Build the Cloud', desc: 'Full architecture pitch under fixed credit budget.' }
                    ]
                },
                {
                    name: 'Cloud Cipher',
                    type: 'Team Event',
                    concept: 'High-energy AWS charades and VPC scenario solving.',
                    rounds: [
                        { num: 'R1', name: 'Cloud Quiz', desc: 'Infrastructure, pricing, and serverless logic.' },
                        { num: 'R2', name: 'Cloud Charades', desc: 'Act and guess cloud services under time limits.' },
                        { num: 'R3', name: 'Cloud Mastery', desc: 'Design serverless, fault-tolerant VPC systems.' }
                    ]
                }
            ]
        },
        {
            id: 'datasci',
            name: 'Data Science',
            tag: 'Domain 04 · Data Science',
            tagline: 'Where numbers reveal patterns and shape decisions',
            color: '#7D83D7',
            rgb: '125, 131, 215',
            starTitle: 'Indigo Insight',
            head: { name: 'Subham Malla', id: '24DTSA27', contact: '8837275099' },
            events: [
                {
                    name: 'DataForge',
                    type: 'Team Event',
                    concept: 'End-to-end analytics, Power BI dashboards, and executive pitching.',
                    rounds: [
                        { num: 'R1', name: 'General Aptitude', desc: 'Timed logic, statistics, and CS fundamentals.' },
                        { num: 'R2', name: 'Dashboard Building', desc: 'Build interactive Power BI insight dashboard.' },
                        { num: 'R3', name: 'Executive Pitch', desc: 'Present business recommendations to panel.' }
                    ]
                },
                {
                    name: 'The Query Detective',
                    type: 'Team Event',
                    concept: 'Crack fictional forensic cases through live SQL queries.',
                    rounds: [
                        { num: 'R1', name: 'SQL Aptitude', desc: 'Database logic & syntax qualification.' },
                        { num: 'R2', name: 'SQL Mystery', desc: 'Query database tables live to solve the crime.' }
                    ]
                }
            ]
        },
        {
            id: 'animation',
            name: 'Animation & Game Design',
            tag: 'Domain 05 · Animation & Game Design',
            tagline: 'Worlds built from imagination and interactive play',
            color: '#F7BD2B',
            rgb: '247, 189, 43',
            starTitle: 'Golden Animator',
            head: { name: 'Shravya Hegde', id: '24BCYB06', contact: '9663366888' },
            events: [
                {
                    name: 'Character Jam',
                    type: 'Team Event',
                    concept: 'Beginner-friendly character creation and interactive Scratch logic.',
                    rounds: [
                        { num: 'R1', name: 'Sketch & Pitch', desc: 'Sketch original character from sealed prompt & pitch core mechanic.' },
                        { num: 'R2', name: 'Bring It To Life', desc: 'Program movement, animations, and game reactions in Scratch.' }
                    ]
                }
            ]
        },
        {
            id: 'quantum',
            name: 'Quantum Computing',
            tag: 'Domain 06 · Quantum Computing',
            tagline: 'Superposition, entanglement, and logic beyond classical limits',
            color: '#FF5757',
            rgb: '255, 87, 87',
            starTitle: 'Amber Entangler',
            head: { name: 'Aadhithya Rajesh', id: '24DTSA02', contact: '9995882264' },
            events: [
                {
                    name: 'Qubit Quest',
                    type: 'Team Event',
                    concept: 'Intuitive quantum logic, analogy charades, and cipher hunting.',
                    rounds: [
                        { num: 'R1', name: 'Pair-adox', desc: 'Match quantum terms to everyday real-world analogies.' },
                        { num: 'R2', name: 'Quantum Charades', desc: 'Act & guess quantum concepts without forbidden words.' },
                        { num: 'R3', name: 'Quantum Cipher Hunt', desc: 'Decode sequential logic clues across campus.' }
                    ]
                }
            ]
        },
        {
            id: 'blockchain',
            name: 'Blockchain',
            tag: 'Domain 07 · Blockchain',
            tagline: 'Trust engineered through immutable decentralized consensus',
            color: '#E77BC7',
            rgb: '231, 123, 199',
            starTitle: 'Purple Consensus',
            head: { name: 'Devanand M S', id: '24BCYB11', contact: '9747805128' },
            events: [
                {
                    name: 'Consensus Clash',
                    type: 'Team Event',
                    concept: 'Non-coding logic, tokenomics bidding, and protocol design.',
                    rounds: [
                        { num: 'R1', name: 'Blockchain Quest', desc: 'Aptitude, tokenomics logic & crypto trivia.' },
                        { num: 'R2', name: 'Tokenomics Auction', desc: 'Bid virtual funds on realistic Web3 project scenarios.' },
                        { num: 'R3', name: 'The Consensus Defense', desc: 'Pitch and defend your customized consensus protocol.' }
                    ]
                }
            ]
        },
        {
            id: 'spectrum-ceo',
            name: 'Spectrum CEO',
            tag: 'Domain 08 · Non-Tech [ITM]',
            tagline: 'Leadership, rapid wit, and executive composure under pressure',
            color: '#D4AF37',
            rgb: '212, 175, 55',
            starTitle: 'Spectrum CEO',
            head: { name: 'Emlin Joshy', id: '24DTSA25', contact: '7760297422' },
            events: [
                {
                    name: 'Spectrum CEO (Flagship)',
                    type: 'Solo Event',
                    concept: 'Flagship championship with 2 top nominees from every domain.',
                    rounds: [
                        { num: 'R1', name: 'The Refraction', desc: 'Impromptu debate defending randomized stance.' },
                        { num: 'R2', name: 'White Lie', desc: 'Pitch absurd product with straight executive face.' },
                        { num: 'R3', name: 'Under the Lens', desc: 'High-pressure 1-on-1 stress interview.' }
                    ]
                }
            ]
        }
    ];

    /* -----------------------------------------------------------------------
       2. THREE.JS 3D REFRACTIVE CRYSTAL PRISM (Scene 0)
       ----------------------------------------------------------------------- */
    const canvas = document.getElementById('prism-canvas');
    let pScene, pCamera, pRenderer, pCrystalGroup, pMainCrystal, pWireframe, pCore, pBeams, pRings;
    let mouseTargetX = 0, mouseTargetY = 0;
    let curRotX = 0, curRotY = 0;

    function initPrism3D() {
        if (!canvas) return;

        pScene = new THREE.Scene();
        pCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        pCamera.position.set(0, 0, 7.2);

        pRenderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        pRenderer.setSize(window.innerWidth, window.innerHeight);
        pRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        pCrystalGroup = new THREE.Group();
        pScene.add(pCrystalGroup);

        // 1. Faceted Glass Crystal with clean transparency
        const crystalGeo = new THREE.IcosahedronGeometry(1.5, 0);
        const crystalMat = new THREE.MeshPhongMaterial({
            color: 0x93c5fd,
            emissive: 0x1e3a8a,
            emissiveIntensity: 0.4,
            specular: 0xffffff,
            shininess: 100,
            flatShading: true,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide
        });
        pMainCrystal = new THREE.Mesh(crystalGeo, crystalMat);
        pCrystalGroup.add(pMainCrystal);

        // 2. Subtle Glowing Inner Core
        const coreGeo = new THREE.IcosahedronGeometry(0.8, 0);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0x0284c7,
            wireframe: false,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending
        });
        pCore = new THREE.Mesh(coreGeo, coreMat);
        pCrystalGroup.add(pCore);

        // 3. Facet Wireframe Edge Glow
        const wireGeo = new THREE.IcosahedronGeometry(1.62, 0);
        const wireMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            wireframe: true,
            transparent: true,
            opacity: 0.35
        });
        pWireframe = new THREE.Mesh(wireGeo, wireMat);
        pCrystalGroup.add(pWireframe);

        // 4. Volumetric 8 Spectrum Light Beams
        pBeams = new THREE.Group();
        DOMAIN_DATA.forEach((d, idx) => {
            const angle = (idx / DOMAIN_DATA.length) * Math.PI * 2;
            const beamLen = 14.0;

            const beamGeo = new THREE.ConeGeometry(0.55, beamLen, 16, 1, true);
            beamGeo.translate(0, beamLen / 2, 0);
            beamGeo.rotateX(Math.PI / 2);

            const beamMat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(d.color),
                transparent: true,
                opacity: 0.35,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const mesh = new THREE.Mesh(beamGeo, beamMat);
            mesh.rotation.y = angle;
            mesh.rotation.x = 0.25 * Math.sin(angle);
            pBeams.add(mesh);
        });
        pCrystalGroup.add(pBeams);

        // 5. Orbiting Neon Rings
        pRings = new THREE.Group();
        const ringColors = [0xFF3131, 0x38B6FF, 0xF7BD2B, 0xE77BC7];
        ringColors.forEach((col, i) => {
            const ringGeo = new THREE.TorusGeometry(2.4 + i * 0.4, 0.018, 16, 100);
            const ringMat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(col),
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending
            });
            const ringMesh = new THREE.Mesh(ringGeo, ringMat);
            ringMesh.rotation.x = Math.PI / (2.2 + i * 0.4);
            ringMesh.rotation.y = (i * Math.PI) / 4;
            pRings.add(ringMesh);
        });
        pCrystalGroup.add(pRings);

        // Lights
        pScene.add(new THREE.AmbientLight(0x0f172a, 8));
        const dirLight = new THREE.DirectionalLight(0xffffff, 3.5);
        dirLight.position.set(6, 8, 6);
        pScene.add(dirLight);

        const pointLight = new THREE.PointLight(0x38bdf8, 6, 20);
        pointLight.position.set(-4, -3, 3);
        pScene.add(pointLight);

        // Cosmic Dust Particles
        const dustCount = 300;
        const dustPos = new Float32Array(dustCount * 3);
        for (let i = 0; i < dustCount * 3; i++) {
            dustPos[i] = (Math.random() - 0.5) * 22;
        }
        const dustGeo = new THREE.BufferGeometry();
        dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
        const dustMat = new THREE.PointsMaterial({
            color: 0x93c5fd,
            size: 0.04,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });
        pScene.add(new THREE.Points(dustGeo, dustMat));

        // Interactive mouse parallax
        window.addEventListener('mousemove', (e) => {
            if (window.scrollY < window.innerHeight * 1.2) {
                const nx = (e.clientX / window.innerWidth) * 2 - 1;
                const ny = -(e.clientY / window.innerHeight) * 2 + 1;
                mouseTargetY = nx * 1.2;
                mouseTargetX = -ny * 0.8;
            }
        });

        // Click on Canvas trigger pulse
        canvas.addEventListener('click', () => {
            playTapChime();
            gsap.to(pCrystalGroup.scale, {
                x: 1.25, y: 1.25, z: 1.25,
                duration: 0.18,
                yoyo: true,
                repeat: 1,
                ease: 'back.out(2)'
            });
        });

        // Render loop
        let time = 0;
        function renderLoop() {
            requestAnimationFrame(renderLoop);
            time += 0.015;

            curRotX += (mouseTargetX - curRotX) * 0.07;
            curRotY += (mouseTargetY - curRotY) * 0.07;

            if (pMainCrystal) {
                pMainCrystal.rotation.y = time * 0.4 + curRotY;
                pMainCrystal.rotation.x = Math.sin(time * 0.5) * 0.2 + curRotX;
                pMainCrystal.rotation.z = Math.cos(time * 0.3) * 0.1;
            }
            if (pWireframe) {
                pWireframe.rotation.copy(pMainCrystal.rotation);
            }
            if (pCore) {
                pCore.rotation.y = -time * 0.7;
                pCore.rotation.x = time * 0.4;
                const pulse = 0.9 + Math.sin(time * 3.0) * 0.12;
                pCore.scale.set(pulse, pulse, pulse);
            }
            if (pBeams) {
                pBeams.rotation.y = time * 0.22 + curRotY * 0.5;
                pBeams.rotation.z = Math.sin(time * 0.3) * 0.12;
            }
            if (pRings) {
                pRings.rotation.y = time * 0.25;
                pRings.rotation.x = Math.sin(time * 0.2) * 0.2 + curRotX * 0.3;
            }

            pCrystalGroup.position.y = Math.sin(time * 0.8) * 0.1;

            pRenderer.render(pScene, pCamera);
        }
        renderLoop();

        window.addEventListener('resize', () => {
            if (!pCamera || !pRenderer) return;
            pCamera.aspect = window.innerWidth / window.innerHeight;
            pCamera.updateProjectionMatrix();
            pRenderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    /* -----------------------------------------------------------------------
       6. CUSTOM CURSOR
       ----------------------------------------------------------------------- */
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
        if (cursorDot) {
            cursorDot.style.left = `${mx}px`;
            cursorDot.style.top = `${my}px`;
            cursorDot.style.opacity = '1';
        }
        if (cursorRing) {
            cursorRing.style.opacity = '1';
        }
    });

    function loopCursor() {
        rx += (mx - rx) * 0.2;
        ry += (my - ry) * 0.2;
        if (cursorRing) {
            cursorRing.style.left = `${rx}px`;
            cursorRing.style.top = `${ry}px`;
        }
        requestAnimationFrame(loopCursor);
    }
    loopCursor();

    function bindInteractiveElements() {
        document.querySelectorAll('a, button, .d-tab, .sched-tab, .sched-card, .award-card, canvas').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    /* -----------------------------------------------------------------------
       7. 3D CARD TILT & MAGNETIC SPOTLIGHT PHYSICS
       ----------------------------------------------------------------------- */
    function initCardTilt() {
        const tiltCards = document.querySelectorAll('.invite-card, .domain-showcase-card, .close-card, .award-card');

        tiltCards.forEach(card => {
            // Add spotlight element inside card if not present
            if (!card.querySelector('.card-spotlight')) {
                const sp = document.createElement('div');
                sp.className = 'card-spotlight';
                card.appendChild(sp);
            }

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -5;
                const rotateY = ((x - centerX) / centerX) * 5;

                card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
                card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
            });
        });
    }

    /* -----------------------------------------------------------------------
       7. AUDIO SYNTHESIZERS & ATMOSPHERE CONTROLLER
       ----------------------------------------------------------------------- */
    let audioCtx = null;
    let audioEnabled = true;

    function initAudio() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });

    function toggleAudio() {
        audioEnabled = !audioEnabled;
        const pill = document.getElementById('audio-control-pill');
        const icon = document.getElementById('ac-icon');
        const label = document.querySelector('.ac-label');
        if (pill) {
            pill.classList.toggle('muted', !audioEnabled);
            if (icon) icon.textContent = audioEnabled ? '🔊' : '🔇';
            if (label) label.textContent = audioEnabled ? 'Audio On' : 'Muted';
        }
    }

    function playTapChime() {
        if (!audioEnabled) return;
        try {
            initAudio();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, now); // D5
            osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.15); // A5

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.4);
        } catch (e) {}
    }

    function playInaugurationChime() {
        if (!audioEnabled) return;
        try {
            initAudio();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const now = audioCtx.currentTime;

            // Grand inaugural harmony chord
            [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                const delay = i * 0.07;

                osc.type = i % 2 === 0 ? 'sine' : 'triangle';
                osc.frequency.setValueAtTime(freq, now + delay);

                gain.gain.setValueAtTime(0.001, now + delay);
                gain.gain.linearRampToValueAtTime(0.2 / (i * 0.3 + 1), now + delay + 0.08);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 4.5);

                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start(now + delay);
                osc.stop(now + delay + 5.0);
            });
        } catch (e) {}
    }

    const confettiCanvas = document.getElementById('confetti-canvas');
    let confettiCtx = null;
    let particles = [];
    let confettiId = null;

    if (confettiCanvas) {
        confettiCtx = confettiCanvas.getContext('2d');
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
        window.addEventListener('resize', () => {
            confettiCanvas.width = window.innerWidth;
            confettiCanvas.height = window.innerHeight;
        });
    }

    function fireConfetti() {
        if (!confettiCtx) return;
        particles = [];
        const count = 400;

        for (let i = 0; i < count; i++) {
            const domain = DOMAIN_DATA[i % DOMAIN_DATA.length];
            const angle = Math.random() * Math.PI * 2;
            const velocity = 8 + Math.random() * 24;

            particles.push({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2 + 80,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 14,
                size: 5 + Math.random() * 9,
                color: domain.color,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 15,
                opacity: 1,
                decay: 0.003 + Math.random() * 0.005
            });
        }

        if (confettiId) cancelAnimationFrame(confettiId);

        function step() {
            confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            let alive = 0;

            particles.forEach(p => {
                if (p.opacity <= 0) return;
                alive++;

                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.38; // gravity
                p.vx *= 0.98;
                p.rotation += p.rotationSpeed;
                p.opacity -= p.decay;

                confettiCtx.save();
                confettiCtx.translate(p.x, p.y);
                confettiCtx.rotate((p.rotation * Math.PI) / 180);
                confettiCtx.fillStyle = p.color;
                confettiCtx.globalAlpha = Math.max(0, p.opacity);
                confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
                confettiCtx.restore();
            });

            if (alive > 0) confettiId = requestAnimationFrame(step);
            else confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }
        step();
    }

    /* -----------------------------------------------------------------------
       7. INITIAL INTRO: CRYSTAL CRACK & SHATTER PORTAL CONTROLLER
       ----------------------------------------------------------------------- */
    function initIntroPortal() {
        const portal = document.getElementById('intro-shatter-curtain');
        const crystalBtn = document.getElementById('shatter-crystal-btn');
        let isCracking = false;

        if (!portal || !crystalBtn) return;

        function playGlassCrackSound(freq, duration) {
            try {
                initAudio();
                if (audioCtx.state === 'suspended') audioCtx.resume();
                const now = audioCtx.currentTime;

                // High glass snap
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, now);
                osc.frequency.exponentialRampToValueAtTime(freq * 0.3, now + duration);

                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

                // Noise snap
                const bufferSize = audioCtx.sampleRate * 0.05;
                const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const output = noiseBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
                const noise = audioCtx.createBufferSource();
                noise.buffer = noiseBuffer;
                const noiseGain = audioCtx.createGain();
                noiseGain.gain.setValueAtTime(0.08, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

                osc.connect(gain);
                gain.connect(audioCtx.destination);
                noise.connect(noiseGain);
                noiseGain.connect(audioCtx.destination);

                osc.start(now);
                osc.stop(now + duration);
                noise.start(now);
                noise.stop(now + 0.05);
            } catch (e) {}
        }

        function playShatterExplosion() {
            try {
                initAudio();
                if (audioCtx.state === 'suspended') audioCtx.resume();
                const now = audioCtx.currentTime;

                // Sub-bass sweep
                const sub = audioCtx.createOscillator();
                const subGain = audioCtx.createGain();
                sub.type = 'sine';
                sub.frequency.setValueAtTime(140, now);
                sub.frequency.exponentialRampToValueAtTime(28, now + 1.2);
                subGain.gain.setValueAtTime(0.3, now);
                subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
                sub.connect(subGain);
                subGain.connect(audioCtx.destination);
                sub.start(now);
                sub.stop(now + 2.0);

                // 7 Spectrum harmonic chord burst
                [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98, 2093.0].forEach((f, i) => {
                    const osc = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(f, now + i * 0.04);
                    g.gain.setValueAtTime(0.06, now + i * 0.04);
                    g.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
                    osc.connect(g);
                    g.connect(audioCtx.destination);
                    osc.start(now + i * 0.04);
                    osc.stop(now + 3.0);
                });
            } catch (e) {}
        }

        crystalBtn.addEventListener('click', () => {
            if (isCracking) return;
            isCracking = true;

            crystalBtn.classList.add('cracking');
            document.querySelector('.shatter-prompt').style.opacity = '0';

            // Sequential crack sounds over 3.5 seconds
            playGlassCrackSound(1200, 0.2);

            setTimeout(() => playGlassCrackSound(950, 0.25), 800);
            setTimeout(() => playGlassCrackSound(1450, 0.3), 1600);
            setTimeout(() => playGlassCrackSound(750, 0.35), 2400);
            setTimeout(() => playGlassCrackSound(1800, 0.4), 2900);

            // Final shatter burst at 3.5s
            setTimeout(() => {
                playShatterExplosion();
                portal.classList.add('shattered');

                // Animate Hero Three.js crystal entrance
                if (pCrystalGroup) {
                    pCrystalGroup.scale.set(0.1, 0.1, 0.1);
                    gsap.to(pCrystalGroup.scale, {
                        x: 1, y: 1, z: 1,
                        duration: 1.5,
                        ease: 'elastic.out(1, 0.5)'
                    });
                }
            }, 3500);
        });
    }

    /* -----------------------------------------------------------------------
       8. 3D HOLOGRAPHIC DOMAIN COVERFLOW & AMBIENT SPECTRUM
       ----------------------------------------------------------------------- */
    let currentCoverflowIdx = 0;

    function init3DCoverflow() {
        const coverflowCards = document.querySelectorAll('.coverflow-card');
        const ambientAura = document.getElementById('domain-ambient-aura');
        const prevBtn = document.getElementById('cf-prev');
        const nextBtn = document.getElementById('cf-next');
        const container = document.getElementById('coverflow-container');

        if (!coverflowCards || coverflowCards.length === 0) return;

        const total = coverflowCards.length;

        function updateCoverflow(idx, playSound = false) {
            currentCoverflowIdx = Math.max(0, Math.min(total - 1, idx));

            // 1. Update 3D card transforms
            coverflowCards.forEach((card, i) => {
                const offset = i - currentCoverflowIdx;
                const dColor = card.style.getPropertyValue('--d-color') || '#38bdf8';
                const dRgb = card.style.getPropertyValue('--d-rgb') || '56, 182, 255';

                if (offset === 0) {
                    // Center Active Hero Card
                    card.style.transform = 'translateX(0px) translateZ(90px) rotateY(0deg) scale(1)';
                    card.style.opacity = '1';
                    card.style.filter = 'blur(0px)';
                    card.style.zIndex = '25';
                    card.style.pointerEvents = 'auto';
                    card.classList.add('active-card');

                    // Update Dynamic Ambient Background Aura
                    if (ambientAura) {
                        ambientAura.style.background = `radial-gradient(circle at 50% 55%, rgba(${dRgb}, 0.28) 0%, rgba(2, 3, 8, 0.95) 70%)`;
                    }
                } else if (offset > 0) {
                    // Right Angled Cards
                    const dist = offset;
                    const xPos = dist * 190 + 310;
                    const zPos = -110 * dist;
                    const rotY = -34;
                    const scale = Math.max(0.68, 1 - 0.11 * dist);
                    const opacity = Math.max(0.12, 0.85 - 0.28 * dist);
                    const blur = dist * 1.5;

                    card.style.transform = `translateX(${xPos}px) translateZ(${zPos}px) rotateY(${rotY}deg) scale(${scale})`;
                    card.style.opacity = `${opacity}`;
                    card.style.filter = `blur(${blur}px)`;
                    card.style.zIndex = `${20 - dist}`;
                    card.style.pointerEvents = 'auto';
                    card.classList.remove('active-card');
                } else {
                    // Left Angled Cards
                    const dist = Math.abs(offset);
                    const xPos = -(dist * 190 + 310);
                    const zPos = -110 * dist;
                    const rotY = 34;
                    const scale = Math.max(0.68, 1 - 0.11 * dist);
                    const opacity = Math.max(0.12, 0.85 - 0.28 * dist);
                    const blur = dist * 1.5;

                    card.style.transform = `translateX(${xPos}px) translateZ(${zPos}px) rotateY(${rotY}deg) scale(${scale})`;
                    card.style.opacity = `${opacity}`;
                    card.style.filter = `blur(${blur}px)`;
                    card.style.zIndex = `${20 - dist}`;
                    card.style.pointerEvents = 'auto';
                    card.classList.remove('active-card');
                }
            });

            // 2. Update Domain Counter Pill
            const counterEl = document.getElementById('dc-current');
            if (counterEl) {
                counterEl.textContent = String(currentCoverflowIdx + 1).padStart(2, '0');
            }

            // 3. Audio Feedback
            if (playSound) {
                playTapChime();
            }
        }

        // Initial Render
        updateCoverflow(0, false);

        // Click on Cards to bring to center
        coverflowCards.forEach((card, i) => {
            card.addEventListener('click', () => {
                if (currentCoverflowIdx !== i) {
                    updateCoverflow(i, true);
                }
            });
        });

        // Prev & Next Controls
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (currentCoverflowIdx > 0) {
                    updateCoverflow(currentCoverflowIdx - 1, true);
                } else {
                    updateCoverflow(total - 1, true);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (currentCoverflowIdx < total - 1) {
                    updateCoverflow(currentCoverflowIdx + 1, true);
                } else {
                    updateCoverflow(0, true);
                }
            });
        }

        // Keyboard Navigation (Left / Right Arrows)
        window.addEventListener('keydown', (e) => {
            const domainSec = document.getElementById('s-domains');
            if (!domainSec) return;
            const rect = domainSec.getBoundingClientRect();
            if (rect.top <= window.innerHeight && rect.bottom >= 0) {
                if (e.key === 'ArrowLeft') {
                    if (currentCoverflowIdx > 0) updateCoverflow(currentCoverflowIdx - 1, true);
                } else if (e.key === 'ArrowRight') {
                    if (currentCoverflowIdx < total - 1) updateCoverflow(currentCoverflowIdx + 1, true);
                }
            }
        });

        // Touch Swipe Support
        let touchStartX = 0;
        let touchEndX = 0;

        if (container) {
            container.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            container.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const diff = touchStartX - touchEndX;
                if (Math.abs(diff) > 50) {
                    if (diff > 0 && currentCoverflowIdx < total - 1) {
                        updateCoverflow(currentCoverflowIdx + 1, true);
                    } else if (diff < 0 && currentCoverflowIdx > 0) {
                        updateCoverflow(currentCoverflowIdx - 1, true);
                    }
                }
            }, { passive: true });
        }

        return updateCoverflow;
    }

    /* -----------------------------------------------------------------------
       9. SCROLL ANIMATIONS (GSAP ScrollTrigger)
       ----------------------------------------------------------------------- */
    function initScrollAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);

        // 1. Scene 1: Formal Invitation Card Unfold
        const inviteCard = document.querySelector('.invite-card');
        if (inviteCard) {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: '#s-invite',
                    start: 'top 75%',
                    toggleActions: 'play none none none'
                }
            });

            tl.fromTo(inviteCard, 
                { opacity: 0, y: 90, rotateX: 12, scale: 0.94 },
                { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 1.2, ease: 'power3.out' }
            )
            .fromTo('.invite-header > *', 
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, stagger: 0.12, duration: 0.8, ease: 'power2.out' },
                '-=0.8'
            )
            .fromTo('.gold-divider', 
                { scaleX: 0 },
                { scaleX: 1, duration: 1.0, ease: 'expo.out', transformOrigin: 'center center' },
                '-=0.6'
            )
            .fromTo('.inv-lead', 
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.7 },
                '-=0.6'
            )
            .fromTo('.inv-name', 
                { opacity: 0, scale: 0.92, filter: 'blur(12px)' },
                { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.1, ease: 'power2.out' },
                '-=0.5'
            )
            .fromTo('.inv-role', 
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.6 },
                '-=0.6'
            )
            .fromTo('.inv-text-block', 
                { opacity: 0, y: 25 },
                { opacity: 1, y: 0, duration: 0.8 },
                '-=0.5'
            )
            .fromTo('.ceremony-banner', 
                { opacity: 0, scale: 0.95, y: 20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'back.out(1.5)' },
                '-=0.5'
            )
            .fromTo('.coordinator-sig', 
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, stagger: 0.2, duration: 0.8 },
                '-=0.5'
            );
        }

        // 2. Scene 2: 3D Coverflow ScrollTrigger Pin
        const domainSection = document.getElementById('s-domains');
        const coverflowCards = document.querySelectorAll('.coverflow-card');

        if (domainSection && coverflowCards.length > 0) {
            ScrollTrigger.create({
                trigger: '#s-domains',
                start: 'top top',
                end: () => '+=' + (coverflowCards.length * 450),
                pin: true,
                scrub: 0.8,
                onUpdate: (self) => {
                    const progress = self.progress;
                    const targetIdx = Math.min(coverflowCards.length - 1, Math.floor(progress * coverflowCards.length));
                    if (targetIdx !== currentCoverflowIdx) {
                        const updateFn = window._updateCoverflow;
                        if (updateFn) updateFn(targetIdx, false);
                    }
                }
            });
        }

        // 3. Scene 3: Awards Cards Stagger
        const awardCards = document.querySelectorAll('.award-card');
        if (awardCards.length > 0) {
            gsap.fromTo(awardCards,
                { opacity: 0, y: 40, scale: 0.95 },
                {
                    opacity: 1, y: 0, scale: 1, stagger: 0.2, duration: 0.8, ease: 'power2.out',
                    scrollTrigger: {
                        trigger: '#s-awards',
                        start: 'top 75%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // 4. Scene 4: Inauguration Close Card
        const closeCard = document.querySelector('.close-card');
        if (closeCard) {
            gsap.fromTo(closeCard,
                { opacity: 0, y: 60, scale: 0.95 },
                {
                    opacity: 1, y: 0, scale: 1, duration: 1.0, ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '#s-close',
                        start: 'top 75%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }
    }

    /* -----------------------------------------------------------------------
       10. INITIALIZATION & EVENTS
       ----------------------------------------------------------------------- */
    function startApp() {
        initIntroPortal();
        initPrism3D();
        const updateFn = init3DCoverflow();
        window._updateCoverflow = updateFn;
        initCardTilt();
        initScrollAnimations();
        bindInteractiveElements();

        // Audio Toggle
        const audioPill = document.getElementById('audio-control-pill');
        if (audioPill) {
            audioPill.addEventListener('click', toggleAudio);
        }

        // VIP Digital Patron Pass Modal
        const vipOverlay = document.getElementById('vip-modal-overlay');
        const vipCloseBtn = document.getElementById('vip-close-btn');

        if (vipCloseBtn && vipOverlay) {
            vipCloseBtn.addEventListener('click', () => {
                vipOverlay.classList.remove('active');
            });
            vipOverlay.addEventListener('click', (e) => {
                if (e.target === vipOverlay) vipOverlay.classList.remove('active');
            });
        }

        // Confirm button click
        const btnInaugurate = document.getElementById('btn-inaugurate');
        if (btnInaugurate) {
            btnInaugurate.addEventListener('click', () => {
                if (btnInaugurate.classList.contains('confirmed')) {
                    if (vipOverlay) vipOverlay.classList.add('active');
                    return;
                }
                btnInaugurate.classList.add('confirmed');
                btnInaugurate.querySelector('.btn-text').textContent = 'Inaugural Attendance Confirmed ✓';
                playInaugurationChime();
                fireConfetti();

                // Reveal VIP Digital Patron Pass after short celebratory burst
                setTimeout(() => {
                    if (vipOverlay) vipOverlay.classList.add('active');
                }, 850);
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startApp);
    } else {
        startApp();
    }

})();
