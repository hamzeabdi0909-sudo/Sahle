import type {
  AnnouncementRecord,
  DailyAttendanceBucket,
  ExamGradeRecord,
  StudentLookupPayload,
  StudentRecord,
  StudyGuideRecord,
} from '../types/academic';
import type { MustawaLevel, ParsedBulkStudent } from './academicLogic';

export type UserRole = 'admin' | 'student';

function buildHeaders(role: UserRole, studentId?: string): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-user-role': role,
  };
  if (studentId) {
    headers['x-student-id'] = studentId;
  }
  return headers;
}

async function handleJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function fetchStudents(mustawa?: string): Promise<StudentRecord[]> {
  const q = mustawa && mustawa !== 'ALL' ? `?mustawa=${encodeURIComponent(mustawa)}` : '';
  const res = await fetch(`/api/students${q}`);
  const data = await handleJson<{ students: StudentRecord[] }>(res);
  return data.students;
}

export async function lookupStudentById(id: string): Promise<StudentLookupPayload> {
  const res = await fetch(`/api/students/${encodeURIComponent(id.trim())}`);
  return handleJson<StudentLookupPayload>(res);
}

export async function fetchAnalyticsBuckets(): Promise<DailyAttendanceBucket[]> {
  const res = await fetch('/api/analytics');
  const data = await handleJson<{ attendanceBuckets: DailyAttendanceBucket[] }>(res);
  return data.attendanceBuckets;
}

export async function createSingleStudent(
  role: UserRole,
  payload: { id?: string; fullName: string; mustawa: MustawaLevel; email?: string; phone?: string }
): Promise<StudentRecord> {
  const res = await fetch('/api/students', {
    method: 'POST',
    headers: buildHeaders(role),
    body: JSON.stringify(payload),
  });
  const data = await handleJson<{ student: StudentRecord }>(res);
  return data.student;
}

export async function updateSingleStudent(
  role: UserRole,
  id: string,
  payload: { fullName: string; mustawa: MustawaLevel; email?: string; phone?: string }
): Promise<StudentRecord> {
  const res = await fetch(`/api/students/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: buildHeaders(role),
    body: JSON.stringify(payload),
  });
  const data = await handleJson<{ student: StudentRecord }>(res);
  return data.student;
}

export async function removeStudent(role: UserRole, id: string): Promise<void> {
  const res = await fetch(`/api/students/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: buildHeaders(role),
  });
  await handleJson<{ ok: boolean }>(res);
}

export async function bulkImportStudentsApi(
  role: UserRole,
  mustawa: MustawaLevel,
  students: ParsedBulkStudent[]
): Promise<{ inserted: number; skippedDuplicates: number }> {
  const res = await fetch('/api/students/bulk', {
    method: 'POST',
    headers: buildHeaders(role),
    body: JSON.stringify({ mustawa, students }),
  });
  return handleJson<{ inserted: number; skippedDuplicates: number }>(res);
}

export async function promoteStudentsApi(
  role: UserRole,
  payload: { sourceMustawa?: MustawaLevel; targetMustawa?: MustawaLevel; studentIds?: string[] }
): Promise<{ promotedCount: number; destinationMustawa: MustawaLevel }> {
  const res = await fetch('/api/students/promote', {
    method: 'POST',
    headers: buildHeaders(role),
    body: JSON.stringify(payload),
  });
  return handleJson<{ promotedCount: number; destinationMustawa: MustawaLevel }>(res);
}

export interface SessionAttendanceRow {
  studentId: string;
  fullName: string;
  mustawa: MustawaLevel;
  missedClasses: number;
  deductionPercent: number;
  status: 'present' | 'absent';
  note: string;
  hasSavedRecord: boolean;
}

export async function fetchAttendanceSession(
  mustawa: MustawaLevel,
  date: string,
  course: string
): Promise<SessionAttendanceRow[]> {
  const params = new URLSearchParams({ mustawa, date, course });
  const res = await fetch(`/api/attendance?${params.toString()}`);
  const data = await handleJson<{ rows: SessionAttendanceRow[] }>(res);
  return data.rows;
}

export async function saveAttendanceBulk(
  role: UserRole,
  date: string,
  course: string,
  entries: Array<{ studentId: string; status: 'present' | 'absent'; note?: string }>
): Promise<void> {
  const res = await fetch('/api/attendance/bulk', {
    method: 'POST',
    headers: buildHeaders(role),
    body: JSON.stringify({ date, course, entries }),
  });
  await handleJson<{ ok: boolean }>(res);
}

export async function bulkImportAttendanceRecords(
  role: UserRole,
  entries: Array<{
    studentId: string;
    date: string;
    course: string;
    status: 'present' | 'absent';
    note?: string;
  }>
): Promise<{ imported: number; unknownIds: string[] }> {
  const res = await fetch('/api/attendance/bulk-import', {
    method: 'POST',
    headers: buildHeaders(role),
    body: JSON.stringify({ entries }),
  });
  return handleJson<{ imported: number; unknownIds: string[] }>(res);
}

export async function fetchExamSubjects(): Promise<string[]> {
  const res = await fetch('/api/exams/subjects');
  const data = await handleJson<{ subjects: string[] }>(res);
  return data.subjects;
}

export async function fetchExamSpreadsheet(mustawa: string, subject: string): Promise<ExamGradeRecord[]> {
  const params = new URLSearchParams({ mustawa, subject });
  const res = await fetch(`/api/exams?${params.toString()}`);
  const data = await handleJson<{ rows: ExamGradeRecord[] }>(res);
  return data.rows;
}

export async function saveExamSpreadsheet(
  role: UserRole,
  subject: string,
  entries: Array<{ studentId: string; midterm: number; coursework: number; finalExam: number }>
): Promise<void> {
  const res = await fetch('/api/exams/bulk', {
    method: 'POST',
    headers: buildHeaders(role),
    body: JSON.stringify({ subject, entries }),
  });
  await handleJson<{ ok: boolean }>(res);
}

export async function bulkImportExamRecords(
  role: UserRole,
  entries: Array<{
    studentId: string;
    subject: string;
    midterm: number;
    coursework: number;
    finalExam: number;
  }>
): Promise<{ imported: number; unknownIds: string[] }> {
  const res = await fetch('/api/exams/bulk-import', {
    method: 'POST',
    headers: buildHeaders(role),
    body: JSON.stringify({ entries }),
  });
  return handleJson<{ imported: number; unknownIds: string[] }>(res);
}

export async function fetchAnnouncements(mustawa?: string): Promise<AnnouncementRecord[]> {
  const q = mustawa && mustawa !== 'ALL' ? `?mustawa=${encodeURIComponent(mustawa)}` : '';
  const res = await fetch(`/api/announcements${q}`);
  const data = await handleJson<{ announcements: AnnouncementRecord[] }>(res);
  return data.announcements;
}

export async function createAnnouncementApi(
  role: UserRole,
  payload: { mustawa: MustawaLevel; title: string; body: string; author?: string }
): Promise<AnnouncementRecord> {
  const res = await fetch('/api/announcements', {
    method: 'POST',
    headers: buildHeaders(role),
    body: JSON.stringify(payload),
  });
  const data = await handleJson<{ announcement: AnnouncementRecord }>(res);
  return data.announcement;
}

export async function deleteAnnouncementApi(role: UserRole, id: number): Promise<void> {
  const res = await fetch(`/api/announcements/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(role),
  });
  await handleJson<{ ok: boolean }>(res);
}

export async function fetchStudyGuides(): Promise<StudyGuideRecord[]> {
  const res = await fetch('/api/study-guides');
  const data = await handleJson<{ guides: StudyGuideRecord[] }>(res);
  return data.guides;
}

export async function generateStudyGuideApi(payload: {
  pdfBase64?: string;
  fileName?: string;
  rawText?: string;
  outputLanguage?: string;
  questionCount?: number;
}): Promise<StudyGuideRecord> {
  const res = await fetch('/api/ai/study-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await handleJson<{ guide: StudyGuideRecord }>(res);
  return data.guide;
}

export async function transcribeAudioApi(payload: {
  audioBase64: string;
  mimeType: string;
  hintLanguage?: string;
}): Promise<string> {
  const res = await fetch('/api/ai/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await handleJson<{ transcript: string }>(res);
  return data.transcript;
}

export async function translateNoticeApi(
  role: UserRole,
  payload: { title: string; body: string; targetLanguage: 'en' | 'ar' | 'so' }
): Promise<{ title: string; body: string }> {
  const res = await fetch('/api/ai/translate-notice', {
    method: 'POST',
    headers: buildHeaders(role),
    body: JSON.stringify(payload),
  });
  return handleJson<{ title: string; body: string }>(res);
}
