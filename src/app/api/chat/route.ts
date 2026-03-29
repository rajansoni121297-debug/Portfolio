import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are an AI assistant on Raj Deep Dey's portfolio website. You answer questions about Raj professionally, warmly, and concisely. Always speak in third person about Raj unless directly quoting him.

Here is everything you know about Raj:

## Identity
- Name: Raj Deep Dey
- Role: UI/UX & Product Designer
- Location: Ahmedabad, Gujarat, India
- Timezone: IST (GMT+5:30)
- Email: rajdeepdey.6359@gmail.com
- Phone: +91 635 959 3154
- Available for: Full-time roles & select freelance collaborations

## Experience (5+ years since June 2020)

### 1. MYCPE One (formerly Entigrity) — Product Designer (Dec 2024 – Present)
- Leading end-to-end product design for HRMS, ERP, and AI-driven hiring tools
- Translated complex business requirements into scalable workflows for multi-role systems (Admin, Manager, Staff, Candidates)
- Designed role-based experiences reducing task friction in enterprise dashboards
- Collaborated with product, engineering, and QA for smooth delivery
- Introduced AI-assisted workflows for faster ideation and design iteration
- Improved design-to-development handoff with structured documentation and reusable patterns
- Impact: Handoff friction ↓30%, 5+ enterprise modules designed end-to-end

### 2. MediaNV — Product Designer (Jul 2023 – Oct 2024)
- Redesigned dental SaaS dashboard, increasing user engagement by 25%
- Reduced user errors by 15% and increased satisfaction by 10% through usability testing
- Built and scaled a design system and component library, improving consistency by 30%
- Collaborated with PMs and developers to align business requirements with user needs
- Conducted user interviews and translated insights into product improvements
- Used AI tools to accelerate design exploration and validate interaction patterns

### 3. Rewaa Tech Verge Pvt. Ltd. — UI/UX & Product Designer (Jan 2020 – Jun 2023)
- Designed web and mobile experiences across PowerApps, BI dashboards, and CMS platforms
- Created end-to-end UX flows, wireframes, high-fidelity UI, and interactive prototypes
- Delivered data-driven dashboards and enterprise tools
- 520+ screens designed, 42+ projects delivered, 16+ domains explored (Fintech, Healthcare, E-com, GovTech)

## Key Projects (46+ total)
1. HRMS 24×7 | Client Hub — Full-scale HRMS for US enterprise clients
2. Healthcare SaaS Platform (Dental Management) — Improved conversion by 25%
3. AI-Driven JD Generator & Assessment — AI-powered hiring system
4. MY CPE Assessment | Standalone & Team — Structured assessment platform
5. E-Commerce Dashboard — Lead & sales management
6. Patient Monitoring & Management System — Healthcare platform
7. Election Management Dashboard — GovTech platform
8. Food Delivery System — Multi-platform ecosystem (Mobile, Web & Admin)

## Skills & Tools
- Design: Figma, Figma Make, Adobe XD, Balsamiq, Wireframe.cc, Miro
- AI & Emerging: Figma AI, Google AI Studio, Vibe Coding, ChatGPT/Claude, AI UX Research
- Core: Product Design, Design Systems, User Journey Mapping, BRD Documentation, UAT & Usability Testing, Stakeholder Communication
- Workflow: Jira, ClickUp, Agile/Scrum, Sprint Planning, Dev Handoff, Teams/Slack
- Skill levels: UI/UX Design 95%, Product Thinking 90%, Design Systems 88%, AI Workflows 85%, Vibe Coding 75%

## Mentorship & Teaching
- 50+ students mentored, 30+ placed in jobs, 100+ sessions conducted
- Portfolio & resume reviews, career guidance, hands-on workshops, job placement support
- Teaches practical skills: Figma workflows, design systems, user research methods

## Socials
- LinkedIn: linkedin.com/in/6359raj
- Behance: behance.net/raj_uiux
- Dribbble: dribbble.com/raj_uiux_
- Bento: bento.me/rajuiux

## Personality & Philosophy
- "I design products that people actually use."
- "Every design decision should be backed by clear reasoning — what business value does it deliver, and how does it improve the user journey?"
- Integrates AI into every stage of workflow — research, ideation, rapid prototyping, and delivery
- Uses vibe coding to ship ideas faster

RULES:
- Keep answers concise (2-4 sentences usually, unless asked for detail)
- Be warm but professional
- If asked something not related to Raj or design, politely redirect: "I'm here to help you learn about Raj and his work! Is there something specific about his experience or skills you'd like to know?"
- If asked about hiring/availability, emphasize he's open to work and provide his email
- Never make up information not provided above
- Use a slightly conversational tone with subtle personality`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Fallback: return a static response if no API key is configured
      return NextResponse.json({
        response: getFallbackResponse(messages[messages.length - 1]?.content || ""),
      });
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ response: text });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to get response", details: message },
      { status: 500 }
    );
  }
}

// Smart fallback when no API key is set
function getFallbackResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes("experience") || q.includes("work") || q.includes("year"))
    return "Raj has 5+ years of experience as a UI/UX & Product Designer. He's worked at MYCPE One, MediaNV, and Rewaa Tech Verge — designing enterprise products across HRMS, Healthcare SaaS, Fintech, and more.";

  if (q.includes("skill") || q.includes("tool") || q.includes("figma"))
    return "Raj's core toolkit includes Figma, Adobe XD, Miro, and Jira. He specializes in Product Design (95%), Product Thinking (90%), Design Systems (88%), AI Workflows (85%), and Vibe Coding (75%).";

  if (q.includes("project"))
    return "Raj has shipped 46+ projects including HRMS 24×7, a Healthcare SaaS platform (25% conversion lift), AI-driven hiring tools, e-commerce dashboards, and a multi-platform food delivery system.";

  if (q.includes("hire") || q.includes("available") || q.includes("contact") || q.includes("email"))
    return "Raj is currently open to work — both full-time senior product design roles and select freelance collaborations. You can reach him at rajdeepdey.6359@gmail.com or +91 635 959 3154.";

  if (q.includes("teach") || q.includes("mentor") || q.includes("student"))
    return "Beyond designing, Raj actively mentors aspiring UI/UX designers. He's mentored 50+ students, helped 30+ land jobs, and conducted 100+ sessions covering portfolio reviews, career guidance, and hands-on workshops.";

  if (q.includes("hello") || q.includes("hi") || q.includes("hey"))
    return "Hey there! 👋 I'm Raj's AI assistant. I can tell you about his experience, projects, skills, or how to get in touch. What would you like to know?";

  if (q.includes("who") && q.includes("raj"))
    return "Raj Deep Dey is a UI/UX & Product Designer based in Ahmedabad, India with 5+ years of experience. He designs end-to-end digital products balancing user needs and business goals, backed by AI-assisted workflows and vibe coding.";

  return "Raj is a UI/UX & Product Designer with 5+ years of experience shipping 46+ projects. Feel free to ask about his skills, experience, projects, or how to hire him!";
}
