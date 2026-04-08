import { NextRequest, NextResponse } from 'next/server';
import { runFullPipeline } from '@/lib/pipeline';
import { loadSkills } from '@/lib/skills';
import { extractText } from 'unpdf';

declare global {
  var __analysisStore: Map<string, any> | undefined;
}

function getStore(): Map<string, any> {
  if (!global.__analysisStore) {
    global.__analysisStore = new Map();
  }
  return global.__analysisStore;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get('resume') as File;
    const jobDescription = formData.get('jobDescription') as string;

    if (!resumeFile || !jobDescription) {
      return NextResponse.json(
        { error: 'Missing resume or job description' },
        { status: 400 }
      );
    }

    const arrayBuffer = await resumeFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const { text } = await extractText(uint8Array, { mergePages: true });
    const resumeText = text;

    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF.' },
        { status: 400 }
      );
    }

    const internalSkills = loadSkills();
    const flatSkills = Object.values(internalSkills).flatMap(cat =>
      Object.values(cat as object).flat()
    ) as string[];

    // Run full 7-step AI pipeline
    const result = await runFullPipeline(resumeText, jobDescription, flatSkills);

    const store = getStore();
    store.set(result.id, {
      ...result,
      resumeText,
      jobDescription,
      createdAt: new Date().toISOString(),
    });
    console.log('✅ Pipeline saved to memory:', result.id);

    setImmediate(async () => {
      try {
        const { Pool, neonConfig } = await import('@neondatabase/serverless');
        const ws = require('ws');
        neonConfig.webSocketConstructor = ws;
        const connectionString = process.env.DATABASE_URL;
        if (connectionString) {
          const pool = new Pool({ connectionString });
          await pool.query(
            `INSERT INTO "AnalysisResult"
              (id, "createdAt", "updatedAt", "resumeText", "jobDescription", score,
               "presentKeywords", "missingKeywords", "suggestedSkills", improvements,
               "optimizedResume", "coverLetter")
             VALUES ($1, NOW(), NOW(), $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (id) DO NOTHING`,
            [
              result.id, resumeText, jobDescription,
              result.score,
              result.presentKeywords,
              result.missingKeywords,
              result.suggestedSkills,
              result.improvements,
              result.optimizedResume,
              result.coverLetter,
            ]
          );
          await pool.end();
        }
      } catch (dbErr: any) {
        console.warn('⚠️ DB save failed:', dbErr.message);
      }
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('--- PIPELINE ERROR ---');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Pipeline failed' },
      { status: 500 }
    );
  }
}
