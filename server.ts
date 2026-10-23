import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Initialize server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function generateDeterministicFallback(type: string, context: any): string {
  switch (type) {
    case 'ASSIGNMENT_PERFORMANCE':
      return `Academic Performance Summary:
- Valid Assignments: ${context.validScoresCount ?? 'N/A'} of ${context.totalAssignmentsCount ?? 'N/A'}
- Current Assignment Average: ${context.averagePercentage !== null ? `${context.averagePercentage}%` : 'N/A'}
- Official Required Cutoff: ${context.cutoff ?? 40}%
- Status: ${context.averagePercentage >= (context.cutoff ?? 40) ? 'ELIGIBLE' : 'BELOW CUTOFF'}
${context.missingWeeks?.length ? `Note: Assignments for Week(s) ${context.missingWeeks.join(', ')} are currently missing or unsubmitted.` : 'All released assignments have valid submissions on record.'}
Recommendation: Focus on consistency across all weeks. Remember that academic regulations require meeting the official threshold based strictly on valid scores.`;

    case 'ELIGIBILITY_DECISION':
      return `Eligibility Evaluation:
- Student: ${context.studentId}
- Course: ${context.courseId}
- Result: ${context.status}
- Deterministic Reason: ${context.reason || 'Evaluated against official institutional cutoff.'}
- Official Cutoff Reference: ${context.evidenceReference || 'Course Handbook 2026'}
Next Steps: If your score meets the cutoff, you may proceed to exam city selection and fee approval. If below cutoff, registration remains blocked according to MOOC guidelines.`;

    case 'REGISTRATION_BLOCKED':
      return `Registration Block Reason:
The system has blocked the requested registration due to regulatory constraints:
- Reason: ${context.reason || 'Unsatisfied eligibility criteria or closed window.'}
- Current Status: ${context.status || 'BLOCKED'}
No payment will be accepted and no exam seat will be allocated while this condition remains active.`;

    case 'PROCESS_SUMMARY':
    default:
      return `MOOC Registrar Workflow Overview:
1. Enrolment: Select course and session with required human confirmation.
2. Assignment Tracking: Submit weekly coursework and track percentage scores.
3. Exam Eligibility: Deterministically calculated against the confirmed cutoff.
4. City Allocation: Check seat capacities; choose alternative if preferred city is full.
5. Verification: Independent audit verification and hall-ticket issuance check.`;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Endpoint: AI Explainer powered by Gemini
  app.post('/api/gemini/explain', async (req: Request, res: Response) => {
    try {
      const { type, context } = req.body;

      if (!ai) {
        return res.json({
          fallback: true,
          explanation: generateDeterministicFallback(type, context),
        });
      }

      const prompt = `You are the MOOC Course & Exam Registrar AI Agent.
Explain the student's status clearly, professionally, and concisely in 2 short paragraphs based ONLY on the provided deterministic data.
DO NOT fabricate or invent scores, cutoffs, dates, or registration IDs that are not in the context.
Distinguish established institutional facts from advice.
Help the student understand their performance, reasons for any blockers, and clear practical next steps.

Context Data:
${JSON.stringify(context, null, 2)}

Inquiry Focus: ${type}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const explanation = response.text || generateDeterministicFallback(type, context);

      return res.json({
        fallback: false,
        explanation,
      });
    } catch (err: any) {
      console.warn('Gemini explanation error, using deterministic fallback:', err.message);
      return res.json({
        fallback: true,
        explanation: generateDeterministicFallback(req.body.type, req.body.context),
        error: err.message,
      });
    }
  });

  // API Endpoint: External Portal Connection Verification
  app.post('/api/portal/test-connection', async (req: Request, res: Response) => {
    const { baseUrl } = req.body;
    if (!baseUrl || typeof baseUrl !== 'string' || !baseUrl.startsWith('http')) {
      return res.json({
        connected: false,
        error: 'Invalid URL. Base URL must start with http:// or https://',
      });
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      // Attempt to ping health or base
      const targetUrl = `${baseUrl.replace(/\/$/, '')}/health`;
      let resp;
      try {
        resp = await fetch(targetUrl, { signal: controller.signal });
      } catch {
        resp = await fetch(baseUrl, { signal: controller.signal });
      }
      clearTimeout(timeout);

      if (resp && resp.ok) {
        return res.json({ connected: true, status: resp.status });
      }

      return res.json({
        connected: false,
        error: `Portal server replied with HTTP status ${resp ? resp.status : 'unreachable'}. Connected mode requires a 200 OK health response.`,
      });
    } catch (err: any) {
      return res.json({
        connected: false,
        error: `Unable to reach ${baseUrl}: ${err.message}. Organiser mock portal is not running or unreachable. Staying in MOCK DEMO MODE.`,
      });
    }
  });

  // Vite Integration
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MOOC Registrar AI Agent running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
