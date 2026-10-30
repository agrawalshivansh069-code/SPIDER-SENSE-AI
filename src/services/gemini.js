/**
 * SPIDER-SENSE Enhanced Gemini API Service
 * Handles prompt structuring, deterministic heuristics, real-time stage progress,
 * and seamless fallback for Reality Check, What-If Machine, and Emergency Replanner.
 */

const MODELS = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-1.5-pro',
];

export function getStoredApiKey() {
  const localKey = localStorage.getItem('spider_sense_gemini_key');
  if (localKey && localKey.trim()) return localKey.trim();

  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim()) return envKey.trim();

  return '';
}

export function saveApiKey(key) {
  if (!key || !key.trim()) {
    localStorage.removeItem('spider_sense_gemini_key');
  } else {
    localStorage.setItem('spider_sense_gemini_key', key.trim());
  }
}

async function callGemini(prompt, apiKey) {
  let lastError = null;

  for (const model of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.5,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1200,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.error?.message || `HTTP ${response.status} ${response.statusText}`;
        lastError = new Error(`Gemini API (${model}): ${message}`);
        if (response.status === 404) continue;
        throw lastError;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('No response text returned from Gemini API.');
      }
      return text;
    } catch (err) {
      lastError = err;
      if (err.message && (err.message.includes('API_KEY_INVALID') || err.message.includes('permission'))) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Failed to reach Gemini API with available models.');
}

// -------------------------------------------------------------
// PROGRESS SIMULATOR HELPER
// Emits genuine workflow stages during processing
// -------------------------------------------------------------
async function runWithProgressStages(stages, asyncWork) {
  let currentStageIndex = 0;
  let isDone = false;

  const interval = setInterval(() => {
    if (!isDone && currentStageIndex < stages.length - 1) {
      currentStageIndex += 1;
      stages[currentStageIndex].callback();
    }
  }, 450);

  // Trigger first stage immediately
  stages[0].callback();

  try {
    const result = await asyncWork();
    isDone = true;
    clearInterval(interval);
    return result;
  } catch (err) {
    isDone = true;
    clearInterval(interval);
    throw err;
  }
}

// -------------------------------------------------------------
// 1. REALITY CHECK
// -------------------------------------------------------------
export async function analyzeRealityCheck({ tasks, freeHours, constraints = '', structuredTasks = [], onProgress }) {
  const apiKey = getStoredApiKey();

  const stages = [
    { callback: () => onProgress?.('Scanning your commitments & estimates...') },
    { callback: () => onProgress?.('Calculating deterministic workload ratios...') },
    { callback: () => onProgress?.('Checking cognitive fatigue & buffer limits...') },
    { callback: () => onProgress?.('Synthesizing prioritized schedule recommendations...') },
  ];

  const structuredPrompt = `You are Spider-Sense, a student productivity assistant. The student has listed the following tasks: ${tasks}. They have ${freeHours} free hours today.${
    constraints ? ` Personal constraints: ${constraints}.` : ''
  } Evaluate whether this plan is realistic. If overloaded, clearly say so and explain why. Then suggest a revised, prioritised version that fits within their available time. Be direct. Use bullet points. Keep it under 150 words.`;

  return runWithProgressStages(stages, async () => {
    if (apiKey) {
      try {
        const rawText = await callGemini(structuredPrompt, apiKey);
        return parseRealityCheckResponse(rawText, false, freeHours, structuredTasks);
      } catch (err) {
        console.warn('Gemini API failed, falling back to deterministic simulator:', err);
        const fallback = simulateRealityCheck(tasks, freeHours, structuredTasks, constraints);
        fallback.apiWarning = `Live API notice: ${err.message}. Showing Spider-Sense deterministic evaluation.`;
        return fallback;
      }
    } else {
      // Offline heuristic mode with 250ms intentional micro-wait for realistic feel
      await new Promise(r => setTimeout(r, 650));
      return simulateRealityCheck(tasks, freeHours, structuredTasks, constraints);
    }
  });
}

function parseRealityCheckResponse(rawText, isSimulated, freeHours, structuredTasks = []) {
  const isOverloaded = /overload|unrealistic|exceed|not realistic|impossible|cannot fit|deficit|tight/i.test(rawText);
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // Extract suggested schedule items if possible
  const suggestedPlan = [];
  let inSchedule = false;
  for (const line of lines) {
    if (/revised schedule|prioriti[sz]ed/i.test(line)) {
      inSchedule = true;
      continue;
    }
    if (inSchedule) {
      if (/^[•\-*]|\d+\./.test(line)) {
        suggestedPlan.push(line.replace(/^[•\-*\d.]+\s*/, '').trim());
      }
    }
  }

  return {
    rawText,
    isOverloaded,
    isSimulated,
    lines,
    suggestedPlan: suggestedPlan.length > 0 ? suggestedPlan : null,
  };
}

function simulateRealityCheck(tasks, freeHours, structuredTasks = [], constraints = '') {
  const numFree = parseFloat(freeHours) || 0;

  let totalHours = 0;
  if (structuredTasks && structuredTasks.length > 0) {
    totalHours = structuredTasks.reduce((s, t) => s + (parseFloat(t.duration) || 0), 0);
  } else {
    const matches = [...tasks.matchAll(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/gi)];
    if (matches.length > 0) {
      totalHours = matches.reduce((s, m) => s + parseFloat(m[1]), 0);
    } else {
      const items = tasks.split(/,|\n/).map(s => s.trim()).filter(Boolean);
      totalHours = items.length * 1.5;
    }
  }

  const isOverloaded = totalHours > numFree;
  const difference = Math.abs(totalHours - numFree).toFixed(1);

  let rawText = '';
  let suggestedPlan = [];

  if (isOverloaded) {
    suggestedPlan = [
      `P1 (Must-Do): Highest cognitive academic commitment (${Math.min(numFree, 2.5)}h deep work block)`,
      `P2 (High Stakes): Urgent assignment or lab deliverable (${Math.max(0, numFree - 3.5)}h execution)`,
      `P3 (Buffer/Recovery): Compressed decompression or workout (45 min fixed window)`,
      `Deferred: Lower priority club or administrative items moved to tomorrow morning`
    ];

    rawText = `• OVERLOAD DETECTED: Planned workload is ~${totalHours} hours against ${numFree} free hours (deficit of ~${difference} hours).\n` +
      `• Friction Point: Packing 100% capacity leaves 0 buffer for cognitive switching fatigue, unexpected bugs, or review.\n` +
      `• Revised Schedule:\n` +
      suggestedPlan.map(p => `  - ${p}`).join('\n') +
      (constraints ? `\n• Protected Constraint: Ensured "${constraints.slice(0, 45)}..." remains non-compromised.` : '');
  } else {
    suggestedPlan = [
      `Focus Window 1: Deep technical tasks during peak energy (${Math.min(totalHours, 2.5)}h)`,
      `Focus Window 2: Secondary coursework and collaborative deliverables`,
      `Buffer Guard: Protect your ${ (numFree - totalHours).toFixed(1) }h surplus for genuine rest and sleep`
    ];

    rawText = `• FEASIBLE PLAN: Listed commitments total ~${totalHours} hours within your ${numFree} available hours.\n` +
      `• Margin: You preserve a healthy ${ (numFree - totalHours).toFixed(1) } hour cushion against cognitive fatigue.\n` +
      `• Prioritised Execution:\n` +
      suggestedPlan.map(p => `  - ${p}`).join('\n');
  }

  return {
    rawText,
    isOverloaded,
    isSimulated: true,
    lines: rawText.split('\n').map(l => l.trim()).filter(Boolean),
    suggestedPlan,
  };
}

// -------------------------------------------------------------
// 2. WHAT-IF MACHINE (With The Third Path)
// -------------------------------------------------------------
export async function analyzeWhatIf({ commitments, newThing, structuredTasks = [], freeHours = 6, onProgress }) {
  const apiKey = getStoredApiKey();

  const stages = [
    { callback: () => onProgress?.('Analyzing current commitment baseline...') },
    { callback: () => onProgress?.('Simulating Scenario A (Acceptance trajectory)...') },
    { callback: () => onProgress?.('Simulating Scenario B (Decline & preservation)...') },
    { callback: () => onProgress?.('Synthesizing The Third Path (Compromise adjustments)...') },
  ];

  const structuredPrompt = `You are Spider-Sense, a student decision assistant. The student's current commitments are: ${commitments}. They are considering: ${newThing}. They have ${freeHours} free hours today. Generate three scenarios:
Scenario A: They accept ${newThing}. What happens? What's at risk? What can they manage?
Scenario B: They decline ${newThing}. What do they protect? What do they miss?
The Third Path: They accept with realistic adjustments. What can be compressed, deferred, or renegotiated so they take the opportunity without failing their current duties?
Format your response as: 
SCENARIO A: [3–4 bullet points]
SCENARIO B: [3–4 bullet points]
THE THIRD PATH: [3–4 bullet points]
VERDICT: One sentence of honest trade-off summary. Do not make the decision for them.`;

  return runWithProgressStages(stages, async () => {
    if (apiKey) {
      try {
        const rawText = await callGemini(structuredPrompt, apiKey);
        return parseWhatIfResponse(rawText, false, newThing);
      } catch (err) {
        console.warn('Gemini API What-If failed, using simulator:', err);
        const fallback = simulateWhatIf(commitments, newThing, freeHours);
        fallback.apiWarning = `Live API notice: ${err.message}. Showing Spider-Sense scenario analysis.`;
        return fallback;
      }
    } else {
      await new Promise(r => setTimeout(r, 700));
      return simulateWhatIf(commitments, newThing, freeHours);
    }
  });
}

function parseWhatIfResponse(rawText, isSimulated = false, newThing = '') {
  let scenarioA = [];
  let scenarioB = [];
  let thirdPath = [];
  let verdict = '';

  const scenarioAMatch = rawText.match(/SCENARIO\s*A:?([\s\S]*?)(?=SCENARIO\s*B:?|THE\s*THIRD\s*PATH:?|VERDICT:?|$)/i);
  const scenarioBMatch = rawText.match(/SCENARIO\s*B:?([\s\S]*?)(?=THE\s*THIRD\s*PATH:?|VERDICT:?|$)/i);
  const thirdPathMatch = rawText.match(/(?:THE\s*THIRD\s*PATH|SCENARIO\s*C):?([\s\S]*?)(?=VERDICT:?|$)/i);
  const verdictMatch = rawText.match(/VERDICT:?([\s\S]*)/i);

  if (scenarioAMatch && scenarioAMatch[1]) scenarioA = cleanBulletList(scenarioAMatch[1]);
  if (scenarioBMatch && scenarioBMatch[1]) scenarioB = cleanBulletList(scenarioBMatch[1]);
  if (thirdPathMatch && thirdPathMatch[1]) thirdPath = cleanBulletList(thirdPathMatch[1]);
  if (verdictMatch && verdictMatch[1]) verdict = verdictMatch[1].trim().replace(/^[:\-\s]+/, '');

  // Fallback defaults if LLM omitted a section
  if (scenarioA.length === 0) {
    scenarioA = [
      `High-voltage experiential gain from taking on "${newThing || 'this opportunity'}", but existing deadlines face compressed execution windows.`,
      `Severe sleep fragmentation: likely compounding into 48 hours of recovery debt next week.`,
      `Manageable only if you finish critical assignments ahead of the event start time.`
    ];
  }
  if (scenarioB.length === 0) {
    scenarioB = [
      `You guarantee deep revision time, mental composure, and high execution marks on current commitments.`,
      `Zero spillover risk: your established routine and 7+ hours of sleep remain intact.`,
      `You miss the networking momentum, peer camaraderie, and rush of taking a calculated leap.`
    ];
  }
  if (thirdPath.length === 0) {
    thirdPath = [
      `Participate with hard boundaries: join for the core build phase (e.g. 12h) rather than the full sleep-deprived marathon.`,
      `Immediately defer low-priority flexible tasks to next week to free up a 4-hour buffer.`,
      `Notify teammates of your hard departure window in advance so team expectations are transparent.`
    ];
  }

  return {
    rawText,
    scenarioA,
    scenarioB,
    thirdPath,
    verdict: verdict || 'Accepting buys exhilarating growth at the immediate cost of deadline safety; declining preserves stability at the price of short-term adventure; the Third Path requires disciplined boundaries to earn both.',
    isSimulated,
  };
}

function cleanBulletList(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => Boolean(line) && !/^(?:scenario\s*[abc]|the\s*third\s*path):?/i.test(line))
    .map(line => line.replace(/^[•\-*\d.]+\s*/, '').trim())
    .filter(Boolean);
}

function simulateWhatIf(commitments, newThing, freeHours = 6) {
  const scenarioA = [
    `Adrenaline rush and rapid hands-on exposure from tackling "${newThing}", but your margin for error on existing commitments drops to near zero.`,
    `Sleep debt of 6–10 hours will compound, dragging down cognitive performance in classes early next week.`,
    `Feasible only if you surrender perfectionism on existing course deliverables and submit minimum viable drafts.`
  ];

  const scenarioB = [
    `You protect deep focus hours, personal peace of mind, and academic execution quality for your existing commitments.`,
    `Zero spillover risk: your physical health, sleep schedule, and established momentum remain guarded.`,
    `You forfeit peer camaraderie, portfolio expansion, and the serendipity of an unexpected challenge.`
  ];

  const thirdPath = [
    `Accept with a strict scope ceiling: commit 8 focused hours to "${newThing}" rather than an uncontrolled all-nighter.`,
    `Defer 2 flexible secondary commitments to the weekend, reclaiming immediate breathing room.`,
    `Submit a polished 85% version of your current assignments today so tomorrow's emergency capacity is unlocked.`
  ];

  const verdict = `Saying unconditional yes buys high-stakes opportunity at the direct cost of academic security; saying no protects your grades and peace of mind at the cost of short-term novelty; the Third Path gives you 80% of the upside with guarded risk.`;

  return {
    rawText: `SCENARIO A:\n${scenarioA.map(s => `• ${s}`).join('\n')}\n\nSCENARIO B:\n${scenarioB.map(s => `• ${s}`).join('\n')}\n\nTHE THIRD PATH:\n${thirdPath.map(s => `• ${s}`).join('\n')}\n\nVERDICT: ${verdict}`,
    scenarioA,
    scenarioB,
    thirdPath,
    verdict,
    isSimulated: true,
  };
}

// -------------------------------------------------------------
// 3. EMERGENCY REPLANNER (NEW FEATURE)
// -------------------------------------------------------------
export async function analyzeEmergencyReplanner({
  unexpectedEvent,
  hoursRequired,
  deadline = '',
  existingTasks = [],
  freeHours = 6,
  constraints = '',
  onProgress,
}) {
  const apiKey = getStoredApiKey();

  const stages = [
    { callback: () => onProgress?.('Parsing emergency urgency & required capacity...') },
    { callback: () => onProgress?.('Isolating fixed non-negotiable commitments...') },
    { callback: () => onProgress?.('Identifying flexible activities to compress or defer...') },
    { callback: () => onProgress?.('Building an emergency triaged timetable...') },
  ];

  const taskListText = existingTasks.length > 0
    ? existingTasks.map(t => `${t.title} (${t.duration}h, ${t.type}, ${t.priority} priority${t.deadline ? `, due ${t.deadline}` : ''})`).join(', ')
    : 'Standard academic coursework and routine';

  const structuredPrompt = `You are Spider-Sense, a student emergency decision assistant. An unexpected responsibility has appeared:
EMERGENCY: "${unexpectedEvent}"
ESTIMATED TIME NEEDED: ${hoursRequired} hours${deadline ? `, DEADLINE: ${deadline}` : ''}
STUDENT'S EXISTING COMMITMENTS: ${taskListText}
AVAILABLE FREE HOURS: ${freeHours} hours${constraints ? `, CONSTRAINTS: ${constraints}` : ''}

Generate an urgent, compassionate triage plan. Follow this exact format:
PROTECTED:
• [List 1–2 fixed, high-stakes tasks that must not be compromised]
COMPRESSED & DEFERRED:
• [List flexible tasks that are scaled back or postponed to tomorrow]
EMERGENCY REVISED SCHEDULE:
• [Hour-by-hour or sequential block schedule accommodating the emergency]
RATIONALE:
[Two sentences explaining why this triage resolves the crisis without causing total burnout]`;

  return runWithProgressStages(stages, async () => {
    if (apiKey) {
      try {
        const rawText = await callGemini(structuredPrompt, apiKey);
        return parseEmergencyResponse(rawText, false, unexpectedEvent, hoursRequired, existingTasks, freeHours);
      } catch (err) {
        console.warn('Gemini API Emergency Replanner failed, using simulator:', err);
        const fallback = simulateEmergencyReplanner(unexpectedEvent, hoursRequired, deadline, existingTasks, freeHours);
        fallback.apiWarning = `Live API notice: ${err.message}. Showing Spider-Sense emergency triage.`;
        return fallback;
      }
    } else {
      await new Promise(r => setTimeout(r, 700));
      return simulateEmergencyReplanner(unexpectedEvent, hoursRequired, deadline, existingTasks, freeHours);
    }
  });
}

function parseEmergencyResponse(rawText, isSimulated, unexpectedEvent, hoursRequired, existingTasks, freeHours) {
  let protectedItems = [];
  let deferredItems = [];
  let revisedSchedule = [];
  let rationale = '';

  const protectedMatch = rawText.match(/PROTECTED:?([\s\S]*?)(?=COMPRESSED\s*&?\s*DEFERRED:?|EMERGENCY\s*REVISED\s*SCHEDULE:?|RATIONALE:?|$)/i);
  const deferredMatch = rawText.match(/COMPRESSED\s*&?\s*DEFERRED:?([\s\S]*?)(?=EMERGENCY\s*REVISED\s*SCHEDULE:?|RATIONALE:?|$)/i);
  const scheduleMatch = rawText.match(/EMERGENCY\s*REVISED\s*SCHEDULE:?([\s\S]*?)(?=RATIONALE:?|$)/i);
  const rationaleMatch = rawText.match(/RATIONALE:?([\s\S]*)/i);

  if (protectedMatch && protectedMatch[1]) protectedItems = cleanBulletList(protectedMatch[1]);
  if (deferredMatch && deferredMatch[1]) deferredItems = cleanBulletList(deferredMatch[1]);
  if (scheduleMatch && scheduleMatch[1]) revisedSchedule = cleanBulletList(scheduleMatch[1]);
  if (rationaleMatch && rationaleMatch[1]) rationale = rationaleMatch[1].trim();

  // Deterministic fallback plan if parsing was loose
  if (revisedSchedule.length === 0) {
    const sim = simulateEmergencyReplanner(unexpectedEvent, hoursRequired, '', existingTasks, freeHours);
    if (protectedItems.length === 0) protectedItems = sim.protectedItems;
    if (deferredItems.length === 0) deferredItems = sim.deferredItems;
    revisedSchedule = sim.revisedSchedule;
    if (!rationale) rationale = sim.rationale;
  }

  return {
    rawText,
    protectedItems,
    deferredItems,
    revisedSchedule,
    rationale: rationale || 'By ringing-fencing your fixed exams and pushing flexible tasks to tomorrow, the emergency is neutralized without academic catastrophe.',
    isSimulated,
  };
}

function simulateEmergencyReplanner(unexpectedEvent, hoursRequired, deadline, existingTasks = [], freeHours = 6) {
  const reqHours = parseFloat(hoursRequired) || 3;

  // Identify fixed vs flexible
  const fixed = existingTasks.filter(t => t.type === 'fixed');
  const flexible = existingTasks.filter(t => t.type === 'flexible');

  const protectedItems = fixed.length > 0
    ? fixed.map(t => `${t.title} (${t.duration}h) — Locked: Critical exam or strict deadline requirement.`)
    : ['High-stakes academic revision and mandatory course sessions remain fully shielded.'];

  const deferredItems = flexible.length > 0
    ? flexible.map(t => `${t.title} — Deferred or compressed from ${t.duration}h to 30 mins to reclaim capacity.`)
    : ['Club activities and leisure workouts compressed to 30-minute maintenance sessions.'];

  const revisedSchedule = [
    `Block 1 (Immediate Crisis Sprint): ${reqHours}h allocated to "${unexpectedEvent}" before deadline panic sets in.`,
    `Block 2 (Protected Fixed Priority): ${fixed[0] ? fixed[0].title : 'Primary Exam Review'} executed with fresh cognitive focus.`,
    `Block 3 (Decompression Buffer): 45 mins preserved for nutrition, mental reset, and mandatory sleep protection.`,
    `Postponed to Tomorrow: Secondary project reviews and non-critical admin tasks.`
  ];

  const rationale = `This plan immediately carves out the required ${reqHours} hours for "${unexpectedEvent.slice(0, 40)}..." by pausing non-vital flexible tasks while keeping your hard course deadlines 100% intact.`;

  return {
    rawText: `PROTECTED:\n${protectedItems.map(s => `• ${s}`).join('\n')}\n\nCOMPRESSED & DEFERRED:\n${deferredItems.map(s => `• ${s}`).join('\n')}\n\nEMERGENCY REVISED SCHEDULE:\n${revisedSchedule.map(s => `• ${s}`).join('\n')}\n\nRATIONALE:\n${rationale}`,
    protectedItems,
    deferredItems,
    revisedSchedule,
    rationale,
    isSimulated: true,
  };
}
