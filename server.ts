import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import {
  initDatabase,
  listStudents,
  getStudentLookup,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkImportStudents,
  getAttendanceForSession,
  saveBulkAttendance,
  importBulkAttendanceRecords,
  getExamSpreadsheet,
  listExamSubjects,
  saveBulkExamGrades,
  importBulkExamRecords,
  listAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  promoteStudents,
  listStudyGuides,
  saveStudyGuide,
  getDailyAttendanceBuckets,
} from './src/db/database.ts';
import type { MustawaLevel, ParsedBulkStudent } from './src/utils/academicLogic.ts';

initDatabase();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const role = req.header('x-user-role');
  if (role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: Admin / Teacher role required for modifications.' });
    return;
  }
  next();
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Administrative analytics (daily attendance trends per Mustawa)
app.get('/api/analytics', (_req, res) => {
  const attendanceBuckets = getDailyAttendanceBuckets();
  res.json({ attendanceBuckets });
});

// Students list (admin or directory overview)
app.get('/api/students', (req, res) => {
  const mustawa = typeof req.query.mustawa === 'string' ? req.query.mustawa : undefined;
  const students = listStudents(mustawa);
  res.json({ students });
});

// Student ID Lookup Portal (accessible by both student & admin)
app.get('/api/students/:id', (req, res) => {
  const payload = getStudentLookup(req.params.id);
  if (!payload) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }
  res.json(payload);
});

// Create single student (Admin only)
app.post('/api/students', requireAdmin, (req, res) => {
  try {
    const { id, fullName, mustawa, email, phone } = req.body as {
      id?: string;
      fullName: string;
      mustawa: MustawaLevel;
      email?: string;
      phone?: string;
    };
    if (!fullName || !fullName.trim() || !mustawa) {
      res.status(400).json({ error: 'fullName and mustawa are required.' });
      return;
    }
    const student = createStudent({ id, fullName, mustawa, email, phone });
    res.status(201).json({ student });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to create student' });
  }
});

// Update single student (Admin only)
app.patch('/api/students/:id', requireAdmin, (req, res) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { fullName, mustawa, email, phone } = req.body as {
      fullName: string;
      mustawa: MustawaLevel;
      email?: string;
      phone?: string;
    };
    if (!fullName || !fullName.trim() || !mustawa) {
      res.status(400).json({ error: 'fullName and mustawa are required.' });
      return;
    }
    const student = updateStudent(idParam, { fullName, mustawa, email, phone });
    res.json({ student });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to update student' });
  }
});

// Delete student (Admin only)
app.delete('/api/students/:id', requireAdmin, (req, res) => {
  const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const deleted = deleteStudent(idParam);
  if (!deleted) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }
  res.json({ ok: true });
});

// Bulk import students (Admin only)
app.post('/api/students/bulk', requireAdmin, (req, res) => {
  try {
    const { mustawa, students } = req.body as {
      mustawa: MustawaLevel;
      students: ParsedBulkStudent[];
    };
    if (!mustawa || !Array.isArray(students) || students.length === 0) {
      res.status(400).json({ error: 'mustawa and non-empty students list required.' });
      return;
    }
    const result = bulkImportStudents(mustawa, students);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Bulk import failed' });
  }
});

// Promote students or entire Mustawa (Admin only)
app.post('/api/students/promote', requireAdmin, (req, res) => {
  try {
    const { sourceMustawa, targetMustawa, studentIds } = req.body as {
      sourceMustawa?: MustawaLevel;
      targetMustawa?: MustawaLevel;
      studentIds?: string[];
    };
    const result = promoteStudents({ sourceMustawa, targetMustawa, studentIds });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Promotion failed' });
  }
});

// Attendance session query
app.get('/api/attendance', (req, res) => {
  const mustawa = (typeof req.query.mustawa === 'string' ? req.query.mustawa : 'Mustawa 1') as MustawaLevel;
  const date = typeof req.query.date === 'string' ? req.query.date : new Date().toISOString().slice(0, 10);
  const course = typeof req.query.course === 'string' ? req.query.course : 'Core Lecture';
  const rows = getAttendanceForSession(mustawa, date, course);
  res.json({ rows });
});

// Save bulk attendance (Admin only)
app.post('/api/attendance/bulk', requireAdmin, (req, res) => {
  try {
    const { date, course, entries } = req.body as {
      date: string;
      course: string;
      entries: Array<{ studentId: string; status: 'present' | 'absent'; note?: string }>;
    };
    if (!date || !Array.isArray(entries)) {
      res.status(400).json({ error: 'date and entries are required.' });
      return;
    }
    saveBulkAttendance(date, course || 'Core Lecture', entries);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to save attendance' });
  }
});

// Bulk CSV attendance import across dates & courses (Admin only)
app.post('/api/attendance/bulk-import', requireAdmin, (req, res) => {
  try {
    const { entries } = req.body as {
      entries: Array<{
        studentId: string;
        date: string;
        course: string;
        status: 'present' | 'absent';
        note?: string;
      }>;
    };
    if (!Array.isArray(entries) || entries.length === 0) {
      res.status(400).json({ error: 'Non-empty attendance entries list required.' });
      return;
    }
    const result = importBulkAttendanceRecords(entries);
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(400).json({
      error: err instanceof Error ? err.message : 'Failed to bulk import attendance',
    });
  }
});

// Exam subjects & spreadsheet
app.get('/api/exams/subjects', (_req, res) => {
  res.json({ subjects: listExamSubjects() });
});

app.get('/api/exams', (req, res) => {
  const mustawa = typeof req.query.mustawa === 'string' ? req.query.mustawa : 'ALL';
  const subject = typeof req.query.subject === 'string' ? req.query.subject : 'Data Structures';
  const rows = getExamSpreadsheet(mustawa, subject);
  res.json({ rows });
});

// Save bulk exam grades (Admin only)
app.post('/api/exams/bulk', requireAdmin, (req, res) => {
  try {
    const { subject, entries } = req.body as {
      subject: string;
      entries: Array<{ studentId: string; midterm: number; coursework: number; finalExam: number }>;
    };
    if (!subject || !Array.isArray(entries)) {
      res.status(400).json({ error: 'subject and entries are required.' });
      return;
    }
    saveBulkExamGrades(subject, entries);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to save grades' });
  }
});

// Bulk CSV exam import across subjects (Admin only)
app.post('/api/exams/bulk-import', requireAdmin, (req, res) => {
  try {
    const { entries } = req.body as {
      entries: Array<{
        studentId: string;
        subject: string;
        midterm: number;
        coursework: number;
        finalExam: number;
      }>;
    };
    if (!Array.isArray(entries) || entries.length === 0) {
      res.status(400).json({ error: 'Non-empty exam entries list required.' });
      return;
    }
    const result = importBulkExamRecords(entries);
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(400).json({
      error: err instanceof Error ? err.message : 'Failed to bulk import exam scores',
    });
  }
});

// Announcements
app.get('/api/announcements', (req, res) => {
  const mustawa = typeof req.query.mustawa === 'string' ? req.query.mustawa : undefined;
  const announcements = listAnnouncements(mustawa);
  res.json({ announcements });
});

app.post('/api/announcements', requireAdmin, (req, res) => {
  try {
    const { mustawa, title, body, author } = req.body as {
      mustawa: MustawaLevel;
      title: string;
      body: string;
      author?: string;
    };
    if (!mustawa || !title?.trim() || !body?.trim()) {
      res.status(400).json({ error: 'mustawa, title, and body are required.' });
      return;
    }
    const announcement = createAnnouncement({ mustawa, title, body, author });
    res.status(201).json({ announcement });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to create announcement' });
  }
});

app.delete('/api/announcements/:id', requireAdmin, (req, res) => {
  const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = Number.parseInt(idParam, 10);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: 'Invalid announcement ID' });
    return;
  }
  const deleted = deleteAnnouncement(id);
  if (!deleted) {
    res.status(404).json({ error: 'Announcement not found' });
    return;
  }
  res.json({ ok: true });
});

// Saved AI Study Guides
app.get('/api/study-guides', (_req, res) => {
  res.json({ guides: listStudyGuides() });
});

// AI PDF Study Tool (with high-level Arabic, Somali & English comprehension)
app.post('/api/ai/study-pdf', async (req, res) => {
  try {
    const { pdfBase64, fileName, rawText, outputLanguage, questionCount } = req.body as {
      pdfBase64?: string;
      fileName?: string;
      rawText?: string;
      outputLanguage?: string;
      questionCount?: number;
    };

    if (!pdfBase64 && (!rawText || !rawText.trim())) {
      res.status(400).json({ error: 'Please upload a PDF file or paste lecture notes.' });
      return;
    }

    const ai = getGeminiClient();
    const targetCount = Math.min(12, Math.max(3, Number(questionCount) || 5));
    const langInstruction =
      outputLanguage && outputLanguage !== 'auto'
        ? `Write the entire output (title, summary, keyConcepts, quiz questions, options, and explanations) in ${outputLanguage}.`
        : 'Respond in the primary language of the source document (if the source is in Arabic, respond in rich, scholarly Modern Standard Arabic; if Somali, respond in clear academic Somali; if English, respond in English).';

    const parts: Array<{ inlineData?: { mimeType: string; data: string }; text?: string }> = [];
    if (pdfBase64) {
      parts.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBase64,
        },
      });
    }
    if (rawText && rawText.trim()) {
      parts.push({
        text: `Lecture text / notes:\n${rawText.trim()}`,
      });
    }
    parts.push({
      text: `Analyze this university academic document thoroughly. ${langInstruction}
Generate:
1. A concise academic title.
2. A clear, structured subject summary (3-5 focused paragraphs covering main thesis, definitions, and core mechanisms).
3. 5-8 concise key concepts / takeaways.
4. Exactly ${targetCount} multiple-choice quiz questions with 4 distinct options each, the 0-based correctIndex, and a clear pedagogical explanation for the answer key.`,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: { parts },
      config: {
        systemInstruction:
          'You are a senior university professor and multilingual academic curriculum specialist with expert mastery of Arabic (Classical & Modern Standard Arabic), Somali, and English scholarly texts.',
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            detectedLanguage: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
          required: ['title', 'detectedLanguage', 'summary', 'keyConcepts', 'quiz'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim()) as {
      title: string;
      detectedLanguage: string;
      summary: string;
      keyConcepts: string[];
      quiz: Array<{
        question: string;
        options: string[];
        correctIndex: number;
        explanation: string;
      }>;
    };

    const saved = saveStudyGuide({
      title: parsed.title || fileName || 'Study Summary',
      sourceName: fileName || 'Pasted Lecture Notes',
      language: parsed.detectedLanguage || outputLanguage || 'auto',
      summary: parsed.summary || '',
      keyConcepts: parsed.keyConcepts || [],
      quiz: parsed.quiz || [],
    });

    res.json({ guide: saved });
  } catch (err) {
    console.error('AI Study PDF Error:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to process document with Gemini',
    });
  }
});

// Audio Transcription using gemini-3.5-transcribe
app.post('/api/ai/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType, hintLanguage } = req.body as {
      audioBase64: string;
      mimeType?: string;
      hintLanguage?: string;
    };
    if (!audioBase64) {
      res.status(400).json({ error: 'audioBase64 is required.' });
      return;
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'audio/webm',
              data: audioBase64,
            },
          },
          {
            text: `Transcribe this audio accurately in its original spoken language${hintLanguage ? ` (likely ${hintLanguage})` : ''}. Return only the clean transcription text.`,
          },
        ],
      },
    });

    res.json({ transcript: (response.text ?? '').trim() });
  } catch (err) {
    console.error('Audio Transcription Error:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Audio transcription failed',
    });
  }
});

// AI Announcement Translation / Polish
app.post('/api/ai/translate-notice', requireAdmin, async (req, res) => {
  try {
    const { title, body, targetLanguage } = req.body as {
      title: string;
      body: string;
      targetLanguage: 'en' | 'ar' | 'so';
    };
    if (!title?.trim() && !body?.trim()) {
      res.status(400).json({ error: 'title or body is required.' });
      return;
    }

    const langName = targetLanguage === 'ar' ? 'Arabic' : targetLanguage === 'so' ? 'Somali' : 'English';
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `Translate and professionally polish this university announcement into ${langName}. Always keep the word "Mustawa" untranslated as "Mustawa".
Title: ${title}
Body: ${body}`,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            body: { type: Type.STRING },
          },
          required: ['title', 'body'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim()) as { title: string; body: string };
    res.json(parsed);
  } catch (err) {
    console.error('Notice Translation Error:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to translate announcement',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mustawa Academic Portal server running on http://localhost:${PORT}`);
  });
}

startServer();
