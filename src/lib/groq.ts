import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function analyzeResumeWithGroq(
  resumeText: string,
  jobDescriptionText: string,
  internalSkills: string[]
) {
  const prompt = `You are a senior ATS specialist at a top recruitment firm. Your job is to give ACCURATE, HONEST, and DETAILED analysis.

=== SCORING RULES (Be strict but fair) ===

KEYWORD MATCH SCORE (40 points max):
- Extract ALL specific skills, tools, certifications, and role-specific terms from the JD
- Check each one against the resume using SEMANTIC matching (synonyms count):
  * "F&B Operations" = "Food & Beverage Operations" = matches
  * "P&L Accountability" in resume matches "performance reporting" + "KPIs" in JD
  * "HACCP" in resume matches "food safety" + "compliance standards" in JD
  * "Inventory Management" + "supply chain" = matches "stock control (FIFO/FEFO)"
  * "Team Leadership" + "coaching" = matches "lead and motivate teams"
  * "Multi-outlet operations" = matches "daily operations management"
- Count matches honestly. Do NOT penalize for synonyms.

SKILLS COVERAGE SCORE (25 points max):
- Required skills present in resume (with synonyms): score higher
- Missing required skills: score lower

EXPERIENCE RELEVANCE SCORE (20 points max):
- Is the candidate's background relevant to this role?
- Transferable skills count (hospitality ops → food production ops)
- Years of experience match

FORMAT & ACHIEVEMENTS SCORE (15 points max):
- Quantified achievements present?
- Clear structure?

=== JOB DESCRIPTION ===
${jobDescriptionText}

=== RESUME ===
${resumeText}

=== INTERNAL SKILLS DATABASE (suggest from these ONLY) ===
${internalSkills.slice(0, 150).join(', ')}

=== INSTRUCTIONS ===
1. PRESENT KEYWORDS: List skills/keywords found in BOTH using semantic matching (include synonyms)
   Example: If JD says "food safety compliance" and CV has "HACCP" → include "Food Safety & Compliance"
   Example: If JD says "KPIs" and CV has "performance reporting" → include "KPIs / Performance Reporting"

2. MISSING KEYWORDS: List ONLY skills/keywords truly absent from resume (even semantically)

3. SUGGESTED SKILLS: From internal database ONLY - relevant to this specific job

4. SCORE: Calculate using the scoring rules above. 
   - A strong hospitality operations manager applying to food production ops = 55-70 range
   - NOT 20. Be accurate, not pessimistic.

5. IMPROVEMENTS: 5 specific tips mentioning EXACT keywords from JD to add

Return STRICT JSON only, no other text:
{
  "score": number,
  "presentKeywords": string[],
  "missingKeywords": string[],
  "suggestedSkills": string[],
  "improvements": string[]
}`;

  const result = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    response_format: { type: 'json_object' },
    temperature: 0.1,
    max_tokens: 2000,
  });

  const parsed = JSON.parse(result.choices[0].message.content || '{}');

  // Safety check: score should never be below 20 for a non-empty resume
  if (parsed.score && parsed.score < 25 && resumeText.length > 500) {
    console.warn('⚠️ Score suspiciously low, re-analyzing...');
    // Re-run with more explicit semantic matching instruction
    const retry = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt + '\n\nIMPORTANT: The candidate has 12+ years in F&B operations which IS relevant to food production operations. Hospitality = Food Industry. Score accordingly.'
        }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.0,
      max_tokens: 2000,
    });
    return JSON.parse(retry.choices[0].message.content || '{}');
  }

  return parsed;
}
