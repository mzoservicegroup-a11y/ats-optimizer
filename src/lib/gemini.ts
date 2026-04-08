import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ═══════════════════════════════════════════════════
// AI PROVIDERS - Ordered by quality (best to fallback)
// 1. Gemini 2.5 Flash  (Google - Best quality)
// 2. DeepSeek R1       (Strong reasoning)
// 3. OpenRouter Gemini (Reliable fallback)
// ═══════════════════════════════════════════════════

async function callDeepSeek(prompt: string): Promise<string> {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callOpenRouter(prompt: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://resumeats.app',
      'X-Title': 'ResumeATS',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function isFallbackError(error: any): boolean {
  const msg = error?.message || '';
  return (
    msg.includes('429') ||
    msg.includes('404') ||
    msg.includes('quota') ||
    msg.includes('Too Many Requests') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('not found') ||
    msg.includes('not supported') ||
    msg.includes('401') ||
    msg.includes('403') ||
    msg.includes('500') ||
    msg.includes('overloaded') ||
    msg.includes('unavailable')
  );
}

// ═══════════════════════════════════════════════════
// SMART CASCADE: Gemini → DeepSeek → OpenRouter
// Passes automatically with zero downtime
// ═══════════════════════════════════════════════════
async function generateWithFallback(prompt: string): Promise<string> {

  // 1️⃣ Try Gemini first (best quality)
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-04-17' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('✅ Provider: Gemini 2.5 Flash');
    return text;
  } catch (err: any) {
    console.warn(`⚠️ Gemini failed (${err.message?.slice(0, 60)}) → trying DeepSeek...`);
  }

  // 2️⃣ Try DeepSeek (strong reasoning)
  try {
    const text = await callDeepSeek(prompt);
    console.log('✅ Provider: DeepSeek');
    return text;
  } catch (err: any) {
    console.warn(`⚠️ DeepSeek failed (${err.message?.slice(0, 60)}) → trying OpenRouter...`);
  }

  // 3️⃣ Try OpenRouter (final fallback)
  try {
    const text = await callOpenRouter(prompt);
    console.log('✅ Provider: OpenRouter');
    return text;
  } catch (err: any) {
    console.error(`❌ All providers failed: ${err.message}`);
    throw new Error('All AI providers are currently unavailable. Please try again in a moment.');
  }
}

// ═══════════════════════════════════════════════════
// EXPORTED FUNCTIONS
// ═══════════════════════════════════════════════════

export async function optimizeResumeWithGemini(
  resumeText: string,
  missingSkills: string[],
  jobDescription: string
): Promise<string> {
  const prompt = `
You are a world-class resume writer and ATS optimization expert with 15+ years of experience placing candidates at top companies.

TASK: Rewrite the resume below to achieve 95%+ ATS score for the job description. Follow the EXACT template structure shown below — no deviations.

=== JOB DESCRIPTION ===
${jobDescription}

=== ORIGINAL RESUME ===
${resumeText}

=== MISSING SKILLS TO INTEGRATE NATURALLY ===
${missingSkills.join(', ')}

=== REWRITING RULES ===
1. Follow the EXACT template structure below — every section, every format
2. Integrate ALL missing skills naturally into bullets and competencies
3. Rewrite every bullet with measurable achievements: numbers, %, $, timeframes
4. Write a powerful professional summary (3 lines max) tailored to the JD
5. Keep ALL real experience from the original — do not invent or remove jobs
6. Use the EXACT same section headers as the template
7. Headline under name: extract the candidate's title/specialization from resume

=== PROFESSIONAL RESUME TEMPLATE TO FOLLOW EXACTLY ===

[FULL NAME IN CAPS]
[Job Title] | [Specialization] | [Key Expertise Area] | [Key Value Proposition]
[Phone] | [Email] | [LinkedIn URL] | [City, Country] | [Website if any]

PROFESSIONAL SUMMARY
[3 lines: Role + years of experience + key industries/regions. Core achievements with metrics. Certifications + languages.]

CORE COMPETENCIES
[Category 1]: [Skill A] · [Skill B] · [Skill C] · [Skill D]
[Category 2]: [Skill A] · [Skill B] · [Skill C] · [Skill D]
[Category 3]: [Skill A] · [Skill B] · [Skill C] · [Skill D]
[Category 4]: [Skill A] · [Skill B] · [Skill C] · [Skill D]
[Category 5]: [Skill A] · [Skill B] · [Skill C] · [Skill D]
[Category 6]: [Skill A] · [Skill B] · [Skill C] · [Skill D]
[Category 7]: [Skill A] · [Skill B] · [Skill C] · [Skill D]

PROFESSIONAL EXPERIENCE

[Job Title] | [Company Name] | [City, Country] | [Month Year – Month Year]
• [Achievement bullet with metric — action verb + what you did + result]
• [Achievement bullet with metric]
• [Achievement bullet with metric]
• [Achievement bullet with metric]
• [Achievement bullet with metric]

[Job Title] | [Company Name] | [City, Country] | [Month Year – Month Year]
• [Achievement bullet with metric]
• [Achievement bullet with metric]
• [Achievement bullet with metric]
• [Achievement bullet with metric]

[Continue for ALL jobs from original resume]

EARLIER CAREER
[Job Title] · [Company], [City, Country] · [Date Range] — [One-line achievement summary with metric]
[Job Title] · [Company], [City, Country] · [Date Range] — [One-line achievement summary with metric]
[Job Title] · [Company], [City, Country] · [Date Range] — [One-line achievement summary with metric]

EDUCATION
[Degree Name] ([Field]) | [Institution], [City, Country] | [Year–Year]
[Degree Name] | [Institution], [City, Country] | [Year–Year]

CERTIFICATIONS
[Certification Name]
[Certification Name]
[Certification Name]

LANGUAGES
[Language]: [Level]
[Language]: [Level]
[Language]: [Level]

RECOGNITION & AWARDS
• [Award Name] — [Company/Organization]
• [Award Name] — [Company/Organization]
• [Notable achievement or milestone]

=== OUTPUT RULES ===
- Output the COMPLETE resume using this EXACT structure
- Use plain text formatting (no markdown symbols like # or **)
- Use ALL CAPS for section headers exactly as shown above
- Use bullet point • for experience bullets
- Use · (middle dot) to separate skills in Core Competencies
- Do NOT truncate — include every section fully
- Do NOT add fictional experience
- Fill every section with real data from the original resume
`;

  return await generateWithFallback(prompt);
}

export async function generateCoverLetterWithGemini(
  resumeText: string,
  jobDescription: string,
  internalSkills: string[]
): Promise<string> {
  const prompt = `
You are a professional cover letter writer.

TASK: Fill in the cover letter template below using real information from the resume and job description.

=== JOB DESCRIPTION ===
${jobDescription}

=== CANDIDATE RESUME ===
${resumeText}

=== INSTRUCTIONS ===
- Replace every [PLACEHOLDER] with actual information from the resume and JD
- Keep the exact structure of the template
- Make content specific, professional, and tailored to the job
- Extract candidate name, address, phone, years of experience, skills from the resume
- Extract company name, job title, hiring manager from the JD

=== TEMPLATE ===

[Candidate Full Name]
[Street Address]
[City and Zip Code]
[Phone Number]
[Today's Date]

[Hiring Manager's Name or "Hiring Manager"]
[Job Title]
[Company Name]
[Company Address]

Dear [Hiring Manager],

I am writing to you to express my motivation for the currently open role as [JOB TITLE] at [COMPANY NAME], which I believe I can bring tremendous value for.

For the past [YEARS OF EXPERIENCE] I've been focusing on [PRIMARY SKILL matching JD]. In addition, my academic background is in [DEGREE AND FIELD]. Apart from being able to apply a diverse perspective, I add to the equation my skills at [SKILL 1], [SKILL 2], [SKILL 3].

I would love to schedule an interview with you and further discuss the possibility of the current role, as well as to understand the company's needs better.

Thank you for your time and consideration.

Best regards,
[Candidate Full Name]

=== OUTPUT ===
Return ONLY the completed cover letter with all placeholders filled. No extra text.
`;

  return await generateWithFallback(prompt);
}
