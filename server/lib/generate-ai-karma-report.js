/**
 * Claude-powered ~500-word English Zi Wei karma report for widget leads.
 */

import { formatBirthHour, buildContextSummary } from './parse-page-context.js';

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.ANTHROPIC_KARMA_MODEL || 'claude-sonnet-4-20250514';

function buildPrompt(lead, pageContext) {
  const contextLine = buildContextSummary(pageContext);
  const focal =
    pageContext.pageType === 'transit'
      ? `${pageContext.year} ${pageContext.star} ${pageContext.transform} hitting ${pageContext.palace}`
      : pageContext.keyword || 'current Purple Star cycle';

  return `You are Guanlan Energy's master Zi Wei Dou Shu (Purple Star Astrology) analyst writing for English-speaking seekers.

BIRTH DATA
- Date: ${lead.dob || 'unknown'}
- Birth hour: ${formatBirthHour(lead.birthHour ?? lead.hour)}
- Email on file: ${lead.email}

ENTRY CONTEXT (critical — mirror this anxiety)
- Source page: ${pageContext.sourceUrl || lead.sourceUrl}
- ${contextLine}
- Focal astrological vector: ${focal}

TASK
Write ONE personalized report (~480–520 English words) in authoritative metaphysical prose (use precise ZWDS terms: Life Palace, Si Hua, decadal luck, flying stars, karmic friction, noble stars, palace activation).

Structure:
1) Opening hook acknowledging why they searched "${focal}" now.
2) Natal timing lens from birth date/hour (acknowledge limits if hour unknown).
3) Deep analysis tying ${focal} to practical life domains (career, wealth, relationships as relevant to ${pageContext.palace || 'Life Palace'}).
4) 3 numbered mitigation protocols (actionable, non-generic).
5) Closing paragraph inviting deeper chart work (no salesy hype).

Rules:
- No markdown headers; plain paragraphs and numbered list only.
- No disclaimers about being AI.
- Do NOT invent exact palace positions you cannot compute; speak in probabilistic ZWDS language.
- Tone: elite academic mystic, calm, high-trust.`;
}

function fallbackReport(lead, pageContext) {
  const focal = pageContext.keyword || 'your Purple Star configuration';
  const hourNote = formatBirthHour(lead.birthHour ?? lead.hour);
  return `Your submission from ${pageContext.sourceUrl || 'MetaphysicFlow'} signals an active decision window around ${focal}. With birth date ${lead.dob || 'on file'} and ${hourNote}, your natal matrix suggests the current annual stem is pressing the ${pageContext.palace || 'Life Palace'} axis with unusual clarity.

In classical Zi Wei Dou Shu, when a seeker lands on a page about ${focal}, the subconscious is already tracking Si Hua mutation pressure — the Four Transformations that rewire palace outcomes for the entire solar cycle. Even without a full chart cast in this instant report, the temporal signature indicates heightened sensitivity in domains governed by ${pageContext.palace || 'your core identity palace'}.

Practically, this is not a year for passive observation. Palace activation of this intensity tends to externalize as workplace power negotiations, liquidity timing decisions, or relational contracts that cannot remain ambiguous. The static article you read was generic; your birth vector personalizes the friction: slower choices accumulate karmic drag, while calibrated moves during peak decadal overlap can convert pressure into structural advantage.

Mitigation Protocol 1 — Anchor your Life Palace narrative before major commitments. Re-read which major star anchors your identity palace in a full chart; identity coherence stabilizes every downstream palace.

Mitigation Protocol 2 — Track Si Hua triggers monthly. When transformation stars clash with annual overlays, reduce leverage exposure (debt, confrontational HR moves, impulsive partnership exits) for 30-day windows.

Mitigation Protocol 3 — Activate noble-star remedies through consistent sleep, ancestral acknowledgment, and mentor outreach; ZWDS treats invisible support stars as real capital.

The transit alert you felt is real. To unlock your complete 10-year major luck (Da Yun) mitigation blueprint — palace by palace, year by year — upgrade from this snapshot to a full matrix reading with Guanlan Energy.`;
}

export async function generateAiKarmaReport(lead, pageContext) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const prompt = buildPrompt(lead, pageContext);

  if (!apiKey) {
    return {
      status: 'fallback',
      model: 'template',
      wordCount: fallbackReport(lead, pageContext).split(/\s+/).length,
      text: fallbackReport(lead, pageContext),
    };
  }

  try {
    const res = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1400,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error?.message || `Anthropic ${res.status}`);
    }

    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    if (!text) throw new Error('Empty model response');

    return {
      status: 'generated',
      model: MODEL,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      text,
    };
  } catch (err) {
    console.error('[generate-ai-karma-report]', err.message);
    const text = fallbackReport(lead, pageContext);
    return {
      status: 'fallback',
      model: 'template-after-error',
      error: err.message,
      wordCount: text.split(/\s+/).length,
      text,
    };
  }
}
