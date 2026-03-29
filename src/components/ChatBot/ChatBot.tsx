"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

/* ══════════════════════════════════════
   OFFLINE KNOWLEDGE BASE — No API needed
══════════════════════════════════════ */

interface KnowledgeEntry {
  keywords: string[];
  response: string;
}

const KNOWLEDGE: KnowledgeEntry[] = [
  {
    keywords: ["who", "about", "introduce", "tell me about", "yourself", "raj"],
    response:
      "Raj Deep Dey is a UI/UX & Product Designer based in Ahmedabad, India with 5+ years of experience. He designs end-to-end digital products that balance user needs and business goals — backed by AI-assisted workflows and vibe coding. He's currently open to senior product design roles and freelance collaborations.",
  },
  {
    keywords: ["experience", "years", "how long", "career", "background"],
    response:
      "Raj has 5+ years of professional design experience since June 2020:\n\n→ MYCPE One (Dec 2024 – Present) — Product Designer\n→ MediaNV (Jul 2023 – Oct 2024) — Product Designer\n→ Rewaa Tech Verge (Jan 2020 – Jun 2023) — UI/UX & Product Designer\n\nHe's worked across HRMS, Healthcare SaaS, Fintech, E-commerce, GovTech, and more.",
  },
  {
    keywords: ["mycpe", "entigrity", "current", "present", "now"],
    response:
      "At MYCPE One (formerly Entigrity), Raj leads end-to-end product design for HRMS, ERP, and AI-driven hiring tools. He's designed 5+ enterprise modules, reduced handoff friction by 30% via AI-assisted workflows, and works across multi-role systems for Admin, Manager, Staff, and Candidates.",
  },
  {
    keywords: ["medianv", "dental", "saas", "healthcare"],
    response:
      "At MediaNV, Raj redesigned a dental SaaS dashboard that increased user engagement by 25%. He reduced user errors by 15%, increased satisfaction by 10%, and built a design system improving consistency across products by 30%.",
  },
  {
    keywords: ["rewaa", "tech verge", "first job", "started"],
    response:
      "At Rewaa Tech Verge, Raj spent 3.5 years designing web and mobile experiences across PowerApps, BI dashboards, and CMS platforms. He designed 520+ screens, delivered 42+ projects across 16+ domains including Fintech, Healthcare, E-commerce, and GovTech.",
  },
  {
    keywords: ["skill", "tool", "figma", "software", "stack", "tech"],
    response:
      "Raj's core skills & tools:\n\n🎨 Design — Figma, Figma Make, Adobe XD, Miro, Balsamiq\n🤖 AI — Figma AI, Google AI Studio, Vibe Coding, ChatGPT/Claude\n🧠 Core — Product Design (95%), Product Thinking (90%), Design Systems (88%), AI Workflows (85%)\n🚀 Workflow — Jira, ClickUp, Agile/Scrum, Sprint Planning, Dev Handoff",
  },
  {
    keywords: ["project", "work", "portfolio", "case study", "shipped"],
    response:
      "Raj has shipped 46+ projects. Key highlights:\n\n01 → HRMS 24×7 | Client Hub — Full-scale enterprise HRMS\n02 → Healthcare SaaS — Dental platform, +25% conversion\n03 → AI-Driven JD Generator — AI-powered hiring\n04 → Assessment Platform — Structured evaluation system\n05 → E-Commerce Dashboard — Lead & sales management\n06 → Patient Monitoring System\n07 → Election Management Dashboard\n08 → Food Delivery System — Multi-platform\n\nView more on his Behance: behance.net/raj_uiux",
  },
  {
    keywords: ["hire", "available", "open", "freelance", "job", "work together", "opportunity"],
    response:
      "Yes! Raj is currently open to work — both full-time senior product design roles and select freelance collaborations.\n\n📧 rajdeepdey.6359@gmail.com\n📱 +91 635 959 3154\n🔗 linkedin.com/in/6359raj\n\nHe typically responds within 24 hours.",
  },
  {
    keywords: ["contact", "email", "phone", "reach", "connect", "message"],
    response:
      "Here's how to reach Raj:\n\n📧 Email: rajdeepdey.6359@gmail.com\n📱 Phone: +91 635 959 3154\n🌍 Location: Ahmedabad, Gujarat, India\n🕐 Timezone: IST (GMT+5:30)\n\nSocials:\n→ LinkedIn: linkedin.com/in/6359raj\n→ Behance: behance.net/raj_uiux\n→ Dribbble: dribbble.com/raj_uiux_\n→ Bento: bento.me/rajuiux",
  },
  {
    keywords: ["mentor", "teach", "student", "coach", "guide", "training", "learn"],
    response:
      "Beyond designing, Raj actively mentors aspiring UI/UX designers:\n\n→ 50+ students mentored\n→ 30+ placed in jobs at product companies\n→ 100+ sessions conducted\n\nHe offers portfolio reviews, career guidance, hands-on Figma workshops, and interview preparation. Several of his mentees now work at top companies across India.",
  },
  {
    keywords: ["design system", "component", "library", "consistency"],
    response:
      "Raj is skilled in building and scaling design systems. At MediaNV, he built a design system and component library that improved consistency across products by 30%. He's also contributed to reusable patterns and structured documentation at MYCPE One to streamline design-to-dev handoff.",
  },
  {
    keywords: ["ai", "artificial", "workflow", "automation", "vibe coding"],
    response:
      "Raj integrates AI into every stage of his workflow:\n\n→ Research & ideation using Google AI Studio and ChatGPT/Claude\n→ AI-assisted design exploration and rapid prototyping\n→ Figma AI for generative design\n→ Vibe coding to ship ideas faster\n→ At MYCPE One, he reduced handoff friction by 30% through AI-assisted workflows\n\nHis AI Workflows skill level is at 85%.",
  },
  {
    keywords: ["education", "degree", "study", "college", "university", "qualification"],
    response:
      "Raj's strength lies in his hands-on, real-world experience — 5+ years of shipping products across multiple industries. He complements this with continuous learning through certifications and staying current with design and AI trends.",
  },
  {
    keywords: ["location", "city", "where", "based", "country", "india"],
    response:
      "Raj is based in Ahmedabad, Gujarat, India 🇮🇳. He works in the IST timezone (GMT+5:30) and is open to both remote and hybrid opportunities.",
  },
  {
    keywords: ["strength", "best", "special", "stand out", "different", "unique"],
    response:
      "What sets Raj apart:\n\n→ Full-cycle ownership — from stakeholder discovery and BRD creation through prototyping to UAT and handoff\n→ AI-first approach — integrates AI into every design stage\n→ Business thinking — every decision backed by clear reasoning on business value and user impact\n→ 46+ shipped projects across 16+ domains\n→ Mentors next-gen designers — 50+ students, 30+ placed in jobs",
  },
  {
    keywords: ["process", "approach", "method", "how does", "workflow"],
    response:
      "Raj's design process:\n\n1️⃣ Discovery — Stakeholder interviews, BRD creation, requirements\n2️⃣ Research — User interviews, journey mapping, competitive analysis\n3️⃣ Design — Wireframes, high-fidelity UI, prototypes in Figma\n4️⃣ Validate — Usability testing, iterate based on insights\n5️⃣ Handoff — Structured documentation, reusable patterns, dev collaboration\n\nAI tools are integrated at every stage for speed and quality.",
  },
  {
    keywords: ["behance", "dribbble", "linkedin", "social", "link", "profile"],
    response:
      "Raj's profiles:\n\n→ LinkedIn: linkedin.com/in/6359raj\n→ Behance: behance.net/raj_uiux (46+ projects)\n→ Dribbble: dribbble.com/raj_uiux_\n→ Bento: bento.me/rajuiux",
  },
  {
    keywords: ["salary", "rate", "charge", "cost", "price", "budget"],
    response:
      "For discussions about rates and project budgets, it's best to connect with Raj directly. Each project is unique, and he tailors his approach based on scope and requirements.\n\n📧 rajdeepdey.6359@gmail.com\n📱 +91 635 959 3154",
  },
  {
    keywords: ["resume", "cv", "pdf", "download"],
    response:
      "Raj's Design DNA (resume/portfolio PDF) is coming soon! In the meantime, you can explore his full work history right here on this portfolio, or check his Behance for detailed case studies: behance.net/raj_uiux",
  },
];

const GREETINGS = ["hi", "hello", "hey", "hii", "hola", "sup", "yo", "namaste", "good morning", "good afternoon", "good evening"];

const GREETING_RESPONSE =
  "Hey there! 👋 I'm Raj's portfolio assistant. I can tell you about his experience, skills, projects, mentorship, or how to hire him. What would you like to know?";

const FALLBACK_RESPONSES = [
  "Hmm, I'm not sure about that specific topic. I can help you with:\n\n→ Raj's experience & background\n→ Skills & tools he uses\n→ Projects he's shipped\n→ How to hire or contact him\n→ His mentorship work\n\nWhat would you like to know?",
  "That's outside my knowledge area! I'm specialized in everything about Raj's design career. Try asking about his projects, skills, experience, or availability!",
  "I'm best at answering questions about Raj's work and career. Ask me things like 'What are his skills?', 'Tell me about his projects', or 'Is he available for hire?'",
];

function getResponse(query: string): string {
  const q = query.toLowerCase().trim();

  // Check greetings first
  if (GREETINGS.some((g) => q === g || q.startsWith(g + " ") || q.startsWith(g + "!"))) {
    return GREETING_RESPONSE;
  }

  // Thanks / bye
  if (/^(thanks|thank you|thx|bye|goodbye|see you|take care)/i.test(q)) {
    return "You're welcome! 😊 Feel free to come back anytime. If you'd like to work with Raj, reach out at rajdeepdey.6359@gmail.com. Have a great day!";
  }

  // Score each knowledge entry by keyword matches
  let bestMatch: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (q.includes(keyword)) {
        // Longer keyword matches are weighted higher
        score += keyword.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && bestScore >= 2) {
    return bestMatch.response;
  }

  // Fallback
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}

/* ══════════════════════════════════════ */

const SUGGESTIONS = [
  "Who is Raj?",
  "What are his skills?",
  "Is he available for hire?",
  "Tell me about his projects",
];

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const setCursor = (window as any).setCursor;
    if (!setCursor) return;
    const fab = document.getElementById("chat-fab");
    if (fab) setCursor(fab, "Chat ✦");
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || loading) return;

      setHasInteracted(true);
      const userMsg: Message = { role: "user", content: text.trim() };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setLoading(true);

      // Simulate slight delay for natural feel
      const delay = 300 + Math.random() * 500;
      setTimeout(() => {
        const response = getResponse(text);
        setMessages([...newMessages, { role: "assistant", content: response }]);
        setLoading(false);
      }, delay);
    },
    [messages, loading]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* FAB Button */}
      <button
        id="chat-fab"
        className={`chat-fab ${open ? "chat-fab--open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close chat" : "Ask about Raj"}
      >
        <span className="chat-fab-icon chat-fab-icon--chat">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </span>
        <span className="chat-fab-icon chat-fab-icon--close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </span>
        {!open && <span className="chat-fab-pulse" />}
      </button>

      {/* Chat Panel */}
      <div className={`chat-panel ${open ? "chat-panel--open" : ""}`}>
        <div className="chat-header">
          <div className="chat-header-dot" />
          <div className="chat-header-info">
            <div className="chat-header-name">Ask about Raj</div>
            <div className="chat-header-status">
              {loading ? "typing…" : "Instant answers · no API needed"}
            </div>
          </div>
          <button className="chat-header-close" onClick={() => setOpen(false)}>
            &times;
          </button>
        </div>

        <div className="chat-messages">
          {!hasInteracted && (
            <div className="chat-welcome">
              <div className="chat-welcome-emoji">✦</div>
              <p className="chat-welcome-text">
                Hey! I know everything about Raj&apos;s work, skills, and experience.
                Ask me anything!
              </p>
              <div className="chat-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="chat-suggestion"
                    onClick={() => sendMessage(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat-msg ${msg.role === "user" ? "chat-msg--user" : "chat-msg--ai"}`}
            >
              {msg.role === "assistant" && (
                <div className="chat-msg-avatar">R</div>
              )}
              <div className="chat-msg-bubble">
                {msg.content.split("\n").map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < msg.content.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-msg chat-msg--ai">
              <div className="chat-msg-avatar">R</div>
              <div className="chat-msg-bubble chat-msg-typing">
                <span className="chat-dot" />
                <span className="chat-dot" />
                <span className="chat-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-wrap" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="Ask about Raj's work, skills, projects..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="chat-send"
            disabled={!input.trim() || loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>

        <div className="chat-footer">
          Instant responses · Powered by Raj&apos;s portfolio data
        </div>
      </div>
    </>
  );
}
