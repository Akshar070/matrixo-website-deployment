// ============================================================
// Skill Verification API — Start Test
// POST /api/skilldna/verify/start
// Creates a new test session and returns questions (no answers)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createTestSession, DEFAULT_TEST_CONFIG } from '@/lib/skilldna/verification/test-engine';
import { hasVerificationQuestions } from '@/lib/skilldna/verification/question-bank';
import { checkCooldown } from '@/lib/skilldna/verification/scoring-engine';
import {
  getSkillVerification,
  saveTestSession,
} from '@/lib/skilldna/verification/firestore-service';

export const dynamic = 'force-dynamic';

// Simple rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(id: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(id);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(id, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const tokenId = token.slice(-16);

    if (!checkRateLimit(tokenId)) {
      return NextResponse.json({ error: 'Rate limited. Try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const { userId, skillName } = body;

    if (!userId || !skillName) {
      return NextResponse.json(
        { error: 'userId and skillName are required' },
        { status: 400 }
      );
    }

    // Check if questions exist for this skill
    if (!hasVerificationQuestions(skillName)) {
      return NextResponse.json(
        { error: `No verification test available for "${skillName}" yet.` },
        { status: 404 }
      );
    }

    // Check cooldown
    const existing = await getSkillVerification(userId, skillName);
    const cooldown = checkCooldown(existing || undefined);

    if (!cooldown.allowed) {
      const hoursLeft = Math.ceil(cooldown.remainingMs / (1000 * 60 * 60));
      return NextResponse.json(
        {
          error: `Cooldown active. You can retake this test in ~${hoursLeft} hour(s).`,
          cooldownUntil: existing?.cooldownUntil,
          remainingMs: cooldown.remainingMs,
        },
        { status: 429 }
      );
    }

    // Create test session
    const session = createTestSession(userId, skillName);
    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create test session.' },
        { status: 500 }
      );
    }

    // Persist session reference for later grading validation
    await saveTestSession(userId, session);

    // Return session to client (questions have shuffled options, no correct answers)
    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        skillName: session.skillName,
        questions: session.questions,
        config: {
          questionCount: session.config.questionCount,
          timeLimitSeconds: session.config.timeLimitSeconds,
          passingScorePercent: session.config.passingScorePercent,
        },
        startedAt: session.startedAt,
      },
    });
  } catch (err: any) {
    console.error('[verify/start] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
