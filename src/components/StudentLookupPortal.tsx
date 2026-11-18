import { useEffect, useState } from 'react';
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Printer,
  Megaphone,
  Lock,
} from 'lucide-react';
import type { Translations } from '../i18n/translations';
import type { StudentLookupPayload } from '../types/academic';
import {
  DEFAULT_PENALTY_TIERS,
  evaluateStudentRisk,
  getExamScoreTier,
  getNextPenaltyThresholdInfo,
} from '../utils/academicLogic';
import { formatWarningMessage } from '../utils/warningMessages';
import { lookupStudentById } from '../utils/api';
import { PrintOfficialHeader, PrintSignatureFooter } from './PrintOfficialChrome';
import { StudentAttendanceChart } from './StudentAttendanceChart';

interface StudentLookupPortalProps {
  t: Translations;
  initialStudentId?: string;
  readOnlyStudentMode?: boolean;
}

export function StudentLookupPortal({
  t,
  initialStudentId = '13',
  readOnlyStudentMode = false,
}: StudentLookupPortalProps) {
  const [queryId, setQueryId] = useState(initialStudentId);
  const [payload, setPayload] = useState<StudentLookupPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runLookup(idToSearch: string) {
    const clean = idToSearch.trim();
    if (!clean) return;
    setLoading(true);
    setError(null);
    try {
      const data = await lookupStudentById(clean);
      setPayload(data);
    } catch {
      setPayload(null);
      setError(t.studentNotFound);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setQueryId(initialStudentId);
    runLookup(initialStudentId);
  }, [initialStudentId]);

  function renderStanding(standing: 'good' | 'warning' | 'critical' | 'barred') {
    if (standing === 'good') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{t.standingGood}</span>
        </span>
      );
    }
    if (standing === 'warning') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{t.standingWarning}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700">
        <XCircle className="w-4 h-4 shrink-0" />
        <span>{standing === 'barred' ? t.standingBarred : t.standingCritical}</span>
      </span>
    );
  }

  const risk = payload ? evaluateStudentRisk(payload.student, payload.exams) : null;
  const penaltyInfo = payload
    ? getNextPenaltyThresholdInfo(payload.student.missedClasses)
    : null;

  return (
    <div className="space-y-6">
      {payload && (
        <PrintOfficialHeader
          t={t}
          reportTitle={`${t.examTranscript} — ${payload.student.fullName}`}
          metadataItems={[
            `ID #${payload.student.id}`,
            payload.student.mustawa,
            `${t.missedClassesCount}: ${payload.student.missedClasses}/${payload.student.totalSessions}`,
            `${t.automatedDeduction}: -${payload.student.deductionPercent}%`,
          ]}
        />
      )}

      {/* Header & Search Bar */}
      <div className="no-print bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-semibold text-stone-900">
              {readOnlyStudentMode ? t.studentPortal : t.searchPortalTitle}
            </h2>
            <p className="text-sm text-stone-600">
              {readOnlyStudentMode ? t.studentPortalDesc : t.searchPortalDesc}
            </p>
          </div>
          {payload && (
            <button
              type="button"
              onClick={() => window.print()}
              className="no-print inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.printTranscript}</span>
            </button>
          )}
        </div>

        {readOnlyStudentMode ? (
          <div className="flex items-center gap-2 text-xs font-medium text-stone-600 bg-stone-50 border border-stone-200 rounded-md px-3.5 py-2.5">
            <Lock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <span>{t.readOnlyNotice}</span>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runLookup(queryId);
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
              <input
                type="text"
                aria-label={t.colId}
                value={queryId}
                onChange={(e) => setQueryId(e.target.value)}
                placeholder={t.enterStudentIdPlaceholder}
                className="w-full ps-10 pe-4 py-2.5 text-sm font-mono bg-stone-50/40 border border-stone-300 rounded-md text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-900 rounded-md hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0"
            >
              {loading ? t.loading : t.searchButton}
            </button>

            <div className="flex items-center gap-2 text-xs text-stone-500 ps-1">
              <span>{t.quickExamples}</span>
              {['13', '19', '30', '10'].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setQueryId(sample);
                    runLookup(sample);
                  }}
                  className="font-mono text-emerald-900 underline underline-offset-2 hover:text-emerald-700 px-1 py-1"
                >
                  #{sample}
                </button>
              ))}
            </div>
          </form>
        )}

        {error && (
          <div className="text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-4 py-3">
            {error}
          </div>
        )}
      </div>

      {/* Student Profile & Breakdown */}
      {payload && risk && (
        <div className="space-y-6">
          {/* Automatic Academic Warning Notification Banner */}
          {risk.isAtRisk && (
            <div
              role="alert"
              className={`rounded-lg border p-5 space-y-2.5 ${
                risk.highestSeverity === 'critical'
                  ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                  : 'bg-amber-50/90 border-amber-300 text-amber-950'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle
                    className={`w-5 h-5 shrink-0 ${
                      risk.highestSeverity === 'critical' ? 'text-rose-700' : 'text-amber-700'
                    }`}
                  />
                  <h3 className="font-display text-base font-bold">
                    {risk.highestSeverity === 'critical'
                      ? t.academicAlertTitleCritical
                      : t.academicAlertTitleWarning}
                  </h3>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold border ${
                    risk.highestSeverity === 'critical'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {t.badgeAtRisk}
                </span>
              </div>
              <ul className="space-y-1 ps-7 list-disc text-sm">
                {risk.warnings.map((w, idx) => (
                  <li key={`${w.code}-${w.subject || idx}`}>
                    {formatWarningMessage(t, w, payload.student.deductionPercent)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="print-card-clean bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span className="font-mono font-semibold text-stone-700">
                    ID #{payload.student.id}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{payload.student.mustawa}</span>
                  {payload.student.email && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{payload.student.email}</span>
                    </>
                  )}
                </div>
                <h3 className="font-display text-2xl font-bold text-stone-900">
                  {payload.student.fullName}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {risk.isAtRisk && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border ${
                      risk.highestSeverity === 'critical'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {risk.hasLowGradeRisk ? t.badgeGradeRisk : t.badgeHighAbsence}
                    </span>
                  </span>
                )}
                {renderStanding(payload.student.standing)}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-stone-500">{t.mustawaLabel}</p>
                <p className="mt-1 font-display text-xl font-semibold text-stone-900">
                  {payload.student.mustawa}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500">{t.missedClassesCount}</p>
                <p className="mt-1 font-mono tabular-nums text-xl font-semibold text-stone-900">
                  {payload.student.missedClasses}{' '}
                  <span className="text-xs font-sans font-normal text-stone-500">
                    / {payload.student.totalSessions}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500">{t.automatedDeduction}</p>
                <p
                  className={`mt-1 font-mono tabular-nums text-xl font-semibold ${
                    payload.student.deductionPercent > 0 ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  <span dir="ltr" className="inline-block">
                    -{payload.student.deductionPercent}%
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500">{t.colAvgNet}</p>
                <p
                  className={`mt-1 font-mono tabular-nums text-xl font-semibold ${
                    payload.student.averageNetScore !== null &&
                    getExamScoreTier(payload.student.averageNetScore) === 'failing'
                      ? 'text-rose-700'
                      : payload.student.averageNetScore !== null &&
                        getExamScoreTier(payload.student.averageNetScore) === 'near'
                      ? 'text-amber-700'
                      : 'text-stone-900'
                  }`}
                >
                  {payload.student.averageNetScore !== null
                    ? `${payload.student.averageNetScore.toFixed(1)}%`
                    : '—'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-1.5 text-stone-500">
                  <span className="font-medium text-stone-700">{t.penaltyPolicyTitle}:</span>
                  <span>{t.penaltyRuleSummary}</span>
                </div>
                {penaltyInfo && (
                  <span
                    className={`font-medium ${
                      penaltyInfo.nextAbsenceThreshold === null
                        ? 'text-rose-700'
                        : penaltyInfo.absencesRemaining <= 1
                        ? 'text-amber-700'
                        : 'text-emerald-800'
                    }`}
                  >
                    {penaltyInfo.nextAbsenceThreshold === null
                      ? t.maxPenaltyReached
                      : t.nextPenaltyHint
                          .replace('{remaining}', String(penaltyInfo.absencesRemaining))
                          .replace('{nextDeduction}', String(penaltyInfo.nextDeductionPercent))
                          .replace('{threshold}', String(penaltyInfo.nextAbsenceThreshold))}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-5 gap-2">
                {DEFAULT_PENALTY_TIERS.map((tier) => {
                  const missed = payload.student.missedClasses;
                  const isActive =
                    missed >= tier.minAbsences &&
                    (tier.maxAbsences === null || missed <= tier.maxAbsences);
                  const rangeLabel =
                    tier.maxAbsences === null
                      ? `${tier.minAbsences}+`
                      : `${tier.minAbsences}–${tier.maxAbsences}`;
                  const activeTone =
                    tier.standing === 'good'
                      ? 'bg-emerald-50 border-emerald-700 text-emerald-950'
                      : tier.standing === 'warning'
                      ? 'bg-amber-50 border-amber-500 text-amber-950'
                      : 'bg-rose-50 border-rose-600 text-rose-950';
                  return (
                    <div
                      key={`${tier.minAbsences}-${tier.deductionPercent}`}
                      className={`px-2.5 py-2 rounded border text-center transition-colors ${
                        isActive
                          ? activeTone
                          : 'bg-stone-50/70 border-stone-200 text-stone-500'
                      }`}
                    >
                      <div className="font-mono text-[11px] font-semibold" dir="ltr">
                        {rangeLabel}
                      </div>
                      <div className="font-mono text-xs mt-0.5 font-bold" dir="ltr">
                        {tier.deductionPercent === 0 ? '0%' : `-${tier.deductionPercent}%`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Last 10 Sessions Attendance Rate Trend Chart */}
          <StudentAttendanceChart t={t} attendance={payload.attendance} />

          {/* Exam Transcript */}
          <div className="print-card-clean bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-200">
              <h3 className="font-display text-base font-semibold text-stone-900">
                {t.examTranscript}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-100/80 text-xs text-stone-600 border-b border-stone-200">
                  <tr>
                    <th className="text-start font-medium px-6 py-3">{t.subjectLabel}</th>
                    <th className="text-end font-medium px-4 py-3">{t.midtermCol}</th>
                    <th className="text-end font-medium px-4 py-3">{t.courseworkCol}</th>
                    <th className="text-end font-medium px-4 py-3">{t.finalCol}</th>
                    <th className="text-end font-medium px-4 py-3">{t.grossCol}</th>
                    <th className="text-end font-medium px-4 py-3">{t.deductionCol}</th>
                    <th className="text-end font-medium px-4 py-3">{t.netCol}</th>
                    <th className="text-end font-medium px-6 py-3">{t.gradeCol}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {payload.exams.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-stone-500">
                        No exam records recorded yet.
                      </td>
                    </tr>
                  ) : (
                    payload.exams.map((ex) => {
                      const scoreTier = getExamScoreTier(ex.netScore);
                      return (
                        <tr
                          key={ex.subject}
                          className={
                            scoreTier === 'failing'
                              ? 'bg-rose-50/40 hover:bg-rose-50/70'
                              : scoreTier === 'near'
                              ? 'bg-amber-50/40 hover:bg-amber-50/70'
                              : 'hover:bg-stone-50/70'
                          }
                        >
                          <td className="px-6 py-3 font-medium text-stone-900">
                            <div className="flex flex-wrap items-center gap-2">
                              <span>{ex.subject}</span>
                              {scoreTier !== 'ok' && (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                    scoreTier === 'failing'
                                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                                      : 'bg-amber-100 text-amber-800 border-amber-200'
                                  }`}
                                >
                                  <AlertTriangle className="w-3 h-3 shrink-0" />
                                  <span>
                                    {scoreTier === 'failing' ? t.badgeBelow50 : t.badgeNearThreshold}
                                  </span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-end font-mono tabular-nums text-stone-700">
                            {ex.midterm}
                          </td>
                          <td className="px-4 py-3 text-end font-mono tabular-nums text-stone-700">
                            {ex.coursework}
                          </td>
                          <td className="px-4 py-3 text-end font-mono tabular-nums text-stone-700">
                            {ex.finalExam}
                          </td>
                          <td className="px-4 py-3 text-end font-mono tabular-nums text-stone-700">
                            {ex.grossScore}
                          </td>
                          <td className="px-4 py-3 text-end font-mono tabular-nums text-rose-700">
                            <span dir="ltr" className="inline-block">
                              -{ex.deductionPercent}%
                            </span>
                          </td>
                          <td
                            className={`px-4 py-3 text-end font-mono tabular-nums font-semibold ${
                              scoreTier === 'failing'
                                ? 'text-rose-700'
                                : scoreTier === 'near'
                                ? 'text-amber-700'
                                : 'text-stone-900'
                            }`}
                          >
                            {ex.netScore}
                          </td>
                          <td
                            className={`px-6 py-3 text-end font-mono font-semibold ${
                              scoreTier === 'failing'
                                ? 'text-rose-700'
                                : scoreTier === 'near'
                                ? 'text-amber-700'
                                : 'text-emerald-900'
                            }`}
                          >
                            {ex.letterGrade}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Two-column Attendance History & Mustawa Notices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-2 gap-6 items-stretch">
            <div className="print-card-clean bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-stone-200">
                <h3 className="font-display text-base font-semibold text-stone-900">
                  {t.attendanceHistory}
                </h3>
              </div>
              <div className="divide-y divide-stone-100 flex-1">
                {payload.attendance.length === 0 ? (
                  <p className="px-6 py-8 text-sm text-stone-500 text-center">
                    No attendance sessions logged yet.
                  </p>
                ) : (
                  payload.attendance.map((att) => (
                    <div
                      key={att.id}
                      className="px-6 py-3 flex items-center justify-between gap-4 text-sm"
                    >
                      <div>
                        <p className="font-medium text-stone-900">{att.course}</p>
                        <p className="text-xs font-mono text-stone-500">
                          {att.date}
                          {att.note ? ` · ${att.note}` : ''}
                        </p>
                      </div>
                      {att.status === 'present' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 whitespace-nowrap">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t.presentLabel}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 whitespace-nowrap">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{t.absentLabel}</span>
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="print-card-clean bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-stone-900">
                  {t.mustawaNotices} ({payload.student.mustawa})
                </h3>
                <Megaphone className="w-4 h-4 text-stone-400 no-print" />
              </div>
              <div className="divide-y divide-stone-100 flex-1">
                {payload.announcements.length === 0 ? (
                  <p className="px-6 py-8 text-sm text-stone-500 text-center">
                    {t.noAnnouncements}
                  </p>
                ) : (
                  payload.announcements.map((ann) => (
                    <article key={ann.id} className="px-6 py-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <span>{ann.mustawa}</span>
                        <span aria-hidden="true">·</span>
                        <span>{ann.author}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{ann.createdAt.slice(0, 10)}</span>
                      </div>
                      <h4 className="font-medium text-stone-900">{ann.title}</h4>
                      <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                        {ann.body}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>

          <PrintSignatureFooter t={t} />
        </div>
      )}
    </div>
  );
}
