import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ExamGradeRecord, StudentRecord } from '../types/academic';
import type { SessionAttendanceRow } from './api';
import {
  buildAttendanceCsv,
  buildExamGradesCsv,
  buildStudentsCsv,
} from './csvExport';

function triggerCsvDownload(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportStudentsDirectoryCsv(students: StudentRecord[], mustawaLabel: string) {
  const csv = buildStudentsCsv(students);
  const safeName = mustawaLabel.replace(/\s+/g, '_');
  triggerCsvDownload(csv, `Mustawa_Students_${safeName}.csv`);
}

export function exportAttendanceCsv(
  rows: SessionAttendanceRow[],
  mustawa: string,
  date: string,
  course: string
) {
  const csv = buildAttendanceCsv(rows, mustawa, date, course);
  triggerCsvDownload(csv, `Attendance_${mustawa.replace(/\s+/g, '_')}_${date}.csv`);
}

export function exportExamGradesCsv(rows: ExamGradeRecord[], mustawa: string, subject: string) {
  const csv = buildExamGradesCsv(rows, mustawa, subject);
  triggerCsvDownload(
    csv,
    `Grades_${subject.replace(/\s+/g, '_')}_${mustawa.replace(/\s+/g, '_')}.csv`
  );
}

export function exportStudentsDirectoryExcel(students: StudentRecord[], mustawaLabel: string) {
  const rows = students.map((s) => ({
    'Student ID': s.id,
    'Full Name': s.fullName,
    Mustawa: s.mustawa,
    'Missed Classes': s.missedClasses,
    'Total Sessions': s.totalSessions,
    'Deduction %': `${s.deductionPercent}%`,
    'Average Net Score': s.averageNetScore !== null ? s.averageNetScore : '-',
    Standing: s.standing.toUpperCase(),
    Email: s.email,
    Phone: s.phone,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Students');
  const safeName = mustawaLabel.replace(/\s+/g, '_');
  XLSX.writeFile(wb, `Mustawa_Students_${safeName}.xlsx`);
}

export function exportStudentsDirectoryPdf(students: StudentRecord[], mustawaLabel: string) {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(15);
  doc.text(`Mustawa Academic Portal — Student Attendance & Standing (${mustawaLabel})`, 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toISOString().slice(0, 10)} · Total Students: ${students.length}`, 14, 23);

  autoTable(doc, {
    startY: 28,
    head: [['ID', 'Full Name', 'Mustawa', 'Missed', 'Deduction', 'Avg Net', 'Standing']],
    body: students.map((s) => [
      s.id,
      s.fullName,
      s.mustawa,
      String(s.missedClasses),
      `${s.deductionPercent}%`,
      s.averageNetScore !== null ? String(s.averageNetScore) : '-',
      s.standing.toUpperCase(),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [15, 76, 129] },
  });

  const safeName = mustawaLabel.replace(/\s+/g, '_');
  doc.save(`Mustawa_Students_${safeName}.pdf`);
}

export function exportAttendanceExcel(
  rows: SessionAttendanceRow[],
  mustawa: string,
  date: string,
  course: string
) {
  const data = rows.map((r) => ({
    'Student ID': r.studentId,
    'Full Name': r.fullName,
    Mustawa: r.mustawa,
    Date: date,
    Course: course,
    Status: r.status.toUpperCase(),
    'Total Missed Classes': r.missedClasses,
    'Penalty Deduction': `${r.deductionPercent}%`,
    Note: r.note,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
  XLSX.writeFile(wb, `Attendance_${mustawa.replace(/\s+/g, '_')}_${date}.xlsx`);
}

export function exportAttendancePdf(
  rows: SessionAttendanceRow[],
  mustawa: string,
  date: string,
  course: string
) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(`Official Attendance Sheet — ${mustawa}`, 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`Course: ${course} · Date: ${date}`, 14, 23);

  autoTable(doc, {
    startY: 28,
    head: [['ID', 'Student Name', 'Status', 'Total Missed', 'Penalty']],
    body: rows.map((r) => [
      r.studentId,
      r.fullName,
      r.status.toUpperCase(),
      String(r.missedClasses),
      `${r.deductionPercent}%`,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [15, 76, 129] },
  });

  doc.save(`Attendance_${mustawa.replace(/\s+/g, '_')}_${date}.pdf`);
}

export function exportExamGradesExcel(rows: ExamGradeRecord[], mustawa: string, subject: string) {
  const data = rows.map((r) => ({
    'Student ID': r.studentId,
    'Student Name': r.studentName || '',
    Mustawa: r.mustawa || mustawa,
    Subject: subject,
    'Midterm (30)': r.midterm,
    'Coursework (20)': r.coursework,
    'Final Exam (50)': r.finalExam,
    'Gross Score': r.grossScore,
    'Missed Classes': r.missedClasses,
    'Penalty %': `${r.deductionPercent}%`,
    'Net Score': r.netScore,
    Grade: r.letterGrade,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Exam Grades');
  XLSX.writeFile(wb, `Grades_${subject.replace(/\s+/g, '_')}_${mustawa.replace(/\s+/g, '_')}.xlsx`);
}

export function exportExamGradesPdf(rows: ExamGradeRecord[], mustawa: string, subject: string) {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(14);
  doc.text(`Official Exam Grade Report — ${subject}`, 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`Level: ${mustawa} · Date: ${new Date().toISOString().slice(0, 10)}`, 14, 23);

  autoTable(doc, {
    startY: 28,
    head: [['ID', 'Name', 'Mustawa', 'Mid (30)', 'CW (20)', 'Final (50)', 'Gross', 'Penalty', 'Net', 'Grade']],
    body: rows.map((r) => [
      r.studentId,
      r.studentName || '',
      r.mustawa || mustawa,
      String(r.midterm),
      String(r.coursework),
      String(r.finalExam),
      String(r.grossScore),
      `${r.deductionPercent}%`,
      String(r.netScore),
      r.letterGrade,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [15, 76, 129] },
  });

  doc.save(`Grades_${subject.replace(/\s+/g, '_')}_${mustawa.replace(/\s+/g, '_')}.pdf`);
}
