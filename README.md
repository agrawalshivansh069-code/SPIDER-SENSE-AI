# SPIDER-SENSE 🕷️
> *"Think ahead. Choose wisely. Stay responsible."*

A personal decision assistant for students, themed around Spider-Man. Built with a human-made aesthetic — thoughtful, a little dark, and functional.

---

## ⚡ Core Features

### 1. REALITY CHECK
- Input your planned daily tasks and hours (e.g. `3 hours coding, 2 hours study, 1 hour gym, 2 hours assignment`).
- Input how many free hours you actually have today.
- The AI evaluates whether the plan is realistic, flags overloading with an alert badge, explains the breakdown, and suggests a trimmed, prioritised version of the schedule under 150 words.

### 2. WHAT-IF MACHINE
- Describe your existing commitments, deadlines, and exams.
- Ask *"What if I take on [new thing]?"* (e.g. *"What if I join this hackathon tomorrow?"*).
- The AI simulates two distinct scenarios:
  - **Scenario A**: Accepting the new opportunity (what happens, what's at risk, what can be managed).
  - **Scenario B**: Declining the new opportunity (what you protect, what you miss).
  - Separated by a custom spider icon divider.
  - **VERDICT**: One sentence honest trade-off summary without making the choice for the student.

---

## 🎨 Design System

- **Palette**:
  - Deep Navy: `#0A0E1A`
  - Crimson Red: `#C41E3A`
  - Off-White: `#F5F0E8`
- **Subtle Background**: Faint, geometric spider-web SVG overlay (~4.5% opacity) — not loud or distracting.
- **Typography**: Google Fonts **Space Grotesk** (editorial headers) and **DM Sans** (clean readable body).
- **Cards & Inputs**: 14px border radius, 1px crimson border, subtle drop shadow. Plain textareas that glow red only on focus.
- **Motion**: Results cards fade in smoothly (0.3s ease-in), without template bounces or gimmicks.

---

## 🤖 AI Backend & Prompt Architecture

Built for the **Google Gemini API** (`gemini-1.5-flash`).

### Structured Prompts:

**Reality Check**:
```text
You are Spider-Sense, a student productivity assistant. The student has listed the following tasks: [TASKS]. They have [X] free hours today. Evaluate whether this plan is realistic. If overloaded, clearly say so and explain why. Then suggest a revised, prioritised version that fits within their available time. Be direct. Use bullet points. Keep it under 150 words.
```

**What-If Machine**:
```text
You are Spider-Sense, a student decision assistant. The student's current commitments are: [COMMITMENTS]. They are considering: [NEW THING]. Generate two scenarios:
Scenario A: They accept [NEW THING]. What happens? What's at risk? What can they manage?
Scenario B: They decline [NEW THING]. What do they protect? What do they miss?
Format your response as: 
SCENARIO A: [3–4 bullet points]
SCENARIO B: [3–4 bullet points]
VERDICT: One sentence of honest trade-off summary. Do not make the decision for them.
```

### Flexible Execution:
- **Live Gemini API**: Input your key directly in the web app top nav, or set `VITE_GEMINI_API_KEY` in `.env`.
- **Offline Heuristic Simulator**: If an API key is not yet set, Spider-Sense falls back gracefully to a built-in capacity engine so both features can be experienced immediately out of the box.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or build for production
npm run build
npm run preview
```

---

*Built for The CodeBreakers Club · GenAI Domain Task · Spider-Man Universe*
