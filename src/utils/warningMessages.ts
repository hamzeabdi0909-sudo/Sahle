import type { Translations } from '../i18n/translations';
import type { StudentWarningItem } from './academicLogic';

export function formatWarningMessage(
  t: Translations,
  item: StudentWarningItem,
  deductionPercent: number
): string {
  switch (item.code) {
    case 'overall_failing':
      return t.warnOverallFailing.replace('{score}', item.value.toFixed(1));
    case 'overall_near_threshold':
      return t.warnOverallNear.replace('{score}', item.value.toFixed(1));
    case 'exam_failing':
      return t.warnExamFailing
        .replace('{subject}', item.subject || '')
        .replace('{score}', item.value.toFixed(1));
    case 'exam_near_threshold':
      return t.warnExamNear
        .replace('{subject}', item.subject || '')
        .replace('{score}', item.value.toFixed(1));
    case 'absence_critical':
      return t.warnAbsenceCritical
        .replace('{count}', String(item.value))
        .replace('{deduction}', String(deductionPercent));
    case 'absence_high':
      return t.warnAbsenceHigh
        .replace('{count}', String(item.value))
        .replace('{deduction}', String(deductionPercent));
  }
}
