export type MustawaLevel =
  | 'Mustawa 1'
  | 'Mustawa 2'
  | 'Mustawa 3'
  | 'Mustawa 4'
  | 'Mustawa 5'
  | 'Mustawa 6'
  | 'Mustawa 7'
  | 'Mustawa 8'
  | 'Graduated';

export const MUSTAWA_LEVELS: MustawaLevel[] = [
  'Mustawa 1',
  'Mustawa 2',
  'Mustawa 3',
  'Mustawa 4',
  'Mustawa 5',
  'Mustawa 6',
  'Mustawa 7',
  'Mustawa 8',
];

export const ALL_MUSTAWA_OPTIONS: MustawaLevel[] = [
  ...MUSTAWA_LEVELS,
  'Graduated',
];

export interface PenaltyTier {
  minAbsences: number;
  maxAbsences: number | null;
  deductionPercent: number;
  standing: 'good' | 'warning' | 'critical' | 'barred';
}

export const DEFAULT_PENALTY_TIERS: PenaltyTier[] = [
  { minAbsences: 0, maxAbsences: 2, deductionPercent: 0, standing: 'good' },
  { minAbsences: 3, maxAbsences: 4, deductionPercent: 5, standing: 'warning' },
  { minAbsences: 5, maxAbsences: 6, deductionPercent: 10, standing: 'warning' },
  { minAbsences: 7, maxAbsences: 9, deductionPercent: 20, standing: 'critical' },
  { minAbsences: 10, maxAbsences: null, deductionPercent: 30, standing: 'barred' },
];

export interface PenaltyCalculation {
  missedClasses: number;
  deductionPercent: number;
  standing: 'good' | 'warning' | 'critical' | 'barred';
}

/**
 * Computes automated grade deduction percentage based on total missed classes.
 */
export function calculateAttendancePenalty(
  missedClasses: number,
  tiers: PenaltyTier[] = DEFAULT_PENALTY_TIERS
): PenaltyCalculation {
  const safeMissed = Math.max(0, Math.floor(Number.isFinite(missedClasses) ? missedClasses : 0));
  for (const tier of tiers) {
    const withinMin = safeMissed >= tier.minAbsences;
    const withinMax = tier.maxAbsences === null || safeMissed <= tier.maxAbsences;
    if (withinMin && withinMax) {
      return {
        missedClasses: safeMissed,
        deductionPercent: tier.deductionPercent,
        standing: tier.standing,
      };
    }
  }
  const lastTier = tiers[tiers.length - 1];
  return {
    missedClasses: safeMissed,
    deductionPercent: lastTier ? lastTier.deductionPercent : 0,
    standing: lastTier ? lastTier.standing : 'good',
  };
}

export interface ScoreBreakdown {
  midterm: number;
  coursework: number;
  finalExam: number;
  grossScore: number;
  deductionPercent: number;
  deductedPoints: number;
  netScore: number;
  letterGrade: string;
  passed: boolean;
}

export function clampScore(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value * 100) / 100));
}

export function computeNetExamScore(
  midterm: number,
  coursework: number,
  finalExam: number,
  missedClasses: number
): ScoreBreakdown {
  const safeMid = clampScore(midterm, 0, 30);
  const safeCw = clampScore(coursework, 0, 20);
  const safeFinal = clampScore(finalExam, 0, 50);
  const grossScore = Math.round((safeMid + safeCw + safeFinal) * 100) / 100;
  const { deductionPercent } = calculateAttendancePenalty(missedClasses);
  const deductedPoints = Math.round(((grossScore * deductionPercent) / 100) * 100) / 100;
  const netScore = Math.max(0, Math.round((grossScore - deductedPoints) * 100) / 100);

  let letterGrade = 'F';
  if (netScore >= 90) letterGrade = 'A';
  else if (netScore >= 80) letterGrade = 'B';
  else if (netScore >= 70) letterGrade = 'C';
  else if (netScore >= 60) letterGrade = 'D';
  else if (netScore >= 50) letterGrade = 'E';

  return {
    midterm: safeMid,
    coursework: safeCw,
    finalExam: safeFinal,
    grossScore,
    deductionPercent,
    deductedPoints,
    netScore,
    letterGrade,
    passed: netScore >= 50,
  };
}

export interface ParsedBulkStudent {
  studentId?: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface BulkParseResult {
  students: ParsedBulkStudent[];
  skippedLines: number;
}

/**
 * Parses pasted lines or CSV content into student import records.
 * Supports:
 * - "Full Name"
 * - "ID, Full Name"
 * - "ID, Full Name, Email, Phone"
 * - "Full Name, Email"
 * Automatically skips common header rows.
 */
export function parseBulkStudentInput(rawText: string): BulkParseResult {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const students: ParsedBulkStudent[] = [];
  let skippedLines = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parts = splitCsvLine(line).map((p) => p.trim());

    if (parts.length === 0 || parts.every((p) => p === '')) {
      skippedLines++;
      continue;
    }

    // Detect CSV header row on first non-empty line
    if (i === 0) {
      const joined = parts.join(' ').toLowerCase();
      if (
        (joined.includes('name') || joined.includes('الاسم') || joined.includes('magaca')) &&
        (joined.includes('id') || joined.includes('email') || joined.includes('mustawa'))
      ) {
        skippedLines++;
        continue;
      }
    }

    if (parts.length === 1) {
      const name = parts[0];
      if (name.length < 2) {
        skippedLines++;
        continue;
      }
      students.push({
        fullName: name,
        email: '',
        phone: '',
      });
      continue;
    }

    // Check if first column looks like a Student ID (digits or alphanumeric code <= 16 chars without spaces)
    const first = parts[0];
    const looksLikeId = /^[a-zA-Z0-9_-]{1,16}$/.test(first) && /\d/.test(first);

    if (looksLikeId) {
      const fullName = parts[1] || '';
      if (fullName.length < 2) {
        skippedLines++;
        continue;
      }
      students.push({
        studentId: first,
        fullName,
        email: parts[2] || '',
        phone: parts[3] || '',
      });
    } else {
      const fullName = first;
      if (fullName.length < 2) {
        skippedLines++;
        continue;
      }
      students.push({
        fullName,
        email: parts[1] || '',
        phone: parts[2] || '',
      });
    }
  }

  return { students, skippedLines };
}

export function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((ch === ',' || ch === '\t' || ch === ';') && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export function getNextMustawa(current: MustawaLevel): MustawaLevel {
  switch (current) {
    case 'Mustawa 1':
      return 'Mustawa 2';
    case 'Mustawa 2':
      return 'Mustawa 3';
    case 'Mustawa 3':
      return 'Mustawa 4';
    case 'Mustawa 4':
      return 'Mustawa 5';
    case 'Mustawa 5':
      return 'Mustawa 6';
    case 'Mustawa 6':
      return 'Mustawa 7';
    case 'Mustawa 7':
      return 'Mustawa 8';
    case 'Mustawa 8':
    case 'Graduated':
      return 'Graduated';
  }
}

export const GRADE_FAIL_THRESHOLD = 50;
export const GRADE_NEAR_THRESHOLD = 58;
export const HIGH_ABSENCE_WARNING_THRESHOLD = 5;
export const CRITICAL_ABSENCE_THRESHOLD = 7;

export type WarningSeverity = 'critical' | 'warning';
export type WarningReasonCode =
  | 'overall_failing'
  | 'overall_near_threshold'
  | 'exam_failing'
  | 'exam_near_threshold'
  | 'absence_critical'
  | 'absence_high';

export interface StudentWarningItem {
  code: WarningReasonCode;
  severity: WarningSeverity;
  value: number;
  subject?: string;
}

export interface StudentRiskAssessment {
  isAtRisk: boolean;
  highestSeverity: 'none' | 'warning' | 'critical';
  hasLowGradeRisk: boolean;
  hasHighAbsenceRisk: boolean;
  warnings: StudentWarningItem[];
}

export function getExamScoreTier(netScore: number): 'ok' | 'near' | 'failing' {
  if (netScore < GRADE_FAIL_THRESHOLD) return 'failing';
  if (netScore <= GRADE_NEAR_THRESHOLD) return 'near';
  return 'ok';
}

export interface RiskInputStudent {
  missedClasses: number;
  deductionPercent: number;
  standing: 'good' | 'warning' | 'critical' | 'barred';
  averageNetScore: number | null;
  lowestNetScore?: number | null;
  lowestSubject?: string | null;
}

export interface RiskInputExam {
  subject: string;
  netScore: number;
}

/**
 * Evaluates whether a student triggers automatic warning alerts due to:
 * 1) Overall average or individual exam score dropping near/around or below 50% (<= 58%)
 * 2) Reaching high absence limits (>= 5 missed classes / >= 10% deduction, or critical/barred standing)
 */
export function evaluateStudentRisk(
  student: RiskInputStudent,
  exams?: RiskInputExam[]
): StudentRiskAssessment {
  const warnings: StudentWarningItem[] = [];
  let hasLowGradeRisk = false;
  let hasHighAbsenceRisk = false;

  // Check overall average grade
  if (student.averageNetScore !== null) {
    if (student.averageNetScore < GRADE_FAIL_THRESHOLD) {
      hasLowGradeRisk = true;
      warnings.push({
        code: 'overall_failing',
        severity: 'critical',
        value: Math.round(student.averageNetScore * 10) / 10,
      });
    } else if (student.averageNetScore <= GRADE_NEAR_THRESHOLD) {
      hasLowGradeRisk = true;
      warnings.push({
        code: 'overall_near_threshold',
        severity: 'warning',
        value: Math.round(student.averageNetScore * 10) / 10,
      });
    }
  }

  // Check individual exam scores if detailed exams provided, otherwise check lowestNetScore
  if (exams && exams.length > 0) {
    for (const ex of exams) {
      if (ex.netScore < GRADE_FAIL_THRESHOLD) {
        hasLowGradeRisk = true;
        warnings.push({
          code: 'exam_failing',
          severity: 'critical',
          value: Math.round(ex.netScore * 10) / 10,
          subject: ex.subject,
        });
      } else if (ex.netScore <= GRADE_NEAR_THRESHOLD) {
        hasLowGradeRisk = true;
        warnings.push({
          code: 'exam_near_threshold',
          severity: 'warning',
          value: Math.round(ex.netScore * 10) / 10,
          subject: ex.subject,
        });
      }
    }
  } else if (
    student.lowestNetScore !== undefined &&
    student.lowestNetScore !== null
  ) {
    // Only add lowestNetScore warning if it isn't already redundant or gives tighter severity
    if (student.lowestNetScore < GRADE_FAIL_THRESHOLD) {
      hasLowGradeRisk = true;
      if (student.averageNetScore === null || student.averageNetScore >= GRADE_FAIL_THRESHOLD) {
        warnings.push({
          code: 'exam_failing',
          severity: 'critical',
          value: Math.round(student.lowestNetScore * 10) / 10,
          subject: student.lowestSubject || undefined,
        });
      }
    } else if (student.lowestNetScore <= GRADE_NEAR_THRESHOLD) {
      hasLowGradeRisk = true;
      if (student.averageNetScore === null || student.averageNetScore > GRADE_NEAR_THRESHOLD) {
        warnings.push({
          code: 'exam_near_threshold',
          severity: 'warning',
          value: Math.round(student.lowestNetScore * 10) / 10,
          subject: student.lowestSubject || undefined,
        });
      }
    }
  }

  // Check high absence limits
  if (
    student.missedClasses >= CRITICAL_ABSENCE_THRESHOLD ||
    student.standing === 'critical' ||
    student.standing === 'barred'
  ) {
    hasHighAbsenceRisk = true;
    warnings.push({
      code: 'absence_critical',
      severity: 'critical',
      value: student.missedClasses,
    });
  } else if (student.missedClasses >= HIGH_ABSENCE_WARNING_THRESHOLD) {
    hasHighAbsenceRisk = true;
    warnings.push({
      code: 'absence_high',
      severity: 'warning',
      value: student.missedClasses,
    });
  }

  const highestSeverity: 'none' | 'warning' | 'critical' = warnings.some(
    (w) => w.severity === 'critical'
  )
    ? 'critical'
    : warnings.length > 0
    ? 'warning'
    : 'none';

  return {
    isAtRisk: warnings.length > 0,
    highestSeverity,
    hasLowGradeRisk,
    hasHighAbsenceRisk,
    warnings,
  };
}

export interface NextPenaltyThresholdInfo {
  currentDeductionPercent: number;
  nextAbsenceThreshold: number | null;
  nextDeductionPercent: number | null;
  absencesRemaining: number;
}

export function getNextPenaltyThresholdInfo(
  missedClasses: number,
  tiers: PenaltyTier[] = DEFAULT_PENALTY_TIERS
): NextPenaltyThresholdInfo {
  const safeMissed = Math.max(0, Math.floor(Number.isFinite(missedClasses) ? missedClasses : 0));
  const current = calculateAttendancePenalty(safeMissed, tiers);
  const nextTier = tiers.find((tier) => tier.minAbsences > safeMissed);
  if (!nextTier) {
    return {
      currentDeductionPercent: current.deductionPercent,
      nextAbsenceThreshold: null,
      nextDeductionPercent: null,
      absencesRemaining: 0,
    };
  }
  return {
    currentDeductionPercent: current.deductionPercent,
    nextAbsenceThreshold: nextTier.minAbsences,
    nextDeductionPercent: nextTier.deductionPercent,
    absencesRemaining: Math.max(0, nextTier.minAbsences - safeMissed),
  };
}
