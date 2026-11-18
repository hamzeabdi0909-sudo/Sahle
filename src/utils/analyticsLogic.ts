import type { AttendanceRecord, DailyAttendanceBucket, StudentRecord } from '../types/academic';
import { MUSTAWA_LEVELS, type MustawaLevel } from './academicLogic';

export interface AttendanceTrendPoint {
  date: string;
  shortDate: string;
  presentCount: number;
  absentCount: number;
  totalCount: number;
  attendanceRate: number;
}

export interface MustawaPerformancePoint {
  mustawa: MustawaLevel;
  shortLabel: string;
  studentCount: number;
  attendanceRate: number;
  avgNetScore: number;
}

export interface StudentSessionTrendPoint {
  sessionIndex: number;
  sessionLabel: string;
  date: string;
  shortDate: string;
  course: string;
  status: 'present' | 'absent';
  cumulativePresent: number;
  attendanceRate: number;
}

export function formatShortChartDate(isoDate: string): string {
  // Converts "2026-11-10" -> "Nov 10" or keeps compact MM-DD if non-standard
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return isoDate;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIdx = Number.parseInt(match[2], 10) - 1;
  const day = Number.parseInt(match[3], 10);
  if (monthIdx < 0 || monthIdx > 11) return isoDate;
  return `${months[monthIdx]} ${day}`;
}

export function aggregateAttendanceTrends(
  buckets: DailyAttendanceBucket[],
  mustawaFilter: string = 'ALL'
): AttendanceTrendPoint[] {
  const byDate = new Map<string, { present: number; absent: number }>();

  for (const b of buckets) {
    if (mustawaFilter !== 'ALL' && b.mustawa !== mustawaFilter) {
      continue;
    }
    const existing = byDate.get(b.date) || { present: 0, absent: 0 };
    existing.present += b.presentCount;
    existing.absent += b.absentCount;
    byDate.set(b.date, existing);
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => {
      const total = counts.present + counts.absent;
      const rate = total > 0 ? Math.round((counts.present / total) * 1000) / 10 : 100;
      return {
        date,
        shortDate: formatShortChartDate(date),
        presentCount: counts.present,
        absentCount: counts.absent,
        totalCount: total,
        attendanceRate: rate,
      };
    });
}

export function aggregateMustawaPerformance(
  students: StudentRecord[]
): MustawaPerformancePoint[] {
  return MUSTAWA_LEVELS.map((level, idx) => {
    const cohort = students.filter((s) => s.mustawa === level);
    const totalSessions = cohort.reduce((acc, s) => acc + s.totalSessions, 0);
    const totalMissed = cohort.reduce((acc, s) => acc + s.missedClasses, 0);
    const attendanceRate =
      totalSessions > 0
        ? Math.round(((totalSessions - totalMissed) / totalSessions) * 1000) / 10
        : cohort.length > 0
        ? 100
        : 0;

    const scored = cohort.filter((s) => s.averageNetScore !== null);
    const avgNetScore =
      scored.length > 0
        ? Math.round(
            (scored.reduce((acc, s) => acc + (s.averageNetScore || 0), 0) / scored.length) * 10
          ) / 10
        : 0;

    return {
      mustawa: level,
      shortLabel: `M${idx + 1}`,
      studentCount: cohort.length,
      attendanceRate,
      avgNetScore,
    };
  });
}

/**
 * Takes an individual student's attendance records, orders chronologically,
 * slices the last `limit` (default 10) sessions, and computes rolling attendance rate %.
 */
export function aggregateStudentLastSessions(
  records: AttendanceRecord[],
  limit = 10
): StudentSessionTrendPoint[] {
  if (records.length === 0 || limit <= 0) return [];

  const sortedChronological = [...records].sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return a.id - b.id;
  });

  const windowRecords = sortedChronological.slice(-limit);
  let cumulativePresent = 0;

  return windowRecords.map((rec, index) => {
    if (rec.status === 'present') {
      cumulativePresent += 1;
    }
    const sessionIndex = index + 1;
    const attendanceRate = Math.round((cumulativePresent / sessionIndex) * 1000) / 10;

    return {
      sessionIndex,
      sessionLabel: `S${sessionIndex}`,
      date: rec.date,
      shortDate: formatShortChartDate(rec.date),
      course: rec.course,
      status: rec.status,
      cumulativePresent,
      attendanceRate,
    };
  });
}
