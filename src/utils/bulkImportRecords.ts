import { clampScore, splitCsvLine } from './academicLogic.ts';

export interface ParsedBulkAttendanceEntry {
  studentId: string;
  date: string;
  course: string;
  status: 'present' | 'absent';
  note: string;
}

export interface BulkAttendanceParseResult {
  entries: ParsedBulkAttendanceEntry[];
  skippedLines: number;
}

export interface ParsedBulkExamEntry {
  studentId: string;
  subject: string;
  midterm: number;
  coursework: number;
  finalExam: number;
}

export interface BulkExamParseResult {
  entries: ParsedBulkExamEntry[];
  skippedLines: number;
}

function normalizeStudentId(raw: string): string {
  return raw.trim().replace(/^#/, '').trim();
}

export function normalizeAttendanceStatus(raw: string): 'present' | 'absent' | null {
  const val = raw.trim().toLowerCase();
  if (
    val === 'present' ||
    val === 'p' ||
    val === '1' ||
    val === 'yes' ||
    val === 'حاضر' ||
    val === 'jooga'
  ) {
    return 'present';
  }
  if (
    val === 'absent' ||
    val === 'a' ||
    val === '0' ||
    val === 'no' ||
    val === 'غائب' ||
    val === 'maqan'
  ) {
    return 'absent';
  }
  return null;
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

/**
 * Parses CSV or pasted bulk attendance rows.
 * Header-aware and positional formats supported:
 * - Header columns: ID/Student ID, Date (optional), Course (optional), Status, Note (optional)
 * - Positional:
 *   - "ID, status"
 *   - "ID, status, note"
 *   - "ID, date, status[, note]"
 *   - "ID, date, course, status[, note]"
 */
export function parseBulkAttendanceCsv(
  rawText: string,
  defaultDate: string,
  defaultCourse: string
): BulkAttendanceParseResult {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const entries: ParsedBulkAttendanceEntry[] = [];
  let skippedLines = 0;

  if (lines.length === 0) {
    return { entries, skippedLines };
  }

  const firstParts = splitCsvLine(lines[0]).map((p) => p.trim().toLowerCase());
  const hasHeader =
    firstParts.some((p) => p.includes('status') || p.includes('الحالة') || p.includes('xaaladda')) &&
    firstParts.some((p) => p === 'id' || p.includes('student') || p.includes('الرقم'));

  let idIdx = 0;
  let dateIdx = -1;
  let courseIdx = -1;
  let statusIdx = 1;
  let noteIdx = -1;

  if (hasHeader) {
    idIdx = firstParts.findIndex((p) => p === 'id' || p.includes('student') || p.includes('الرقم'));
    dateIdx = firstParts.findIndex((p) => p.includes('date') || p.includes('التاريخ') || p.includes('taariikh'));
    courseIdx = firstParts.findIndex((p) => p.includes('course') || p.includes('subject') || p.includes('المادة') || p.includes('maaddo'));
    statusIdx = firstParts.findIndex((p) => p.includes('status') || p.includes('الحالة') || p.includes('xaaladda'));
    noteIdx = firstParts.findIndex((p) => p.includes('note') || p.includes('ملاحظة'));
  }

  const startIndex = hasHeader ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const parts = splitCsvLine(lines[i]).map((p) => p.trim());
    if (parts.length < 2) {
      skippedLines++;
      continue;
    }

    if (hasHeader) {
      const studentId = normalizeStudentId(parts[idIdx] || '');
      const status = normalizeAttendanceStatus(parts[statusIdx] || '');
      if (!studentId || !status) {
        skippedLines++;
        continue;
      }
      const rawDate = dateIdx >= 0 ? (parts[dateIdx] || '').trim() : '';
      const rawCourse = courseIdx >= 0 ? (parts[courseIdx] || '').trim() : '';
      const note = noteIdx >= 0 ? (parts[noteIdx] || '').trim() : '';
      entries.push({
        studentId,
        date: isIsoDate(rawDate) ? rawDate : defaultDate,
        course: rawCourse || defaultCourse,
        status,
        note,
      });
      continue;
    }

    // Positional parsing
    const studentId = normalizeStudentId(parts[0]);
    if (!studentId) {
      skippedLines++;
      continue;
    }

    const col1Status = normalizeAttendanceStatus(parts[1]);
    if (col1Status) {
      entries.push({
        studentId,
        date: defaultDate,
        course: defaultCourse,
        status: col1Status,
        note: (parts[2] || '').trim(),
      });
      continue;
    }

    if (parts.length >= 3 && isIsoDate(parts[1])) {
      const col2Status = normalizeAttendanceStatus(parts[2]);
      if (col2Status) {
        entries.push({
          studentId,
          date: parts[1].trim(),
          course: defaultCourse,
          status: col2Status,
          note: (parts[3] || '').trim(),
        });
        continue;
      }
      if (parts.length >= 4) {
        const col3Status = normalizeAttendanceStatus(parts[3]);
        if (col3Status) {
          entries.push({
            studentId,
            date: parts[1].trim(),
            course: (parts[2] || '').trim() || defaultCourse,
            status: col3Status,
            note: (parts[4] || '').trim(),
          });
          continue;
        }
      }
    }

    skippedLines++;
  }

  return { entries, skippedLines };
}

/**
 * Parses CSV or pasted bulk exam score rows.
 * Header-aware and positional formats supported:
 * - Header columns: ID/Student ID, Subject (optional), Midterm, Coursework, Final/Final Exam
 * - Positional:
 *   - "ID, midterm, coursework, finalExam"
 *   - "ID, subject, midterm, coursework, finalExam"
 */
export function parseBulkExamCsv(
  rawText: string,
  defaultSubject: string
): BulkExamParseResult {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const entries: ParsedBulkExamEntry[] = [];
  let skippedLines = 0;

  if (lines.length === 0) {
    return { entries, skippedLines };
  }

  const firstParts = splitCsvLine(lines[0]).map((p) => p.trim().toLowerCase());
  const hasHeader =
    firstParts.some((p) => p.includes('midterm') || p.includes('final') || p.includes('coursework')) &&
    firstParts.some((p) => p === 'id' || p.includes('student') || p.includes('الرقم'));

  let idIdx = 0;
  let subjectIdx = -1;
  let midIdx = 1;
  let cwIdx = 2;
  let finIdx = 3;

  if (hasHeader) {
    idIdx = firstParts.findIndex((p) => p === 'id' || p.includes('student') || p.includes('الرقم'));
    subjectIdx = firstParts.findIndex((p) => p.includes('subject') || p.includes('course') || p.includes('المادة') || p.includes('maaddo'));
    midIdx = firstParts.findIndex((p) => p.includes('mid'));
    cwIdx = firstParts.findIndex((p) => p.includes('coursework') || p.includes('work') || p.includes('cw'));
    finIdx = firstParts.findIndex((p) => p.includes('final'));
  }

  const startIndex = hasHeader ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const parts = splitCsvLine(lines[i]).map((p) => p.trim());
    if (parts.length < 4) {
      skippedLines++;
      continue;
    }

    if (hasHeader) {
      const studentId = normalizeStudentId(parts[idIdx] || '');
      const midVal = midIdx >= 0 ? Number.parseFloat(parts[midIdx] || '') : 0;
      const cwVal = cwIdx >= 0 ? Number.parseFloat(parts[cwIdx] || '') : 0;
      const finVal = finIdx >= 0 ? Number.parseFloat(parts[finIdx] || '') : 0;

      if (!studentId || !Number.isFinite(midVal) || !Number.isFinite(cwVal) || !Number.isFinite(finVal)) {
        skippedLines++;
        continue;
      }

      const rawSubj = subjectIdx >= 0 ? (parts[subjectIdx] || '').trim() : '';
      entries.push({
        studentId,
        subject: rawSubj || defaultSubject,
        midterm: clampScore(midVal, 0, 30),
        coursework: clampScore(cwVal, 0, 20),
        finalExam: clampScore(finVal, 0, 50),
      });
      continue;
    }

    // Positional parsing
    const studentId = normalizeStudentId(parts[0]);
    if (!studentId) {
      skippedLines++;
      continue;
    }

    const col1Num = Number.parseFloat(parts[1]);
    if (Number.isFinite(col1Num) && /^\d+(\.\d+)?$/.test(parts[1])) {
      const midVal = col1Num;
      const cwVal = Number.parseFloat(parts[2]);
      const finVal = Number.parseFloat(parts[3]);
      if (!Number.isFinite(cwVal) || !Number.isFinite(finVal)) {
        skippedLines++;
        continue;
      }
      entries.push({
        studentId,
        subject: defaultSubject,
        midterm: clampScore(midVal, 0, 30),
        coursework: clampScore(cwVal, 0, 20),
        finalExam: clampScore(finVal, 0, 50),
      });
    } else if (parts.length >= 5) {
      const subj = parts[1].trim() || defaultSubject;
      const midVal = Number.parseFloat(parts[2]);
      const cwVal = Number.parseFloat(parts[3]);
      const finVal = Number.parseFloat(parts[4]);
      if (!Number.isFinite(midVal) || !Number.isFinite(cwVal) || !Number.isFinite(finVal)) {
        skippedLines++;
        continue;
      }
      entries.push({
        studentId,
        subject: subj,
        midterm: clampScore(midVal, 0, 30),
        coursework: clampScore(cwVal, 0, 20),
        finalExam: clampScore(finVal, 0, 50),
      });
    } else {
      skippedLines++;
    }
  }

  return { entries, skippedLines };
}
