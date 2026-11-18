import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeAttendanceStatus,
  parseBulkAttendanceCsv,
  parseBulkExamCsv,
} from './bulkImportRecords.ts';

test('normalizeAttendanceStatus handles multilingual and shorthand values', () => {
  assert.equal(normalizeAttendanceStatus('present'), 'present');
  assert.equal(normalizeAttendanceStatus('P'), 'present');
  assert.equal(normalizeAttendanceStatus('حاضر'), 'present');
  assert.equal(normalizeAttendanceStatus('jooga'), 'present');
  assert.equal(normalizeAttendanceStatus('absent'), 'absent');
  assert.equal(normalizeAttendanceStatus('A'), 'absent');
  assert.equal(normalizeAttendanceStatus('غائب'), 'absent');
  assert.equal(normalizeAttendanceStatus('maqan'), 'absent');
  assert.equal(normalizeAttendanceStatus('invalid'), null);
});

test('parseBulkAttendanceCsv parses headered multi-date and positional CSV inputs', () => {
  const headered = [
    'Student ID,Date,Course,Status,Note',
    '#13,2026-11-18,Data Structures,absent,Sick leave',
    '14,2026-11-18,Data Structures,present,',
    'bad-row',
  ].join('\n');

  const res1 = parseBulkAttendanceCsv(headered, '2026-11-17', 'Core Lecture');
  assert.equal(res1.entries.length, 2);
  assert.equal(res1.skippedLines, 1);
  assert.deepEqual(res1.entries[0], {
    studentId: '13',
    date: '2026-11-18',
    course: 'Data Structures',
    status: 'absent',
    note: 'Sick leave',
  });

  const positional = [
    '10, absent, Late arrival',
    '11, present',
  ].join('\n');

  const res2 = parseBulkAttendanceCsv(positional, '2026-11-18', 'Core Lecture');
  assert.equal(res2.entries.length, 2);
  assert.equal(res2.entries[0].date, '2026-11-18');
  assert.equal(res2.entries[0].course, 'Core Lecture');
  assert.equal(res2.entries[0].status, 'absent');
  assert.equal(res2.entries[0].note, 'Late arrival');
});

test('parseBulkExamCsv parses headered multi-subject and positional score lines with clamping', () => {
  const headered = [
    'ID,Subject,Midterm,Coursework,Final Exam',
    '13,Data Structures,28,19,46',
    '14,Arabic Syntax & Morphology,35,25,60', // clamped to 30, 20, 50
    '15,Data Structures,abc,15,40',
  ].join('\n');

  const res1 = parseBulkExamCsv(headered, 'Default Subject');
  assert.equal(res1.entries.length, 2);
  assert.equal(res1.skippedLines, 1);
  assert.deepEqual(res1.entries[0], {
    studentId: '13',
    subject: 'Data Structures',
    midterm: 28,
    coursework: 19,
    finalExam: 46,
  });
  assert.deepEqual(res1.entries[1], {
    studentId: '14',
    subject: 'Arabic Syntax & Morphology',
    midterm: 30,
    coursework: 20,
    finalExam: 50,
  });

  const positional = '16, 25, 18, 43';
  const res2 = parseBulkExamCsv(positional, 'Database Systems');
  assert.equal(res2.entries.length, 1);
  assert.deepEqual(res2.entries[0], {
    studentId: '16',
    subject: 'Database Systems',
    midterm: 25,
    coursework: 18,
    finalExam: 43,
  });
});
