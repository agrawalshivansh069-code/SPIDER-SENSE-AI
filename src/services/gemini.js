/**
 * SPIDER-SENSE Gemini API Service
 * Handles prompt structuring, API interaction, response parsing, and intelligent fallback.
 */

// Model preferences in order
const MODELS = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-1.5-pro'
];

/**
 * Retrieve the active API key from localStorage or Vite environment variable.
 */
export function getStoredApiKey() {
  const localKey = localStorage.getItem('spider_sense_gemini_key');
  if (localKey && localKey.trim()) return localKey.trim();
  
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim()) return envKey.trim();

  return '';
}

/**
 * Save user API key to localStorage.
 */
export function saveApiKey(key) {
  if (!key || !key.trim()) {
    localStorage.removeItem('spider_sense_gemini_key');
  } else {
    localStorage.setItem('spider_sense_gemini_key', key.trim());
  }
}

/**
 * Perform a direct call to the Gemini REST API.
 */
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
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.6,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.error?.message || `HTTP ${response.status} ${response.statusText}`;
        lastError = new Error(`Gemini API (${model}): ${message}`);
        // If it's a model not found error (404), try the next model
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
      // If network failure or explicit API key error, don't loop endlessly
      if (err.message && (err.message.includes('API_KEY_INVALID') || err.message.includes('permission'))) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Failed to reach Gemini API with available models.');
}

// -------------------------------------------------------------
// REALITY CHECK
// -------------------------------------------------------------

export async function analyzeRealityCheck({ tasks, freeHours }) {
  const apiKey = getStoredApiKey();

  const structuredPrompt = `You are Spider-Sense, a student productivity assistant. The student has listed the following tasks: ${tasks}. They have ${freeHours} free hours today. Evaluate whether this plan is realistic. If overloaded, clearly say so and explain why. Then suggest a revised, prioritised version that fits within their available time. Be direct. Use bullet points. Keep it under 150 words.`;

  if (apiKey) {
    try {
      const rawText = await callGemini(structuredPrompt, apiKey);
      return parseRealityCheckResponse(rawText, false);
    } catch (err) {
      console.warn('Gemini API call failed, falling back to heuristic engine:', err);
      // If error is invalid key, bubble it or fallback with clear note
      const fallback = simulateRealityCheck(tasks, freeHours);
      fallback.apiWarning = `Live API notice: ${err.message}. Showing Spider-Sense heuristic analysis.`;
      return fallback;
    }
  } else {
    // Intelligent offline heuristic simulation
    return simulateRealityCheck(tasks, freeHours);
  }
}

function parseRealityCheckResponse(rawText, isSimulated = false) {
  const isOverloaded = /overload|unrealistic|exceed|not realistic|impossible|cannot fit|tight/i.test(rawText);

  // Split lines into structured segments
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  
  return {
    rawText,
    isOverloaded,
    isSimulated,
    lines,
  };
}

/**
 * Intelligent local heuristic simulator for Reality Check
 * Accurately parses hours from text like "3 hours coding, 2 hours study, 1 hour gym"
 */
function simulateRealityCheck(tasks, freeHours) {
  const numFree = parseFloat(freeHours) || 0;
  
  // Extract number + "hour(s)" or "hr(s)"
  const matches = [...tasks.matchAll(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/gi)];
  let estimatedTotal = 0;
  if (matches.length > 0) {
    for (const m of matches) {
      estimatedTotal += parseFloat(m[1]);
    }
  } else {
    // Fallback: estimate ~1.5 hours per comma or line item
    const items = tasks.split(/,|\n/).map(s => s.trim()).filter(Boolean);
    estimatedTotal = items.length * 1.5;
  }

  const isOverloaded = estimatedTotal > numFree;
  const difference = (estimatedTotal - numFree).toFixed(1);

  let rawText = '';
  if (isOverloaded) {
    rawText = `• OVERLOAD DETECTED: Your planned workload requires approximately ${estimatedTotal} hours, but you only have ${numFree} free hours available (deficit of ~${difference} hours).\n` +
      `• Why it fails: Attempting to squeeze 100% capacity leaves zero buffer for context-switching, cognitive fatigue, or task overruns.\n` +
      `• Revised Schedule:\n` +
      `  - P1 (Must-Do): Highest cognitive load academic task (allocated ${Math.min(numFree, 2.5)} hours).\n` +
      `  - P2 (High Value): Primary assignment or urgent deadline item (${Math.max(0, numFree - 3)} hours).\n` +
      `  - P3 (Buffer / Health): Physical workout or decompression (capped at 45 mins).\n` +
      `  - Deferred: Non-urgent tasks moved to tomorrow's queue.`;
  } else {
    rawText = `• FEASIBLE PLAN: Your listed commitments total approximately ${estimatedTotal} hours against your ${numFree} free hours.\n` +
      `• Margin: You maintain a healthy ${ (numFree - estimatedTotal).toFixed(1) } hour buffer for breaks and unexpected interruptions.\n` +
      `• Prioritised Execution:\n` +
      `  - Start with deep-focus technical work in your peak morning/afternoon window.\n` +
      `  - Schedule lower-stake tasks right before your scheduled rest.\n` +
      `  - Protect your remaining free hours — don't let scope creep eat your rest.`;
  }

  return {
    rawText,
    isOverloaded,
    isSimulated: true,
    lines: rawText.split('\n').map(l => l.trim()).filter(Boolean),
  };
}

// -------------------------------------------------------------
// WHAT-IF MACHINE
// -------------------------------------------------------------

export async function analyzeWhatIf({ commitments, newThing }) {
  const apiKey = getStoredApiKey();

  const structuredPrompt = `You are Spider-Sense, a student decision assistant. The student's current commitments are: ${commitments}. They are considering: ${newThing}. Generate two scenarios:
Scenario A: They accept ${newThing}. What happens? What's at risk? What can they manage?
Scenario B: They decline ${newThing}. What do they protect? What do they miss?
Format your response as: 
SCENARIO A: [3–4 bullet points]
SCENARIO B: [3–4 bullet points]
VERDICT: One sentence of honest trade-off summary. Do not make the decision for them.`;

  if (apiKey) {
    try {
      const rawText = await callGemini(structuredPrompt, apiKey);
      return parseWhatIfResponse(rawText, false);
    } catch (err) {
      console.warn('Gemini API call failed for What-If, falling back to heuristic engine:', err);
      const fallback = simulateWhatIf(commitments, newThing);
      fallback.apiWarning = `Live API notice: ${err.message}. Showing Spider-Sense simulated scenarios.`;
      return fallback;
    }
  } else {
    return simulateWhatIf(commitments, newThing);
  }
}

function parseWhatIfResponse(rawText, isSimulated = false) {
  // Regex to extract SCENARIO A, SCENARIO B, and VERDICT
  let scenarioA = [];
  let scenarioB = [];
  let verdict = '';

  const scenarioAMatch = rawText.match(/SCENARIO\s*A:?([\s\S]*?)(?=SCENARIO\s*B:?|VERDICT:?|$)/i);
  const scenarioBMatch = rawText.match(/SCENARIO\s*B:?([\s\S]*?)(?=VERDICT:?|$)/i);
  const verdictMatch = rawText.match(/VERDICT:?([\s\S]*)/i);

  if (scenarioAMatch && scenarioAMatch[1]) {
    scenarioA = cleanBulletList(scenarioAMatch[1]);
  }
  if (scenarioBMatch && scenarioBMatch[1]) {
    scenarioB = cleanBulletList(scenarioBMatch[1]);
  }
  if (verdictMatch && verdictMatch[1]) {
    verdict = verdictMatch[1].trim().replace(/^[:\-\s]+/, '');
  }

  // Fallback parsing if formatting was slightly non-standard
  if (scenarioA.length === 0 || scenarioB.length === 0) {
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    let currentSection = null;

    for (const line of lines) {
      if (/scenario\s*a/i.test(line)) {
        currentSection = 'A';
      } else if (/scenario\s*b/i.test(line)) {
        currentSection = 'B';
      } else if (/verdict/i.test(line)) {
        currentSection = 'V';
        verdict = line.replace(/verdict:?/i, '').trim();
      } else if (currentSection === 'A' && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line))) {
        scenarioA.push(line.replace(/^[•\-*\d.]+\s*/, '').trim());
      } else if (currentSection === 'B' && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line))) {
        scenarioB.push(line.replace(/^[•\-*\d.]+\s*/, '').trim());
      } else if (currentSection === 'V' && !verdict) {
        verdict = line;
      }
    }
  }

  return {
    rawText,
    scenarioA,
    scenarioB,
    verdict: verdict || 'Accepting grants immediate upside and excitement at the direct expense of existing deadlines and sleep, while declining secures academic stability at the cost of experiential regret.',
    isSimulated,
  };
}

function cleanBulletList(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => Boolean(line) && !/^scenario\s*[ab]:?/i.test(line))
    .map(line => line.replace(/^[•\-*\d.]+\s*/, '').trim())
    .filter(Boolean);
}

function simulateWhatIf(commitments, newThing) {
  const scenarioA = [
    `High adrenaline and rapid experiential gain from tackling "${newThing}", but your margin for error on "${commitments.slice(0, 45)}..." drops to near zero.`,
    `Sleep debt and cognitive fragmentation will likely spill into the 48 hours following the event.`,
    `Manageable only if you pre-negotiate extension windows or deliberately sacrifice perfection on existing deliverables.`
  ];

  const scenarioB = [
    `You protect deep preparation time, quality of work, and mental clarity for your existing commitments.`,
    `Zero spillover risk: your established routine and recovery hours remain intact.`,
    `You miss the networking momentum, peer camaraderie, and direct rush of taking on something unexpected.`
  ];

  const verdict = `Saying yes buys high-stakes opportunity at the direct cost of academic breathing room; saying no protects your grades and peace of mind at the cost of short-term adventure.`;

  return {
    rawText: `SCENARIO A:\n${scenarioA.map(s => `• ${s}`).join('\n')}\n\nSCENARIO B:\n${scenarioB.map(s => `• ${s}`).join('\n')}\n\nVERDICT: ${verdict}`,
    scenarioA,
    scenarioB,
    verdict,
    isSimulated: true
  };
}
