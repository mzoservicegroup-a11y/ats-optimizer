// ═══════════════════════════════════════════════════════════════
// ADVANCED AI PIPELINE - 7 Steps, 6 AI Providers
// ═══════════════════════════════════════════════════════════════

export interface ParsedCV {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }>;
  education: Array<{ degree: string; institution: string; year: string }>;
  skills: string[];
  certifications: string[];
  languages: string[];
  awards: string[];
}

export interface ParsedJD {
  jobTitle: string;
  company: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  tools: string[];
  experienceLevel: string;
  keywords: string[];
  industryDomain: string;
}

export interface MatchResult {
  atsScore: number;
  semanticScore: number;
  keywordScore: number;
  presentKeywords: string[];
  missingKeywords: string[];
  suggestedSkills: string[];
  matchBreakdown: {
    skillsMatch: number;
    experienceMatch: number;
    toolsMatch: number;
    keywordsMatch: number;
  };
}

export interface EvaluationReport {
  finalScore: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  improvements: string[];
  formatScore: number;
  keywordCoverage: number;
  readabilityScore: number;
  summary: string;
}

export interface PipelineResult {
  id: string;
  parsedCV: ParsedCV;
  parsedJD: ParsedJD;
  matchResult: MatchResult;
  optimizedResume: string;
  coverLetter: string;
  evaluation: EvaluationReport;
  score: number;
  presentKeywords: string[];
  missingKeywords: string[];
  suggestedSkills: string[];
  improvements: string[];
}

// ── HELPERS ──────────────────────────────────────────────────────

function safeJson(text: string): any {
  const cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse JSON: ' + cleaned.slice(0, 200));
  }
}

async function callGroq(prompt: string, jsonMode = true): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.GROQ_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 4000,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });
  if (!res.ok) throw new Error('Groq error: ' + res.status + ' ' + await res.text());
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callKimi(prompt: string): Promise<string> {
  const res = await fetch('https://api.moonshot.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.KIMI_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'moonshot-v1-8k',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 2000,
    }),
  });
  if (!res.ok) throw new Error('Kimi error: ' + res.status);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callDeepSeek(prompt: string): Promise<string> {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.DEEPSEEK_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 2000,
    }),
  });
  if (!res.ok) throw new Error('DeepSeek error: ' + res.status);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callOpenRouter(prompt: string, model: string): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://resumeats.app',
      'X-Title': 'ResumeATS',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
    }),
  });
  if (!res.ok) throw new Error('OpenRouter ' + model + ' error: ' + res.status);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callGemini(prompt: string): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-04-17' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ── STEP 1: Parse CV with Groq (fast + reliable JSON) ────────────

export async function parseCV(resumeText: string): Promise<ParsedCV> {
  console.log('🔵 Step 1: Groq - Parsing CV into structured JSON...');

  const prompt = `Extract ALL information from this CV and return ONLY valid JSON.
No explanation, no markdown, just the JSON object.

CV TEXT:
${resumeText}

Return this EXACT JSON (fill with real data from CV, empty arrays if not found):
{
  "name": "full name from CV",
  "email": "email from CV",
  "phone": "phone from CV",
  "location": "city, country from CV",
  "linkedin": "linkedin URL or empty string",
  "summary": "professional summary paragraph from CV",
  "experience": [
    {
      "title": "job title",
      "company": "company name",
      "location": "city, country",
      "startDate": "Month Year",
      "endDate": "Month Year or Present",
      "bullets": ["achievement 1", "achievement 2", "achievement 3"]
    }
  ],
  "education": [
    {
      "degree": "degree name and field",
      "institution": "school name and city",
      "year": "year range"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "certifications": ["certification 1", "certification 2"],
  "languages": ["Arabic: Native", "English: Fluent"],
  "awards": ["award 1", "award 2"]
}`;

  try {
    const text = await callGroq(prompt, true);
    const parsed = safeJson(text) as ParsedCV;
    console.log('✅ Step 1 done: CV parsed. Skills found:', parsed.skills?.length || 0);
    return parsed;
  } catch (err: any) {
    console.warn('⚠️ Step 1 fallback:', err.message);
    return extractCVFallback(resumeText);
  }
}

function extractCVFallback(text: string): ParsedCV {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const email = text.match(/[\w.+-]+@[\w.-]+\.\w{2,}/)?.[0] || '';
  const phone = text.match(/[+]?[\d\s().-]{8,}/)?.[0]?.trim() || '';
  const linkedin = text.match(/linkedin\.com\/in\/[\w-]+/)?.[0] || '';

  // Extract skills from CORE COMPETENCIES section
  const compStart = text.indexOf('CORE COMPETENCIES');
  const expStart = text.indexOf('PROFESSIONAL EXPERIENCE');
  let skills: string[] = [];
  if (compStart > -1 && expStart > -1) {
    const compSection = text.slice(compStart, expStart);
    const skillMatches = compSection.match(/[A-Za-z][A-Za-z\s&]+(?=\s*[·|]|\n)/g) || [];
    skills = skillMatches.map(s => s.trim()).filter(s => s.length > 3 && s.length < 40);
  }

  return {
    name: lines[0] || '',
    email,
    phone,
    location: '',
    linkedin,
    summary: '',
    experience: [],
    education: [],
    skills,
    certifications: [],
    languages: [],
    awards: [],
  };
}

// ── STEP 2: Analyze JD with Kimi ─────────────────────────────────

export async function analyzeJD(jobDescription: string): Promise<ParsedJD> {
  console.log('🔵 Step 2: Kimi - Analyzing Job Description...');

  const prompt = `Analyze this job description and return ONLY valid JSON. No markdown, no explanation.

JOB DESCRIPTION:
${jobDescription}

Return this EXACT JSON:
{
  "jobTitle": "exact job title",
  "company": "company name or empty string",
  "requiredSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "preferredSkills": ["nice to have 1", "nice to have 2"],
  "responsibilities": ["responsibility 1", "responsibility 2", "responsibility 3"],
  "tools": ["tool or software 1", "tool 2"],
  "experienceLevel": "entry or mid or senior or executive",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8"],
  "industryDomain": "hospitality or tech or finance or other"
}`;

  try {
    const text = await callKimi(prompt);
    const parsed = safeJson(text) as ParsedJD;
    console.log('✅ Step 2 done: JD analyzed. Keywords:', parsed.keywords?.length || 0);
    return parsed;
  } catch (err: any) {
    console.warn('⚠️ Step 2 Kimi failed, using Groq fallback:', err.message);
    try {
      const text = await callGroq(prompt, true);
      return safeJson(text) as ParsedJD;
    } catch {
      return extractJDFallback(jobDescription);
    }
  }
}

function extractJDFallback(text: string): ParsedJD {
  const words = text.split(/\W+/).filter(w => w.length > 4);
  const freq: Record<string, number> = {};
  words.forEach(w => { freq[w.toLowerCase()] = (freq[w.toLowerCase()] || 0) + 1; });
  const keywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([w]) => w);
  return {
    jobTitle: text.split('\n')[0]?.slice(0, 60) || 'Unknown',
    company: '',
    requiredSkills: keywords.slice(0, 8),
    preferredSkills: [],
    responsibilities: [],
    tools: [],
    experienceLevel: 'mid',
    keywords,
    industryDomain: 'hospitality',
  };
}

// ── STEP 3: CV vs JD Analysis with DeepSeek ──────────────────────

export async function analyzeCVvsJD(
  parsedCV: ParsedCV,
  parsedJD: ParsedJD,
  internalSkills: string[]
): Promise<{ gaps: string[]; strengths: string[]; suggestedSkills: string[] }> {
  console.log('🔵 Step 3: DeepSeek - CV vs JD Deep Analysis...');

  const prompt = `Compare the candidate profile against the job requirements. Return ONLY valid JSON.

CANDIDATE SKILLS: ${parsedCV.skills.join(', ')}
CANDIDATE EXPERIENCE: ${parsedCV.experience.map(e => e.title + ' at ' + e.company).join(' | ')}
CANDIDATE CERTIFICATIONS: ${parsedCV.certifications.join(', ')}

JOB REQUIRED SKILLS: ${parsedJD.requiredSkills.join(', ')}
JOB PREFERRED SKILLS: ${parsedJD.preferredSkills.join(', ')}
JOB KEYWORDS: ${parsedJD.keywords.join(', ')}
JOB TOOLS: ${parsedJD.tools.join(', ')}

INTERNAL SKILLS DATABASE (suggest ONLY from these): ${internalSkills.slice(0, 80).join(', ')}

Return:
{
  "gaps": ["specific required skill or keyword missing from candidate"],
  "strengths": ["specific strength candidate has that matches job"],
  "suggestedSkills": ["skill from internal database that matches this job role"]
}`;

  try {
    const text = await callDeepSeek(prompt);
    const result = safeJson(text);
    console.log('✅ Step 3 done: Gaps found:', result.gaps?.length || 0);
    return result;
  } catch (err: any) {
    console.warn('⚠️ Step 3 DeepSeek failed, using Groq fallback:', err.message);
    try {
      const text = await callGroq(prompt, true);
      return safeJson(text);
    } catch {
      return { gaps: parsedJD.missingKeywords || [], strengths: [], suggestedSkills: [] };
    }
  }
}

// ── STEP 4: Cohere Matching (Semantic 60% + Keyword 40%) ──────────

export async function matchWithCohere(
  parsedCV: ParsedCV,
  parsedJD: ParsedJD,
  gaps: string[],
  internalSkills: string[]
): Promise<MatchResult> {
  console.log('🔵 Step 4: Cohere - Semantic + Keyword ATS Matching...');

  // Build comprehensive text representations
  const cvAllText = [
    parsedCV.summary,
    parsedCV.skills.join(' '),
    parsedCV.certifications.join(' '),
    ...parsedCV.experience.map(e => e.title + ' ' + e.company + ' ' + e.bullets.join(' ')),
  ].join(' ').toLowerCase();

  const jdAllKeywords = [
    ...parsedJD.requiredSkills,
    ...parsedJD.preferredSkills,
    ...parsedJD.keywords,
    ...parsedJD.tools,
  ];

  // Precise keyword matching
  const cvWords = new Set(cvAllText.split(/\W+/).filter(w => w.length > 2));
  const presentKeywords: string[] = [];
  const missingKeywords: string[] = [];

  jdAllKeywords.forEach(kw => {
    const kwLower = kw.toLowerCase().trim();
    if (!kwLower || kwLower.length < 3) return;
    // Check multi-word and single word matches
    const kwWords = kwLower.split(' ');
    const found = kwWords.every(w => cvWords.has(w)) || cvAllText.includes(kwLower);
    if (found) {
      if (!presentKeywords.includes(kw)) presentKeywords.push(kw);
    } else {
      if (!missingKeywords.includes(kw)) missingKeywords.push(kw);
    }
  });

  const keywordScore = jdAllKeywords.length > 0
    ? Math.round((presentKeywords.length / jdAllKeywords.length) * 100)
    : 60;

  // Semantic score via Cohere Rerank
  let semanticScore = Math.round(keywordScore * 1.1); // default slightly higher than keyword

  try {
    const cvDoc = (parsedCV.summary + ' ' + parsedCV.skills.join(' ')).slice(0, 800);
    const jdQuery = (parsedJD.requiredSkills.join(' ') + ' ' + parsedJD.keywords.join(' ')).slice(0, 500);

    const res = await fetch('https://api.cohere.com/v1/rerank', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.COHERE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'rerank-english-v3.0',
        query: jdQuery,
        documents: [cvDoc],
        top_n: 1,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const relevance = data?.results?.[0]?.relevance_score || 0;
      semanticScore = Math.round(Math.min(relevance * 120, 100)); // scale up a bit
      console.log('✅ Cohere semantic relevance:', relevance.toFixed(3), '→', semanticScore);
    } else {
      console.warn('⚠️ Cohere rerank failed:', res.status);
    }
  } catch (err: any) {
    console.warn('⚠️ Cohere failed:', err.message);
  }

  // ATS Score = 60% semantic + 40% keyword
  const atsScore = Math.min(100, Math.max(20, Math.round(
    (semanticScore * 0.6) + (keywordScore * 0.4)
  )));

  // Suggested skills from internal database
  const suggestedSkills = internalSkills
    .filter(s => {
      const sl = s.toLowerCase();
      return parsedJD.keywords.some(k => k.toLowerCase().includes(sl) || sl.includes(k.toLowerCase()))
        && !cvAllText.includes(sl);
    })
    .slice(0, 10);

  console.log('✅ Step 4 done: ATS Score:', atsScore, '| Present:', presentKeywords.length, '| Missing:', missingKeywords.length);

  return {
    atsScore,
    semanticScore,
    keywordScore,
    presentKeywords: presentKeywords.slice(0, 20),
    missingKeywords: missingKeywords.slice(0, 15),
    suggestedSkills,
    matchBreakdown: {
      skillsMatch: keywordScore,
      experienceMatch: semanticScore,
      toolsMatch: Math.round((keywordScore + semanticScore) / 2),
      keywordsMatch: keywordScore,
    },
  };
}

// ── STEP 5: OpenRouter CV Rewriter (GPT-4o → Claude → Gemini) ────

export async function rewriteCVWithOpenRouter(
  parsedCV: ParsedCV,
  parsedJD: ParsedJD,
  missingKeywords: string[]
): Promise<string> {
  console.log('🔵 Step 5: OpenRouter GPT-4o - Rewriting CV...');

  const prompt = `You are a world-class resume writer and ATS expert. Rewrite this resume completely to achieve 95%+ ATS score.

TARGET JOB: ${parsedJD.jobTitle}
COMPANY: ${parsedJD.company || 'target company'}
REQUIRED SKILLS TO INTEGRATE: ${parsedJD.requiredSkills.join(', ')}
MISSING KEYWORDS TO ADD NATURALLY: ${missingKeywords.join(', ')}

CANDIDATE REAL DATA (use ONLY this - do not invent anything):
Name: ${parsedCV.name}
Phone: ${parsedCV.phone}
Email: ${parsedCV.email}
LinkedIn: ${parsedCV.linkedin}
Location: ${parsedCV.location}
Summary: ${parsedCV.summary}
Skills: ${parsedCV.skills.join(', ')}
Languages: ${parsedCV.languages.join(', ')}
Certifications: ${parsedCV.certifications.join(', ')}
Awards: ${parsedCV.awards.join(', ')}

EXPERIENCE (rewrite each bullet with strong metrics):
${parsedCV.experience.map(e =>
  e.title + ' | ' + e.company + ' | ' + e.location + ' | ' + e.startDate + ' – ' + e.endDate + '\n' +
  e.bullets.map(b => '• ' + b).join('\n')
).join('\n\n')}

EDUCATION:
${parsedCV.education.map(e => e.degree + ' | ' + e.institution + ' | ' + e.year).join('\n')}

REWRITING RULES:
1. Integrate ALL missing keywords naturally - no forced or robotic insertions
2. Rewrite every bullet with strong metrics (%, $, numbers)
3. Add missing required skills to Core Competencies section
4. Professional summary must mention the target job title
5. Keep ALL real companies and dates - never invent experience
6. Output in this EXACT plain text format (NO markdown symbols):

${parsedCV.name.toUpperCase()}
${parsedJD.jobTitle} | Pre-Opening Specialist | P&L Accountability | Multi-Property Operations
${parsedCV.phone} | ${parsedCV.email} | ${parsedCV.linkedin} | ${parsedCV.location}

PROFESSIONAL SUMMARY
[3 powerful lines tailored to ${parsedJD.jobTitle}]

CORE COMPETENCIES
[Category 1]: [Skill] · [Skill] · [Skill] · [Skill]
[Category 2]: [Skill] · [Skill] · [Skill] · [Skill]
[Category 3]: [Skill] · [Skill] · [Skill] · [Skill]
[Category 4]: [Skill] · [Skill] · [Skill] · [Skill]
[Category 5]: [Skill] · [Skill] · [Skill] · [Skill]

PROFESSIONAL EXPERIENCE

[Job Title] | [Company] | [Location] | [Start – End]
• [Achievement with strong metric]
• [Achievement with strong metric]
• [Achievement with strong metric]
• [Achievement with strong metric]
• [Achievement with strong metric]

[Repeat for ALL jobs]

EARLIER CAREER
[Title] · [Company], [Location] · [Dates] — [One-line achievement with metric]

EDUCATION
[Degree] | [Institution] | [Year]

CERTIFICATIONS
[Cert]
[Cert]

LANGUAGES
[Language]: [Level]

RECOGNITION & AWARDS
• [Award] — [Organization]

CRITICAL: Output COMPLETE resume. Never truncate. Never add fictional experience.`;

  const models = [
    'openai/gpt-4o',
    'anthropic/claude-3.5-sonnet',
    'google/gemini-2.0-flash-001',
  ];

  for (const model of models) {
    try {
      const text = await callOpenRouter(prompt, model);
      console.log('✅ Step 5 done: CV rewritten with', model);
      return text;
    } catch (err: any) {
      console.warn('⚠️ OpenRouter model ' + model + ' failed:', err.message.slice(0, 80));
    }
  }

  // Final fallback: Gemini
  try {
    const text = await callGemini(prompt);
    console.log('✅ Step 5 done via Gemini fallback');
    return text;
  } catch (err: any) {
    throw new Error('All CV rewriting providers failed: ' + err.message);
  }
}

// ── STEP 6: Gemini Cover Letter ───────────────────────────────────

export async function generateCoverLetterPipeline(
  parsedCV: ParsedCV,
  parsedJD: ParsedJD
): Promise<string> {
  console.log('🔵 Step 6: Gemini - Generating Cover Letter...');

  const yearsExp = parsedCV.experience.length > 0 ? parsedCV.experience.length + '+ roles spanning 12+ years' : 'several years';
  const topSkills = parsedCV.skills.slice(0, 3).join(', ') || parsedJD.requiredSkills.slice(0, 3).join(', ');
  const degree = parsedCV.education[0]?.degree || 'Hospitality Management';

  const prompt = `Fill this cover letter template with real data. Replace ALL placeholders. Return ONLY the completed letter.

CANDIDATE DATA:
Name: ${parsedCV.name}
Phone: ${parsedCV.phone}
Email: ${parsedCV.email}
Location: ${parsedCV.location}
Experience: ${yearsExp}
Top skills: ${topSkills}
Degree: ${degree}

JOB:
Title: ${parsedJD.jobTitle}
Company: ${parsedJD.company || 'the company'}
Key requirements: ${parsedJD.requiredSkills.slice(0, 4).join(', ')}

TEMPLATE:
${parsedCV.name}
${parsedCV.location}
${parsedCV.phone}
${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}

Hiring Manager
${parsedJD.jobTitle}
${parsedJD.company || '[Company Name]'}

Dear Hiring Manager,

I am writing to express my motivation for the currently open role as ${parsedJD.jobTitle} at ${parsedJD.company || '[Company Name]'}, which I believe I can bring tremendous value for.

For the past [YEARS from experience] I've been focusing on [PRIMARY SKILL from CV that matches ${parsedJD.jobTitle}]. In addition, my academic background is in [DEGREE from CV]. Apart from being able to apply a diverse perspective, I add to the equation my skills at [SKILL 1 matching job], [SKILL 2 matching job], [SKILL 3 matching job].

I would love to schedule an interview with you and further discuss the possibility of the current role, as well as to understand the company's needs better.

Thank you for your time and consideration.

Best regards,
${parsedCV.name}`;

  try {
    const text = await callGemini(prompt);
    console.log('✅ Step 6 done: Cover letter generated');
    return text;
  } catch (err: any) {
    console.warn('⚠️ Step 6 Gemini failed, trying OpenRouter:', err.message);
    try {
      return await callOpenRouter(prompt, 'google/gemini-2.0-flash-001');
    } catch {
      return await callGroq(prompt, false);
    }
  }
}

// ── STEP 7: Gemini Evaluation Report ──────────────────────────────

export async function evaluateWithGemini(
  parsedCV: ParsedCV,
  parsedJD: ParsedJD,
  matchResult: MatchResult
): Promise<EvaluationReport> {
  console.log('🔵 Step 7: Gemini - Full Evaluation Report...');

  const prompt = `Generate a comprehensive ATS evaluation report. Return ONLY valid JSON.

ANALYSIS DATA:
- Candidate: ${parsedCV.name}
- Job: ${parsedJD.jobTitle}
- ATS Score: ${matchResult.atsScore}/100
- Semantic Match: ${matchResult.semanticScore}%
- Keyword Coverage: ${matchResult.keywordScore}%
- Present Keywords: ${matchResult.presentKeywords.join(', ')}
- Missing Keywords: ${matchResult.missingKeywords.join(', ')}
- Candidate Skills: ${parsedCV.skills.join(', ')}
- Required Skills: ${parsedJD.requiredSkills.join(', ')}

Return:
{
  "finalScore": ${matchResult.atsScore},
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "weaknesses": ["specific gap 1", "specific gap 2"],
  "missingSkills": ["missing required skill 1", "missing required skill 2", "missing required skill 3"],
  "improvements": [
    "Specific actionable improvement 1 with clear instruction",
    "Specific actionable improvement 2",
    "Specific actionable improvement 3",
    "Specific actionable improvement 4",
    "Specific actionable improvement 5"
  ],
  "formatScore": 85,
  "keywordCoverage": ${matchResult.keywordScore},
  "readabilityScore": 80,
  "summary": "2-sentence evaluation of fit for ${parsedJD.jobTitle}"
}`;

  try {
    const text = await callGemini(prompt);
    const report = safeJson(text) as EvaluationReport;
    console.log('✅ Step 7 done: Evaluation complete');
    return report;
  } catch (err: any) {
    console.warn('⚠️ Step 7 failed:', err.message);
    try {
      const text = await callGroq(prompt, true);
      return safeJson(text) as EvaluationReport;
    } catch {
      return {
        finalScore: matchResult.atsScore,
        strengths: matchResult.presentKeywords.slice(0, 3),
        weaknesses: matchResult.missingKeywords.slice(0, 2),
        missingSkills: matchResult.missingKeywords.slice(0, 5),
        improvements: [
          'Add quantifiable metrics to all experience bullets',
          'Include missing keywords: ' + matchResult.missingKeywords.slice(0, 3).join(', '),
          'Strengthen professional summary with target job title',
          'Add tools and systems mentioned in job description',
          'Highlight pre-opening and P&L management experience more prominently',
        ],
        formatScore: 80,
        keywordCoverage: matchResult.keywordScore,
        readabilityScore: 75,
        summary: 'Candidate has strong relevant experience but needs to better align CV keywords with job requirements.',
      };
    }
  }
}

// ── MAIN PIPELINE ORCHESTRATOR ─────────────────────────────────────

export async function runFullPipeline(
  resumeText: string,
  jobDescription: string,
  internalSkills: string[]
): Promise<PipelineResult> {
  const id = require('crypto').randomUUID();
  console.log('🚀 Starting 7-Step AI Pipeline:', id);
  console.log('═'.repeat(55));

  // Steps 1 & 2: Parse CV and JD in parallel
  const [parsedCV, parsedJD] = await Promise.all([
    parseCV(resumeText),
    analyzeJD(jobDescription),
  ]);

  // Step 3: CV vs JD Analysis
  const cvAnalysis = await analyzeCVvsJD(parsedCV, parsedJD, internalSkills);

  // Step 4: Matching & ATS Score
  const matchResult = await matchWithCohere(parsedCV, parsedJD, cvAnalysis.gaps, internalSkills);

  // Steps 5, 6, 7: Run in parallel
  const [optimizedResume, coverLetter, evaluation] = await Promise.all([
    rewriteCVWithOpenRouter(parsedCV, parsedJD, matchResult.missingKeywords),
    generateCoverLetterPipeline(parsedCV, parsedJD),
    evaluateWithGemini(parsedCV, parsedJD, matchResult),
  ]);

  console.log('═'.repeat(55));
  console.log('🏁 Pipeline complete! ATS Score:', matchResult.atsScore);

  return {
    id,
    parsedCV,
    parsedJD,
    matchResult,
    optimizedResume,
    coverLetter,
    evaluation,
    // UI compatibility
    score: matchResult.atsScore,
    presentKeywords: matchResult.presentKeywords,
    missingKeywords: matchResult.missingKeywords,
    suggestedSkills: [...cvAnalysis.suggestedSkills, ...matchResult.suggestedSkills].slice(0, 10),
    improvements: evaluation.improvements,
  };
}
