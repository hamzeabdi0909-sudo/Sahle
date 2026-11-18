import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAttendancePenalty,
  computeNetExamScore,
  evaluateStudentRisk,
  getExamScoreTier,
  getNextMustawa,
  getNextPenaltyThresholdInfo,
  parseBulkStudentInput,
} from './academicLogic';

test('calculateAttendancePenalty returns accurate deduction tiers', () => {
  assert.deepEqual(calculateAttendancePenalty(0), {
    missedClasses: 0,
    deductionPercent: 0,
    standing: 'good',
  });
  assert.deepEqual(calculateAttendancePenalty(2), {
    missedClasses: 2,
    deductionPercent: 0,
    standing: 'good',
  });
  assert.deepEqual(calculateAttendancePenalty(3), {
    missedClasses: 3,
    deductionPercent: 5,
    standing: 'warning',
  });
  assert.deepEqual(calculateAttendancePenalty(5), {
    missedClasses: 5,
    deductionPercent: 10,
    standing: 'warning',
  });
  assert.deepEqual(calculateAttendancePenalty(8), {
    missedClasses: 8,
    deductionPercent: 20,
    standing: 'critical',
  });
  assert.deepEqual(calculateAttendancePenalty(11), {
    missedClasses: 11,
    deductionPercent: 30,
    standing: 'barred',
  });
  // Negative values clamp safely to 0
  assert.equal(calculateAttendancePenalty(-4).missedClasses, 0);
});

test('computeNetExamScore applies automated penalty deduction and letter grade', () => {
  // Gross: 25 + 18 + 42 = 85; 5 missed classes => 10% deduction => 8.5 pts deducted => net 76.5 (C)
  const result = computeNetExamScore(25, 18, 42, 5);
  assert.equal(result.grossScore, 85);
  assert.equal(result.deductionPercent, 10);
  assert.equal(result.deductedPoints, 8.5);
  assert.equal(result.netScore, 76.5);
  assert.equal(result.letterGrade, 'C');
  assert.equal(result.passed, true);

  // Clamping above component maxes
  const clamped = computeNetExamScore(40, 25, 60, 0);
  assert.equal(clamped.grossScore, 100);
  assert.equal(clamped.letterGrade, 'A');
});

test('parseBulkStudentInput parses CSV with headers, IDs, and plain name lists', () => {
  const input = `
ID, Full Name, Email, Phone
101, Amina Yusuf Hassan, amina@uni.edu, +252615001122
102, "Omar, Khalid", omar@uni.edu, +252615003344
Fatima Abdi Nur
  `;
  const parsed = parseBulkStudentInput(input);
  assert.equal(parsed.skippedLines, 1);
  assert.equal(parsed.students.length, 3);
  assert.deepEqual(parsed.students[0], {
    studentId: '101',
    fullName: 'Amina Yusuf Hassan',
    email: 'amina@uni.edu',
    phone: '+252615001122',
  });
  assert.equal(parsed.students[1].fullName, 'Omar, Khalid');
  assert.equal(parsed.students[2].fullName, 'Fatima Abdi Nur');
  assert.equal(parsed.students[2].studentId, undefined);
});

test('getNextMustawa advances Mustawa levels cleanly', () => {
  assert.equal(getNextMustawa('Mustawa 1'), 'Mustawa 2');
  assert.equal(getNextMustawa('Mustawa 2'), 'Mustawa 3');
  assert.equal(getNextMustawa('Mustawa 3'), 'Mustawa 4');
  assert.equal(getNextMustawa('Mustawa 4'), 'Mustawa 5');
  assert.equal(getNextMustawa('Mustawa 5'), 'Mustawa 6');
  assert.equal(getNextMustawa('Mustawa 6'), 'Mustawa 7');
  assert.equal(getNextMustawa('Mustawa 7'), 'Mustawa 8');
  assert.equal(getNextMustawa('Mustawa 8'), 'Graduated');
  assert.equal(getNextMustawa('Graduated'), 'Graduated');
});

test('evaluateStudentRisk flags grades near/below 50% and high absence limits', () => {
  // Healthy student
  const ok = evaluateStudentRisk(
    { missedClasses: 1, deductionPercent: 0, standing: 'good', averageNetScore: 86 },
    [{ subject: 'Math', netScore: 86 }]
  );
  assert.equal(ok.isAtRisk, false);
  assert.equal(ok.highestSeverity, 'none');

  // Good attendance, but failing exam (< 50%) and overall at 50% threshold
  const gradeRisk = evaluateStudentRisk(
    { missedClasses: 1, deductionPercent: 0, standing: 'good', averageNetScore: 50 },
    [
      { subject: 'Systems', netScore: 47 },
      { subject: 'Ethics', netScore: 53 },
    ]
  );
  assert.equal(gradeRisk.isAtRisk, true);
  assert.equal(gradeRisk.highestSeverity, 'critical');
  assert.equal(gradeRisk.hasLowGradeRisk, true);
  assert.equal(gradeRisk.hasHighAbsenceRisk, false);
  assert.ok(gradeRisk.warnings.some((w) => w.code === 'overall_near_threshold'));
  assert.ok(gradeRisk.warnings.some((w) => w.code === 'exam_failing' && w.subject === 'Systems'));

  // High absences (5) with solid grades
  const absenceWarn = evaluateStudentRisk({
    missedClasses: 5,
    deductionPercent: 10,
    standing: 'warning',
    averageNetScore: 72,
  });
  assert.equal(absenceWarn.isAtRisk, true);
  assert.equal(absenceWarn.highestSeverity, 'warning');
  assert.equal(absenceWarn.hasHighAbsenceRisk, true);

  // Exam score tier helper
  assert.equal(getExamScoreTier(49.5), 'failing');
  assert.equal(getExamScoreTier(50), 'near');
  assert.equal(getExamScoreTier(58), 'near');
  assert.equal(getExamScoreTier(58.5), 'ok');
});

test('getNextPenaltyThresholdInfo reports next absence tier accurately', () => {
  assert.deepEqual(getNextPenaltyThresholdInfo(1), {
    currentDeductionPercent: 0,
    nextAbsenceThreshold: 3,
    nextDeductionPercent: 5,
    absencesRemaining: 2,
  });
  assert.deepEqual(getNextPenaltyThresholdInfo(4), {
    currentDeductionPercent: 5,
    nextAbsenceThreshold: 5,
    nextDeductionPercent: 10,
    absencesRemaining: 1,
  });
  assert.deepEqual(getNextPenaltyThresholdInfo(10), {
    currentDeductionPercent: 30,
    nextAbsenceThreshold: null,
    nextDeductionPercent: null,
    absencesRemaining: 0,
  });
});
