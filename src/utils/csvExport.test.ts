import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAttendanceCsv,
  buildStudentsCsv,
  escapeCsvCell,
} from './csvExport';

test('escapeCsvCell quotes commas, quotes, and newlines per RFC 4180', () => {
  assert.equal(escapeCsvCell('plain'), 'plain');
  assert.equal(escapeCsvCell('Hassan, Omar'), '"Hassan, Omar"');
  assert.equal(escapeCsvCell('Say "Hi"'), '"Say ""Hi"""');
  assert.equal(escapeCsvCell('Line 1\nLine 2'), '"Line 1\nLine 2"');
  assert.equal(escapeCsvCell(null), '');
});

test('buildStudentsCsv serializes displayed student records with UTF-8 BOM', () => {
  const csv = buildStudentsCsv([
    {
      id: '13',
      fullName: 'Abdirahman, Warsame',
      mustawa: 'Mustawa 2',
      email: 'abdi@mustawa.edu',
      phone: '+252610000',
      missedClasses: 4,
      totalSessions: 12,
      deductionPercent: 5,
      standing: 'warning',
      averageNetScore: 83.3,
      createdAt: '2026-11-01T00:00:00Z',
    },
  ]);

  assert.equal(csv.startsWith('\uFEFF'), true);
  const lines = csv.slice(1).split('\r\n');
  assert.equal(lines.length, 2);
  assert.match(lines[0], /^Student ID,Full Name,Mustawa/);
  assert.equal(
    lines[1],
    '13,"Abdirahman, Warsame",Mustawa 2,4,12,5%,83.3,WARNING,abdi@mustawa.edu,+252610000'
  );
});

test('buildAttendanceCsv serializes attendance report rows accurately', () => {
  const csv = buildAttendanceCsv(
    [
      {
        studentId: '10',
        fullName: 'Amina Yusuf',
        mustawa: 'Mustawa 1',
        missedClasses: 1,
        deductionPercent: 0,
        status: 'absent',
        note: 'Excused, medical',
        hasSavedRecord: true,
      },
    ],
    'Mustawa 1',
    '2026-11-18',
    'Arabic Syntax'
  );

  const lines = csv.slice(1).split('\r\n');
  assert.equal(lines.length, 2);
  assert.equal(
    lines[1],
    '10,Amina Yusuf,Mustawa 1,2026-11-18,Arabic Syntax,ABSENT,1,0%,"Excused, medical"'
  );
});
