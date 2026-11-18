import type { ExamGradeRecord, StudentRecord } from '../types/academic';
import type { SessionAttendanceRow } from './api';

export function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsvString(
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>
): string {
  const headerLine = headers.map(escapeCsvCell).join(',');
  const dataLines = rows.map((row) => row.map(escapeCsvCell).join(','));
  // Prepend UTF-8 BOM so Excel detects Arabic and Somali UTF-8 characters properly
  return `\uFEFF${[headerLine, ...dataLines].join('\r\n')}`;
}

export function buildStudentsCsv(students: StudentRecord[]): string {
  const headers = [
    'Student ID',
    'Full Name',
    'Mustawa',
    'Missed Classes',
    'Total Sessions',
    'Deduction %',
    'Average Net Score',
    'Standing',
    'Email',
    'Phone',
  ];

  const rows = students.map((s) => [
    s.id,
    s.fullName,
    s.mustawa,
    s.missedClasses,
    s.totalSessions,
    `${s.deductionPercent}%`,
    s.averageNetScore !== null ? s.averageNetScore : '-',
    s.standing.toUpperCase(),
    s.email,
    s.phone,
  ]);

  return buildCsvString(headers, rows);
}

export function buildAttendanceCsv(
  rows: SessionAttendanceRow[],
  mustawa: string,
  date: string,
  course: string
): string {
  const headers = [
    'Student ID',
    'Full Name',
    'Mustawa',
    'Date',
    'Course',
    'Status',
    'Total Missed Classes',
    'Penalty Deduction',
    'Note',
  ];

  const data = rows.map((r) => [
    r.studentId,
    r.fullName,
    r.mustawa || mustawa,
    date,
    course,
    r.status.toUpperCase(),
    r.missedClasses,
    `${r.deductionPercent}%`,
    r.note,
  ]);

  return buildCsvString(headers, data);
}

export function buildExamGradesCsv(
  rows: ExamGradeRecord[],
  mustawa: string,
  subject: string
): string {
  const headers = [
    'Student ID',
    'Student Name',
    'Mustawa',
    'Subject',
    'Midterm (30)',
    'Coursework (20)',
    'Final Exam (50)',
    'Gross Score',
    'Missed Classes',
    'Penalty %',
    'Net Score',
    'Grade',
  ];

  const data = rows.map((r) => [
    r.studentId,
    r.studentName || '',
    r.mustawa || mustawa,
    subject,
    r.midterm,
    r.coursework,
    r.finalExam,
    r.grossScore,
    r.missedClasses,
    `${r.deductionPercent}%`,
    r.netScore,
    r.letterGrade,
  ]);

  return buildCsvString(headers, data);
}
