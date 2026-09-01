/**
 * SYNCHROTECH 2K26 — Master Data Repository
 * Theme: "DECODE THE SPECTRUM"
 * Kristu Jayanti (Deemed to be University), Bengaluru
 * School of Computational and Physical Sciences
 * Department of Computational Studies
 * Date: 7 September 2026 - 11 September 2026
 */

export const FEST_INFO = {
  name: "SYNCHROTECH 2K26",
  tagline: "DECODE THE SPECTRUM",
  subtitle: "Flagship Intra-University Fest",
  institution: "Kristu Jayanti (Deemed to be University)",
  school: "School of Computational and Physical Sciences",
  department: "Department of Computational Studies",
  dates: "7 – 11 September 2026",
  startDate: "2026-09-07T09:00:00+05:30",
  endDate: "2026-09-11T17:00:00+05:30",
  overallCoordinators: [
    { name: "Dhruv Soin", id: "24DTSA22", phone: "9560855503", role: "Student Coordinator" },
    { name: "Emy Elizabeth Oommen", id: "24BCYA47", phone: "9497052528", role: "Student Coordinator" }
  ],
  awards: [
    {
      title: "Stars of Synchrotech",
      count: 7,
      description: "Conferred upon the individual who secures the highest cumulative points across all domain-specific events in their domain."
    },
    {
      title: "Overall Champions",
      count: 1,
      description: "Awarded to the highest-performing domain based on victories (1st, 2nd, 3rd), participation volume, finalists, and Spectrum CEO performance."
    }
  ]
};

export const DOMAINS = [
  {
    id: "aiml",
    name: "AI/ML",
    fullName: "Artificial Intelligence & Machine Learning",
    spectralOrder: 1,
    colorName: "Red",
    color: "#FF2A55",
    glowColor: "rgba(255, 42, 85, 0.7)",
    gradient: "linear-gradient(135deg, #FF2A55 0%, #990022 100%)",
    frequencyHz: 392.00,
    icon: "fa-solid fa-brain",
    head: { name: "Justin Johnson", id: "24AIML27", phone: "7696811958" },
    tagline: "Neural Frontiers & Autonomous Intelligence",
    lore: "Venture into dynamic neural architectures, generative models, and algorithmic problem-solving where intelligent systems perceive, adapt, and innovate.",
    events: [
      {
        id: "zero-verdict",
        name: "Zero Verdict",
        type: "Solo Event",
        tagline: "AI Strategy, Clues & High-Stakes Auction",
        rounds: [
          { name: "Round 1: The Forbidden Frame", desc: "Generate an image matching a target reference without using the single forbidden keyword in your prompt." },
          { name: "Round 2: AI Case Files", desc: "Act as an investigator examining AI-generated statements, anomalies, and synthetic evidence to crack a fictional digital case." },
          { name: "Round 3 (Finale): Bid Wars", desc: "Start with 100 AI Coins in a live tactical auction. Bid on clues, hints, and computational perks to construct the winning case." }
        ],
        schedule: [
          { day: "Day 2 (Sept 8)", time: "4:30 PM – 6:00 PM", venue: "M4 LAB" },
          { day: "Day 4 (Sept 10)", time: "4:30 PM – 6:00 PM", venue: "M201" },
          { day: "Day 5 (Sept 11)", time: "11:00 AM – 1:00 PM", venue: "M4 LAB (Grand Finale)" }
        ]
      },
      {
        id: "overdrive",
        name: "Overdrive",
        type: "Duo Event",
        tagline: "High-Speed Prompt Engineering & Mind Clash",
        rounds: [
          { name: "Round 1: Prompt Puzzle", desc: "Solve an AI-themed technical crossword and utilize the unlocked key terms to engineer a high-precision prompt." },
          { name: "Round 2: Mind Clash", desc: "Head-to-head showdown where opposing duos compete on identical prompt challenges. Most creative and accurate output advances." },
          { name: "Round 3 (Finale): AI Roulette", desc: "Rapid-fire randomized prompt, logic, and creative challenges with surprise mid-round penalty wheel modifiers." }
        ],
        schedule: [
          { day: "Day 1 (Sept 7)", time: "4:30 PM – 6:00 PM", venue: "M201 / M5 LAB" },
          { day: "Day 3 (Sept 9)", time: "4:30 PM – 6:00 PM", venue: "M201" }
        ]
      }
    ]
  },
  {
    id: "quantum",
    name: "Quantum Computing",
    fullName: "Quantum Computing",
    spectralOrder: 2,
    colorName: "Orange",
    color: "#FF6B00",
    glowColor: "rgba(255, 107, 0, 0.7)",
    gradient: "linear-gradient(135deg, #FF6B00 0%, #993300 100%)",
    frequencyHz: 440.00,
    icon: "fa-solid fa-atom",
    head: { name: "Aadhithya Rajesh", id: "24DTSA02", phone: "9995882264" },
    tagline: "Superposition, Entanglement & Infinite Realities",
    lore: "Step into qubits, quantum states, and non-deterministic logic. No prior physics or mathematics required — pure intuition, team synergy, and problem-solving.",
    events: [
      {
        id: "qubit-quest",
        name: "Qubit Quest",
        type: "Team Event",
        tagline: "Analogy Matching, Logic Puzzles & Campus Cipher Hunt",
        rounds: [
          { name: "Round 1: Pair-adox", desc: "Race against the clock to connect complex quantum mechanics concepts with intuitive everyday real-world analogies." },
          { name: "Round 2: Quantum Charades", desc: "Teammates act and describe quantum phenomena without using prohibited forbidden words." },
          { name: "Round 3 (Finale): The Quantum Cipher Hunt", desc: "A campus-wide chain of cryptic quantum logic riddles. Solve progressive clues in sequence to unlock the quantum escape key." }
        ],
        schedule: [
          { day: "Day 2 (Sept 8)", time: "4:30 PM – 6:00 PM", venue: "M5 LAB / M204" },
          { day: "Day 4 (Sept 10)", time: "4:30 PM – 6:00 PM", venue: "M202" }
        ]
      }
    ]
  },
  {
    id: "animation",
    name: "Animation & Game Design",
    fullName: "Animation & Game Design",
    spectralOrder: 3,
    colorName: "Yellow",
    color: "#FFD700",
    glowColor: "rgba(255, 215, 0, 0.7)",
    gradient: "linear-gradient(135deg, #FFD700 0%, #B29400 100%)",
    frequencyHz: 493.88,
    icon: "fa-solid fa-gamepad",
    head: { name: "Shravya Hegde", id: "24BCYB06", phone: "9663366888" },
    tagline: "Creative Storytelling, Mechanics & Prototyping",
    lore: "Where visual imagination meets interactive digital logic. Designed beginner-friendly for first- and second-year students to bring characters and game prototypes to life.",
    events: [
      {
        id: "character-jam",
        name: "Character Jam",
        type: "Team Event",
        tagline: "Character Concept Pitch & Scratch Game Prototype",
        rounds: [
          { name: "Round 1: Sketch & Pitch", desc: "Draw a character design from a sealed theme prompt and pitch its unique core movement mechanic to the jury." },
          { name: "Round 2 (Finale): Bring It To Life", desc: "Build an interactive game prototype in Scratch, programming your custom character to move, react, and respond on screen." }
        ],
        schedule: [
          { day: "Day 2 (Sept 8)", time: "4:30 PM – 6:00 PM", venue: "M206" },
          { day: "Day 4 (Sept 10)", time: "4:30 PM – 6:00 PM", venue: "M4 LAB" }
        ]
      }
    ]
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    fullName: "Cybersecurity",
    spectralOrder: 4,
    colorName: "Green",
    color: "#00FF66",
    glowColor: "rgba(0, 255, 102, 0.7)",
    gradient: "linear-gradient(135deg, #00FF66 0%, #006622 100%)",
    frequencyHz: 523.25,
    icon: "fa-solid fa-shield-halved",
    head: { name: "Adith Joel", id: "24BCYA13", phone: "8884002302" },
    tagline: "Offensive Exploitation, Hardened Defense & Forensics",
    lore: "Test your defensive instincts and offensive tradecraft. Crack ciphers, hunt vulnerabilities, inspect binaries, and defend critical cyber infrastructure.",
    events: [
      {
        id: "ctf",
        name: "Capture The Flag (CTF)",
        type: "Team Event",
        tagline: "Mind Clash MCQ & Hands-on Exploitation Lab",
        rounds: [
          { name: "Round 1: Mind Clash", desc: "Fast-paced cybersecurity MCQ round evaluating fundamental concepts, common threats, and vulnerability principles." },
          { name: "Round 2 (Finale): CTF Challenge", desc: "Hands-on virtual lab environment. Uncover web vulnerabilities, inspect binaries, decrypt hashes, and retrieve hidden flags." }
        ],
        schedule: [
          { day: "Day 1 (Sept 7)", time: "4:30 PM – 6:00 PM", venue: "M204 / M205" },
          { day: "Day 3 (Sept 9)", time: "4:30 PM – 6:00 PM", venue: "M4 LAB" }
        ]
      },
      {
        id: "threatx",
        name: "ThreatX",
        type: "Team Event",
        tagline: "Cyber Quiz, Security Sense & Cyber Court Debate",
        rounds: [
          { name: "Round 1: Cyber Quiz", desc: "Assessing fundamentals of digital threats, social engineering vectors, and defense mechanisms." },
          { name: "Round 2: Security Sense", desc: "Match tactical countermeasure cards to real-world breach and ransomware attack scenarios under time pressure." },
          { name: "Round 3 (Finale): Cyber Court", desc: "High-stakes debate defending or prosecuting parties involved in landmark global cyber incidents before a judicial jury." }
        ],
        schedule: [
          { day: "Day 2 (Sept 8)", time: "4:30 PM – 6:00 PM", venue: "M303 / M201" },
          { day: "Day 5 (Sept 11)", time: "9:00 AM – 3:00 PM", venue: "M203 (Grand Finale)" }
        ]
      }
    ]
  },
  {
    id: "cloud",
    name: "Cloud Computing",
    fullName: "Cloud Computing",
    spectralOrder: 5,
    colorName: "Blue",
    color: "#00D2FF",
    glowColor: "rgba(0, 210, 255, 0.7)",
    gradient: "linear-gradient(135deg, #00D2FF 0%, #004B87 100%)",
    frequencyHz: 587.33,
    icon: "fa-solid fa-cloud",
    head: { name: "Divya Patel", id: "24BCLA16", phone: "9620877001" },
    tagline: "Resilient Architectures, Scale & Efficiency",
    lore: "Build fault-tolerant cloud engines that power global platforms. Master containerization, serverless pipelines, high availability, and financial FinOps budgets.",
    events: [
      {
        id: "architecture-pitch",
        name: "Architecture Pitch",
        type: "Team Event",
        tagline: "Cloud Aptitude, Architect's Gambit & Pitch to Judges",
        rounds: [
          { name: "Round 1: Cloud Aptitude MCQ", desc: "Filter round covering core cloud computing abstractions, storage classes, and AWS infrastructure." },
          { name: "Round 2: Architect's Gambit", desc: "Draw random application domains, high traffic spikes, and strict budget constraints. Pivot your topology to surprise curveballs." },
          { name: "Round 3 (Finale): Build the Cloud", desc: "Architect an end-to-end resilient multi-tier topology within a virtual cloud credit budget and pitch live to cloud architects." }
        ],
        schedule: [
          { day: "Day 2 (Sept 8)", time: "4:30 PM – 6:00 PM", venue: "M203" },
          { day: "Day 4 (Sept 10)", time: "4:30 PM – 6:00 PM", venue: "M204" },
          { day: "Day 5 (Sept 11)", time: "9:00 AM – 3:00 PM", venue: "M202 (Grand Finale)" }
        ]
      },
      {
        id: "cloud-cipher",
        name: "Cloud Cipher",
        type: "Team Event",
        tagline: "Quiz, Cloud Charades & VPC Architecture Mastery",
        rounds: [
          { name: "Round 1: Cloud Quiz", desc: "Questions on AWS infrastructure, regions, latency optimizations, and IAM role hierarchies." },
          { name: "Round 2: Cloud Charades", desc: "Act out or describe complex cloud services for your team to identify under a ticking timer." },
          { name: "Round 3 (Finale): Cloud Mastery", desc: "Architect scalable VPC subnetting, load balancing, and serverless Lambda workflows for live enterprise use cases." }
        ],
        schedule: [
          { day: "Day 1 (Sept 7)", time: "4:30 PM – 6:00 PM", venue: "M206" },
          { day: "Day 3 (Sept 9)", time: "4:30 PM – 6:00 PM", venue: "M203" }
        ]
      }
    ]
  },
  {
    id: "datascience",
    name: "Data Science",
    fullName: "Data Science",
    spectralOrder: 6,
    colorName: "Indigo",
    color: "#6366F1",
    glowColor: "rgba(99, 102, 241, 0.7)",
    gradient: "linear-gradient(135deg, #6366F1 0%, #312E81 100%)",
    frequencyHz: 659.25,
    icon: "fa-solid fa-chart-line",
    head: { name: "Subham Malla", id: "24DTSA27", phone: "8837275099" },
    tagline: "Data Modeling, SQL Analytics & Visualization",
    lore: "Transform raw unstructured data into crystal-clear predictive decisions. Unravel hidden correlations, design compelling Power BI executive dashboards, and query relational databases.",
    events: [
      {
        id: "dataforge",
        name: "DataForge",
        type: "Team Event",
        tagline: "Aptitude, Power BI Dashboard & Executive Presentation",
        rounds: [
          { name: "Round 1: General Aptitude", desc: "Timed numerical aptitude, statistical reasoning, and data structure fundamentals." },
          { name: "Round 2: Dashboard Building", desc: "Transform messy raw multi-dimensional datasets into a pristine, interactive Power BI analytical dashboard." },
          { name: "Round 3 (Finale): Pitching", desc: "Deliver an executive business pitch summarizing actionable insights and strategic recommendations to industry evaluators." }
        ],
        schedule: [
          { day: "Day 2 (Sept 8)", time: "4:30 PM – 6:00 PM", venue: "M202" },
          { day: "Day 4 (Sept 10)", time: "4:30 PM – 6:00 PM", venue: "M203" },
          { day: "Day 5 (Sept 11)", time: "9:00 AM – 3:00 PM", venue: "M201 (Grand Finale)" }
        ]
      },
      {
        id: "query-detective",
        name: "The Query Detective",
        type: "Team Event",
        tagline: "Logic Aptitude & SQL Live Crime Investigation",
        rounds: [
          { name: "Round 1: General Aptitude", desc: "Testing logical deduction, algorithmic thinking, and relational algebra / SQL concepts." },
          { name: "Round 2 (Finale): SQL Mystery", desc: "Query a live relational database to inspect audit logs, joins, and transaction histories to expose the culprit behind a digital crime." }
        ],
        schedule: [
          { day: "Day 1 (Sept 7)", time: "4:30 PM – 6:00 PM", venue: "M203 / M4 LAB" }
        ]
      }
    ]
  },
  {
    id: "blockchain",
    name: "Blockchain",
    fullName: "Blockchain",
    spectralOrder: 7,
    colorName: "Violet",
    color: "#A855F7",
    glowColor: "rgba(168, 85, 247, 0.7)",
    gradient: "linear-gradient(135deg, #A855F7 0%, #581C87 100%)",
    frequencyHz: 739.99,
    icon: "fa-solid fa-cubes",
    head: { name: "Abhay Binoy", id: "24BCYA08", phone: "7907523410" },
    tagline: "Consensus Mechanisms, Smart Contracts & Cryptography",
    lore: "Pioneer decentralized ledgers. Analyze smart contracts, debug cryptographic vulnerabilities, and verify distributed chains.",
    events: [
      {
        id: "genesischain-quest",
        name: "GenesisChain Quest",
        type: "Team Event",
        tagline: "Live Kahoot Quiz, Code Audit & Proof-of-Hunt Scavenger",
        rounds: [
          { name: "Round 1: Genesis Block", desc: "Live high-tempo Kahoot quiz assessing consensus protocols, cryptography, and blockchain fundamentals." },
          { name: "Round 2: The Code Audit", desc: "Inspect smart contract source code for bugs, complete missing execution logic, and solve crypto case studies." },
          { name: "Round 3 (Finale): Proof of Hunt", desc: "A campus-wide QR verification race. Validate block hashes, distinguish fake blocks from authentic ones, and forge the longest valid chain." }
        ],
        schedule: [
          { day: "Day 1 (Sept 7)", time: "4:30 PM – 6:00 PM", venue: "M302 / M303 / M304 / M305" },
          { day: "Day 3 (Sept 9)", time: "4:30 PM – 6:00 PM", venue: "M204" }
        ]
      }
    ]
  },
  {
    id: "spectrum-ceo",
    name: "Spectrum CEO",
    fullName: "Spectrum CEO (Non-Tech Domain)",
    spectralOrder: 0,
    colorName: "White",
    color: "#FFFFFF",
    glowColor: "rgba(255, 255, 255, 0.9)",
    gradient: "linear-gradient(135deg, #FFFFFF 0%, #94A3B8 100%)",
    frequencyHz: 880.00,
    icon: "fa-solid fa-crown",
    head: { name: "Emlin Joshy", id: "24DTSA25", phone: "7760297422" },
    tagline: "Visionary Strategy, Negotiation & Executive Leadership",
    lore: "The pinnacle IT manager event that unites all domains. Each domain sends its top 2 representatives to battle for the ultimate crown of executive composure, strategic articulation, and crisis mastery.",
    events: [
      {
        id: "spectrum-ceo-event",
        name: "Spectrum CEO",
        type: "Solo Event (2 nominees per domain)",
        tagline: "The Refraction Debate, White Lie Pitch & Stress Interview",
        rounds: [
          { name: "Round 1: The Refraction — Debate", desc: "Draw a controversial technological disruption topic and defend your stance with persuasive logic and authoritative poise." },
          { name: "Round 2: White Lie — Humour Pitching", desc: "Pitch a wildly absurd idea to executive judges as a revolutionary business proposition while maintaining unflinching sincerity." },
          { name: "Round 3 (Finale): Under the Lens — Stress Interview", desc: "A rigorous one-on-one rapid-fire panel interview challenging personal ethics, crisis response, and executive leadership under intense scrutiny." }
        ],
        schedule: [
          { day: "Day 4 (Sept 10)", time: "4:30 PM – 6:00 PM", venue: "M205" },
          { day: "Day 5 (Sept 11)", time: "1:00 PM – 3:00 PM", venue: "M2 AUDITORIUM (Grand Finale)" }
        ]
      }
    ]
  }
];

export const SCHEDULE_DAYS = [
  {
    dayNumber: 1,
    date: "7 September 2026",
    label: "Day 1",
    events: [
      { domain: "Data Science", event: "The Query Detective", time: "4:30 PM – 6:00 PM", venue: "M203 / M4 LAB" },
      { domain: "Cybersecurity", event: "CTF", time: "4:30 PM – 6:00 PM", venue: "M204 / M205" },
      { domain: "AI/ML", event: "Overdrive", time: "4:30 PM – 6:00 PM", venue: "M201 / M5 LAB" },
      { domain: "Cloud Computing", event: "Cloud Cipher", time: "4:30 PM – 6:00 PM", venue: "M206" },
      { domain: "Blockchain", event: "GenesisChain Quest", time: "4:30 PM – 6:00 PM", venue: "M302 / M303 / M304 / M305" }
    ]
  },
  {
    dayNumber: 2,
    date: "8 September 2026",
    label: "Day 2",
    events: [
      { domain: "Data Science", event: "DataForge", time: "4:30 PM – 6:00 PM", venue: "M202" },
      { domain: "Cybersecurity", event: "ThreatX", time: "4:30 PM – 6:00 PM", venue: "M303 / M201" },
      { domain: "AI/ML", event: "Zero Verdict", time: "4:30 PM – 6:00 PM", venue: "M4 LAB" },
      { domain: "Cloud Computing", event: "Architecture Pitch", time: "4:30 PM – 6:00 PM", venue: "M203" },
      { domain: "Quantum Computing", event: "Qubit Quest", time: "4:30 PM – 6:00 PM", venue: "M5 LAB / M204" },
      { domain: "Animation & Game Design", event: "Character Jam", time: "4:30 PM – 6:00 PM", venue: "M206" }
    ]
  },
  {
    dayNumber: 3,
    date: "9 September 2026",
    label: "Day 3",
    events: [
      { domain: "Cybersecurity", event: "CTF", time: "4:30 PM – 6:00 PM", venue: "M4 LAB" },
      { domain: "AI/ML", event: "Overdrive", time: "4:30 PM – 6:00 PM", venue: "M201" },
      { domain: "Cloud Computing", event: "Cloud Cipher", time: "4:30 PM – 6:00 PM", venue: "M203" },
      { domain: "Blockchain", event: "GenesisChain Quest", time: "4:30 PM – 6:00 PM", venue: "M204" }
    ]
  },
  {
    dayNumber: 4,
    date: "10 September 2026",
    label: "Day 4",
    events: [
      { domain: "Data Science", event: "DataForge", time: "4:30 PM – 6:00 PM", venue: "M203" },
      { domain: "AI/ML", event: "Zero Verdict", time: "4:30 PM – 6:00 PM", venue: "M201" },
      { domain: "Cloud Computing", event: "Architecture Pitch", time: "4:30 PM – 6:00 PM", venue: "M204" },
      { domain: "Quantum Computing", event: "Qubit Quest", time: "4:30 PM – 6:00 PM", venue: "M202" },
      { domain: "Animation & Game Design", event: "Character Jam", time: "4:30 PM – 6:00 PM", venue: "M4 LAB" },
      { domain: "Spectrum CEO", event: "Spectrum CEO", time: "4:30 PM – 6:00 PM", venue: "M205" }
    ]
  },
  {
    dayNumber: 5,
    date: "11 September 2026",
    label: "Day 5 — Grand Finale",
    events: [
      { domain: "Cloud Computing", event: "Architecture Pitch", time: "9:00 AM – 3:00 PM", venue: "M202 (Finale)" },
      { domain: "Cybersecurity", event: "ThreatX", time: "9:00 AM – 3:00 PM", venue: "M203 (Finale)" },
      { domain: "Data Science", event: "DataForge", time: "9:00 AM – 3:00 PM", venue: "M201 (Finale)" },
      { domain: "AI/ML", event: "Zero Verdict", time: "11:00 AM – 1:00 PM", venue: "M4 LAB (Finale)" },
      { domain: "Spectrum CEO", event: "Spectrum CEO", time: "1:00 PM – 3:00 PM", venue: "M2 AUDITORIUM (Grand Finale)" }
    ]
  }
];
