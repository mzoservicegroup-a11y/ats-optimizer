import { NextRequest, NextResponse } from 'next/server';
import { generateCoverLetterWithGemini } from '@/lib/gemini';
import { loadSkills } from '@/lib/skills';

function getStore(): Map<string, any> {
  if (!global.__analysisStore) {
    global.__analysisStore = new Map();
  }
  return global.__analysisStore;
}

export async function POST(req: NextRequest) {
  try {
    const { analysisId } = await req.json();

    if (!analysisId) {
      return NextResponse.json({ error: 'Missing analysis ID' }, { status: 400 });
    }

    let resumeText = '';
    let jobDescription = '';

    // Try in-memory store first
    const store = getStore();
    const cached = store.get(analysisId);
    if (cached) {
      resumeText = cached.resumeText;
      jobDescription = cached.jobDescription;
      console.log('✅ Found in memory store:', analysisId);
    } else {
      // Try DB fallback
      try {
        const { Pool, neonConfig } = await import('@neondatabase/serverless');
        const ws = require('ws');
        neonConfig.webSocketConstructor = ws;
        const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
        const result = await pool.query(
          `SELECT "resumeText", "jobDescription" FROM "AnalysisResult" WHERE id = $1`,
          [analysisId]
        );
        await pool.end();
        if (result.rows.length === 0) {
          return NextResponse.json({ error: 'Analysis not found. Please re-analyze your resume.' }, { status: 404 });
        }
        resumeText = result.rows[0].resumeText;
        jobDescription = result.rows[0].jobDescription;
      } catch (dbErr: any) {
        return NextResponse.json(
          { error: 'Session expired. Please re-analyze your resume.' },
          { status: 404 }
        );
      }
    }

    const internalSkills = loadSkills();
    const flatSkills = Object.values(internalSkills).flatMap(cat =>
      Object.values(cat as object).flat()
    ) as string[];

    const coverLetter = await generateCoverLetterWithGemini(
      resumeText,
      jobDescription,
      flatSkills
    );

    // Update in-memory store
    if (cached) {
      store.set(analysisId, { ...cached, coverLetter });
    }

    // Try to save to DB
    try {
      const { Pool, neonConfig } = await import('@neondatabase/serverless');
      const ws = require('ws');
      neonConfig.webSocketConstructor = ws;
      const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
      await pool.query(
        `UPDATE "AnalysisResult" SET "coverLetter" = $1, "updatedAt" = NOW() WHERE id = $2`,
        [coverLetter, analysisId]
      );
      await pool.end();
    } catch (dbErr: any) {
      console.warn('⚠️ DB update failed:', dbErr.message);
    }

    return NextResponse.json({ coverLetter, id: analysisId });

  } catch (error: any) {
    console.error('--- COVER LETTER ERROR ---', error.message);
    return NextResponse.json(
      { error: 'Failed to generate cover letter', details: error.message },
      { status: 500 }
    );
  }
}
