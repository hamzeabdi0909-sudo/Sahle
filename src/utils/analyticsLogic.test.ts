import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregateAttendanceTrends,
  aggregateMustawaPerformance,
  aggregateStudentLastSessions,
  formatShortChartDate,
} from './analyticsLogic';
import type { AttendanceRecord, DailyAttendanceBucket, StudentRecord } from '../types/academic';

test('formatShortChartDate converts ISO date into compact label', () => {
  assert.equal(formatShortChartDate('2026-11-10'), 'Nov 10');
  assert.equal(formatShortChartDate('2026-01-05'), 'Jan 5');
});

test('aggregateAttendanceTrends computes sorted rates and respects Mustawa filter', () => {
  const buckets: DailyAttendanceBucket[] = [
    { date: '2026-11-12', mustawa: 'Mustawa 1', presentCount: 3, absentCount: 1 },
    { date: '2026-11-10', mustawa: 'Mustawa 1', presentCount: 4, absentCount: 0 },
    { date: '2026-11-10', mustawa: 'Mustawa 5', presentCount: 1, absentCount: 1 },
  ];

  const allTrend = aggregateAttendanceTrends(buckets, 'ALL');
  assert.equal(allTrend.length, 2);
  assert.equal(allTrend[0].date, '2026-11-10');
  assert.equal(allTrend[0].presentCount, 5);
  assert.equal(allTrend[0].absentCount, 1);
  assert.equal(allTrend[0].attendanceRate, 83.3);

  const m5Trend = aggregateAttendanceTrends(buckets, 'Mustawa 5');
  assert.equal(m5Trend.length, 1);
  assert.equal(m5Trend[0].attendanceRate, 50);
});

test('aggregateMustawaPerformance covers all 8 Mustawa levels accurately', () => {
  const students: StudentRecord[] = [
    {
      id: '10',
      fullName: 'Amina',
      mustawa: 'Mustawa 1',
      email: '',
      phone: '',
      createdAt: '',
      missedClasses: 1,
      totalSessions: 5,
      deductionPercent: 0,
      standing: 'good',
      averageNetScore: 90,
    },
    {
      id: '22',
      fullName: 'Tariq',
      mustawa: 'Mustawa 6',
      email: '',
      phone: '',
      createdAt: '',
      missedClasses: 2,
      totalSessions: 4,
      deductionPercent: 0,
      standing: 'good',
      averageNetScore: 80,
    },
  ];

  const points = aggregateMustawaPerformance(students);
  assert.equal(points.length, 8);
  assert.equal(points[0].shortLabel, 'M1');
  assert.equal(points[0].attendanceRate, 80);
  assert.equal(points[0].avgNetScore, 90);
  assert.equal(points[5].shortLabel, 'M6');
  assert.equal(points[5].attendanceRate, 50);
  assert.equal(points[5].avgNetScore, 80);
  assert.equal(points[7].shortLabel, 'M8');
  assert.equal(points[7].studentCount, 0);
});

test('aggregateStudentLastSessions slices last 10 sessions chronologically and computes rolling rate', () => {
  const records: AttendanceRecord[] = Array.from({ length: 12 }, (_, idx) => {
    const day = String(idx + 1).padStart(2, '0');
    // Reverse input order like DB query (DESC), with index 0 & 1 absent (oldest, excluded by slice(-10))
    // and index 11 (last session) absent
    const status: 'present' | 'absent' =
      idx === 0 || idx === 1 || idx === 11 ? 'absent' : 'present';
    return {
      id: idx + 1,
      studentId: '13',
      date: `2026-11-${day}`,
      course: 'Core Lecture',
      status,
      note: '',
    };
  }).reverse();

  const trend = aggregateStudentLastSessions(records, 10);
  assert.equal(trend.length, 10);
  assert.equal(trend[0].date, '2026-11-03');
  assert.equal(trend[0].attendanceRate, 100);
  assert.equal(trend[8].date, '2026-11-11');
  assert.equal(trend[8].attendanceRate, 100);
  assert.equal(trend[9].date, '2026-11-12');
  assert.equal(trend[9].status, 'absent');
  assert.equal(trend[9].cumulativePresent, 9);
  assert.equal(trend[9].attendanceRate, 90);
});
