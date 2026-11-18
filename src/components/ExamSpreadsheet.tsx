import { useEffect, useMemo, useState } from 'react';
import { Save, FileSpreadsheet, FileText, FileDown, Plus, Printer, AlertTriangle } from 'lucide-react';
import type { Translations } from '../i18n/translations';
import type { ExamGradeRecord } from '../types/academic';
import { MUSTAWA_LEVELS, computeNetExamScore, getExamScoreTier } from '../utils/academicLogic';
import {
  fetchExamSpreadsheet,
  fetchExamSubjects,
  saveExamSpreadsheet,
} from '../utils/api';
import {
  exportExamGradesCsv,
  exportExamGradesExcel,
  exportExamGradesPdf,
} from '../utils/exportReports';
import { PrintOfficialHeader, PrintSignatureFooter } from './PrintOfficialChrome';
import { BulkExamCard } from './BulkExamCard';

interface ExamSpreadsheetProps {
  t: Translations;
  selectedMustawa: string;
  onSaved: () => Promise<void>;
}

export function ExamSpreadsheet({
  t,
  selectedMustawa,
  onSaved,
}: ExamSpreadsheetProps) {
  const [mustawa, setMustawa] = useState<string>(
    selectedMustawa === 'ALL' ? 'Mustawa 2' : selectedMustawa
  );
  const [subjects, setSubjects] = useState<string[]>(['Data Structures']);
  const [subject, setSubject] = useState<string>('Data Structures');
  const [customSubject, setCustomSubject] = useState('');
  const [rows, setRows] = useState<ExamGradeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExamSubjects()
      .then((list) => {
        if (list.length > 0) {
          setSubjects(list);
          if (!list.includes(subject)) setSubject(list[0]);
        }
      })
      .catch(() => {});
  }, []);

  async function loadGrid() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExamSpreadsheet(mustawa, subject);
      setRows(data);
      setDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load grades');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGrid();
  }, [mustawa, subject]);

  function updateCell(
    studentId: string,
    field: 'midterm' | 'coursework' | 'finalExam',
    rawValue: string
  ) {
    const num = rawValue === '' ? 0 : Number.parseFloat(rawValue);
    const safeVal = Number.isFinite(num) ? num : 0;
    setDirty(true);
    setSavedBanner(false);

    setRows((prev) =>
      prev.map((row) => {
        if (row.studentId !== studentId) return row;
        const nextMid = field === 'midterm' ? safeVal : row.midterm;
        const nextCw = field === 'coursework' ? safeVal : row.coursework;
        const nextFin = field === 'finalExam' ? safeVal : row.finalExam;
        const calc = computeNetExamScore(nextMid, nextCw, nextFin, row.missedClasses);
        return {
          ...row,
          ...calc,
        };
      })
    );
  }

  async function handleSaveAll() {
    setSaving(true);
    setError(null);
    setSavedBanner(false);
    try {
      await saveExamSpreadsheet(
        'admin',
        subject,
        rows.map((r) => ({
          studentId: r.studentId,
          midterm: r.midterm,
          coursework: r.coursework,
          finalExam: r.finalExam,
        }))
      );
      setDirty(false);
      setSavedBanner(true);
      await loadGrid();
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save grades');
    } finally {
      setSaving(false);
    }
  }

  function handleAddSubject(e: React.FormEvent) {
    e.preventDefault();
    const clean = customSubject.trim();
    if (!clean) return;
    if (!subjects.includes(clean)) {
      setSubjects((prev) => [clean, ...prev]);
    }
    setSubject(clean);
    setCustomSubject('');
  }

  const cohortStats = useMemo(() => {
    if (rows.length === 0) {
      return {
        avgNet: null as number | null,
        highestNet: null as number | null,
        passRate: null as number | null,
        flaggedCount: 0,
      };
    }
    let total = 0;
    let highest = 0;
    let passed = 0;
    let flagged = 0;
    for (const r of rows) {
      total += r.netScore;
      if (r.netScore > highest) highest = r.netScore;
      if (r.passed) passed += 1;
      if (getExamScoreTier(r.netScore) !== 'ok') flagged += 1;
    }
    return {
      avgNet: Math.round((total / rows.length) * 10) / 10,
      highestNet: Math.round(highest * 10) / 10,
      passRate: Math.round((passed / rows.length) * 100),
      flaggedCount: flagged,
    };
  }, [rows]);

  return (
    <div className="space-y-6">
      <PrintOfficialHeader
        t={t}
        reportTitle={t.examsTitle}
        metadataItems={[
          `${t.mustawaLabel}: ${mustawa === 'ALL' ? t.allMustawas : mustawa}`,
          `${t.subjectLabel}: ${subject}`,
          `${t.totalStudents}: ${rows.length}`,
          t.penaltyRuleSummary,
        ]}
      />

      <div className="no-print bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-semibold text-stone-900">
              {t.examsTitle}
            </h2>
            <p className="text-sm text-stone-600">{t.examsDesc}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => exportExamGradesCsv(rows, mustawa, subject)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 whitespace-nowrap shrink-0"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-800" />
              <span>{t.exportCsv}</span>
            </button>
            <button
              type="button"
              onClick={() => exportExamGradesExcel(rows, mustawa, subject)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 whitespace-nowrap shrink-0"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.exportExcel}</span>
            </button>
            <button
              type="button"
              onClick={() => exportExamGradesPdf(rows, mustawa, subject)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 whitespace-nowrap shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-rose-700" />
              <span>{t.exportPdf}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5 text-stone-700" />
              <span>{t.printTranscript}</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving || rows.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-900 rounded-md hover:bg-emerald-800 disabled:opacity-50 whitespace-nowrap shrink-0 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? t.saving : t.saveAllGrades}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="exam-mustawa" className="block text-xs font-medium text-stone-700 mb-1">
              {t.mustawaLabel}
            </label>
            <select
              id="exam-mustawa"
              value={mustawa}
              onChange={(e) => setMustawa(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md bg-white"
            >
              <option value="ALL">{t.allMustawas}</option>
              {MUSTAWA_LEVELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="exam-subject" className="block text-xs font-medium text-stone-700 mb-1">
              {t.subjectLabel}
            </label>
            <select
              id="exam-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md bg-white"
            >
              {subjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleAddSubject} className="flex items-center gap-2">
            <input
              type="text"
              aria-label="New subject name"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              placeholder="New subject..."
              className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded-md bg-white"
            />
            <button
              type="submit"
              aria-label="Add subject"
              className="px-3 py-2 text-xs font-medium text-stone-700 bg-stone-100 border border-stone-300 rounded-md hover:bg-stone-200 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-500">
            {t.penaltyPolicyTitle}: {t.penaltyRuleSummary}
          </span>
          {dirty && <span className="font-medium text-amber-700">{t.unsavedChanges}</span>}
        </div>

        {savedBanner && (
          <div className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md px-3.5 py-2">
            {t.savedSuccess} ({subject})
          </div>
        )}
        {error && (
          <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3.5 py-2">
            {error}
          </div>
        )}
      </div>

      {/* Bulk CSV / Paste Exam Score Import */}
      <BulkExamCard
        t={t}
        defaultSubject={subject}
        onImported={async () => {
          const list = await fetchExamSubjects().catch(() => subjects);
          if (list.length > 0) setSubjects(list);
          await loadGrid();
          await onSaved();
        }}
      />

      {/* Live Cohort Exam KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-[0_1px_2px_rgba(28,25,23,0.04)]">
          <p className="text-xs font-medium text-stone-500">{t.classAvgLabel}</p>
          <p className="mt-1 font-mono tabular-nums text-2xl font-bold text-stone-900">
            {cohortStats.avgNet !== null ? `${cohortStats.avgNet.toFixed(1)}%` : '—'}
          </p>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-[0_1px_2px_rgba(28,25,23,0.04)]">
          <p className="text-xs font-medium text-stone-500">{t.highestScoreLabel}</p>
          <p className="mt-1 font-mono tabular-nums text-2xl font-bold text-emerald-800">
            {cohortStats.highestNet !== null ? `${cohortStats.highestNet.toFixed(1)}%` : '—'}
          </p>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-[0_1px_2px_rgba(28,25,23,0.04)]">
          <p className="text-xs font-medium text-stone-500">{t.passRateLabel}</p>
          <p className="mt-1 font-mono tabular-nums text-2xl font-bold text-stone-900">
            {cohortStats.passRate !== null ? `${cohortStats.passRate}%` : '—'}
          </p>
        </div>
        <div
          className={`rounded-lg p-4 border shadow-[0_1px_2px_rgba(28,25,23,0.04)] ${
            cohortStats.flaggedCount > 0
              ? 'bg-amber-50/70 border-amber-200'
              : 'bg-white border-stone-200'
          }`}
        >
          <p
            className={`text-xs font-medium ${
              cohortStats.flaggedCount > 0 ? 'text-amber-800' : 'text-stone-500'
            }`}
          >
            {t.atRiskCountLabel}
          </p>
          <p
            className={`mt-1 font-mono tabular-nums text-2xl font-bold ${
              cohortStats.flaggedCount > 0 ? 'text-rose-700' : 'text-stone-900'
            }`}
          >
            {cohortStats.flaggedCount}
          </p>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="print-card-clean bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-100/80 text-xs text-stone-600 border-b border-stone-200">
              <tr>
                <th className="text-start font-medium px-4 py-3 w-16">{t.colId}</th>
                <th className="text-start font-medium px-4 py-3">{t.colName}</th>
                <th className="text-start font-medium px-3 py-3">{t.colMustawa}</th>
                <th className="text-end font-medium px-3 py-3 w-28">{t.midtermCol}</th>
                <th className="text-end font-medium px-3 py-3 w-28">{t.courseworkCol}</th>
                <th className="text-end font-medium px-3 py-3 w-28">{t.finalCol}</th>
                <th className="text-end font-medium px-3 py-3">{t.grossCol}</th>
                <th className="text-end font-medium px-3 py-3">{t.deductionCol}</th>
                <th className="text-end font-medium px-3 py-3">{t.netCol}</th>
                <th className="text-end font-medium px-4 py-3">{t.gradeCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-stone-500">
                    {t.loading}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-stone-500">
                    {t.noStudentsFound}
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const scoreTier = getExamScoreTier(r.netScore);
                  return (
                    <tr
                      key={r.studentId}
                      className={
                        scoreTier === 'failing'
                          ? 'bg-rose-50/40 hover:bg-rose-50/70'
                          : scoreTier === 'near'
                          ? 'bg-amber-50/35 hover:bg-amber-50/60'
                          : 'hover:bg-stone-50/70'
                      }
                    >
                      <td className="px-4 py-2 font-mono tabular-nums font-semibold text-stone-900">
                        #{r.studentId}
                      </td>
                      <td className="px-4 py-2 font-medium text-stone-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{r.studentName}</span>
                          {scoreTier !== 'ok' && (
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                                scoreTier === 'failing'
                                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                                  : 'bg-amber-100 text-amber-800 border-amber-200'
                              }`}
                            >
                              <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                              <span>
                                {scoreTier === 'failing' ? t.badgeBelow50 : t.badgeNearThreshold}
                              </span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-stone-600 whitespace-nowrap">
                        {r.mustawa}
                      </td>
                      <td className="px-3 py-2 text-end">
                        <input
                          type="number"
                          min={0}
                          max={30}
                          step="0.5"
                          aria-label={`Midterm score for ${r.studentName}`}
                          value={r.midterm}
                          onChange={(e) => updateCell(r.studentId, 'midterm', e.target.value)}
                          className="w-20 px-2 py-1.5 text-end font-mono tabular-nums text-sm border border-stone-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                        />
                      </td>
                      <td className="px-3 py-2 text-end">
                        <input
                          type="number"
                          min={0}
                          max={20}
                          step="0.5"
                          aria-label={`Coursework score for ${r.studentName}`}
                          value={r.coursework}
                          onChange={(e) => updateCell(r.studentId, 'coursework', e.target.value)}
                          className="w-20 px-2 py-1.5 text-end font-mono tabular-nums text-sm border border-stone-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                        />
                      </td>
                      <td className="px-3 py-2 text-end">
                        <input
                          type="number"
                          min={0}
                          max={50}
                          step="0.5"
                          aria-label={`Final exam score for ${r.studentName}`}
                          value={r.finalExam}
                          onChange={(e) => updateCell(r.studentId, 'finalExam', e.target.value)}
                          className="w-20 px-2 py-1.5 text-end font-mono tabular-nums text-sm border border-stone-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                        />
                      </td>
                      <td className="px-3 py-2 text-end font-mono tabular-nums text-stone-700">
                        {r.grossScore}
                      </td>
                      <td
                        className={`px-3 py-2 text-end font-mono tabular-nums ${
                          r.deductionPercent > 0 ? 'text-rose-700 font-medium' : 'text-stone-500'
                        }`}
                      >
                        <span dir="ltr" className="inline-block">
                          -{r.deductionPercent}%
                        </span>
                      </td>
                      <td
                        className={`px-3 py-2 text-end font-mono tabular-nums font-bold ${
                          scoreTier === 'failing'
                            ? 'text-rose-700'
                            : scoreTier === 'near'
                            ? 'text-amber-700'
                            : 'text-stone-900'
                        }`}
                      >
                        {r.netScore}
                      </td>
                      <td
                        className={`px-4 py-2 text-end font-mono font-bold ${
                          scoreTier === 'failing'
                            ? 'text-rose-700'
                            : scoreTier === 'near'
                            ? 'text-amber-700'
                            : 'text-emerald-900'
                        }`}
                      >
                        {r.letterGrade}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PrintSignatureFooter t={t} />
    </div>
  );
}
