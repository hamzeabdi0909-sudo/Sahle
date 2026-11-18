import { useEffect, useMemo, useState } from 'react';
import {
  CheckCheck,
  Save,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  FileText,
  FileDown,
  Printer,
} from 'lucide-react';
import type { Language, Translations } from '../i18n/translations';
import { MUSTAWA_LEVELS, type MustawaLevel } from '../utils/academicLogic';
import {
  fetchAttendanceSession,
  saveAttendanceBulk,
  type SessionAttendanceRow,
} from '../utils/api';
import {
  exportAttendanceCsv,
  exportAttendanceExcel,
  exportAttendancePdf,
} from '../utils/exportReports';
import { VoiceRecorderButton } from './VoiceRecorderButton';
import { PrintOfficialHeader, PrintSignatureFooter } from './PrintOfficialChrome';
import { BulkAttendanceCard } from './BulkAttendanceCard';

interface AttendanceBoardProps {
  t: Translations;
  lang: Language;
  defaultMustawa: MustawaLevel;
  onSaved: () => Promise<void>;
}

export function AttendanceBoard({
  t,
  lang,
  defaultMustawa,
  onSaved,
}: AttendanceBoardProps) {
  const [mustawa, setMustawa] = useState<MustawaLevel>(defaultMustawa);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [course, setCourse] = useState('Core Lecture');
  const [rows, setRows] = useState<SessionAttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const [voiceNote, setVoiceNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function loadSession() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAttendanceSession(mustawa, date, course);
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSession();
  }, [mustawa, date, course]);

  function toggleStudent(studentId: string) {
    setSavedBanner(false);
    setRows((prev) =>
      prev.map((r) =>
        r.studentId === studentId
          ? { ...r, status: r.status === 'present' ? 'absent' : 'present' }
          : r
      )
    );
  }

  function updateRowNote(studentId: string, note: string) {
    setSavedBanner(false);
    setRows((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, note } : r))
    );
  }

  function markAllPresent() {
    setSavedBanner(false);
    setRows((prev) => prev.map((r) => ({ ...r, status: 'present' })));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSavedBanner(false);
    try {
      await saveAttendanceBulk(
        'admin',
        date,
        course,
        rows.map((r) => ({
          studentId: r.studentId,
          status: r.status,
          note: r.note,
        }))
      );
      setSavedBanner(true);
      await loadSession();
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  }

  const counts = useMemo(() => {
    const absent = rows.filter((r) => r.status === 'absent').length;
    return { present: rows.length - absent, absent };
  }, [rows]);

  return (
    <div className="space-y-6">
      <PrintOfficialHeader
        t={t}
        reportTitle={t.attendanceTitle}
        metadataItems={[
          `${t.mustawaLabel}: ${mustawa}`,
          `${t.courseName}: ${course}`,
          `${t.attendanceDate}: ${date}`,
          `${counts.present} ${t.presentCount} · ${counts.absent} ${t.absentCount}`,
        ]}
      />

      <div className="no-print bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-semibold text-stone-900">
              {t.attendanceTitle}
            </h2>
            <p className="text-sm text-stone-600">{t.attendanceDesc}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => exportAttendanceCsv(rows, mustawa, date, course)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 whitespace-nowrap shrink-0"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-800" />
              <span>{t.exportCsv}</span>
            </button>
            <button
              type="button"
              onClick={() => exportAttendanceExcel(rows, mustawa, date, course)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 whitespace-nowrap shrink-0"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.exportExcel}</span>
            </button>
            <button
              type="button"
              onClick={() => exportAttendancePdf(rows, mustawa, date, course)}
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
          </div>
        </div>

        {/* Session Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="att-mustawa" className="block text-xs font-medium text-stone-700 mb-1">
              {t.mustawaLabel}
            </label>
            <select
              id="att-mustawa"
              value={mustawa}
              onChange={(e) => setMustawa(e.target.value as MustawaLevel)}
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md bg-white"
            >
              {MUSTAWA_LEVELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="att-date" className="block text-xs font-medium text-stone-700 mb-1">
              {t.attendanceDate}
            </label>
            <input
              id="att-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono border border-stone-300 rounded-md bg-white"
            />
          </div>
          <div>
            <label htmlFor="att-course" className="block text-xs font-medium text-stone-700 mb-1">
              {t.courseName}
            </label>
            <input
              id="att-course"
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md bg-white"
            />
          </div>
        </div>

        {/* Action Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-stone-100">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-mono tabular-nums font-semibold text-emerald-800">
              {counts.present} {t.presentCount}
            </span>
            <span aria-hidden="true" className="text-stone-300">
              ·
            </span>
            <span className="font-mono tabular-nums font-semibold text-rose-700">
              {counts.absent} {t.absentCount}
            </span>
            <span className="text-xs text-stone-500 hidden md:inline">
              · {t.absenceOnlyHint}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={markAllPresent}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-800 bg-stone-100 border border-stone-300 rounded-md hover:bg-stone-200 whitespace-nowrap shrink-0"
            >
              <CheckCheck className="w-4 h-4 text-emerald-700" />
              <span>{t.markAllPresent}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || rows.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-900 rounded-md hover:bg-emerald-800 disabled:opacity-50 whitespace-nowrap shrink-0 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? t.saving : t.saveAttendance}</span>
            </button>
          </div>
        </div>

        {savedBanner && (
          <div className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md px-3.5 py-2">
            {t.savedSuccess} ({mustawa} · {date})
          </div>
        )}
        {error && (
          <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3.5 py-2">
            {error}
          </div>
        )}
      </div>

      {/* Bulk CSV / Paste Attendance Import */}
      <BulkAttendanceCard
        t={t}
        defaultDate={date}
        defaultCourse={course}
        onImported={async () => {
          await loadSession();
          await onSaved();
        }}
      />

      {/* Absence-Only Checklist Table */}
      <div className="print-card-clean bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-100/80 text-xs text-stone-600 border-b border-stone-200">
              <tr>
                <th className="text-start font-medium px-5 py-3 w-20">{t.colId}</th>
                <th className="text-start font-medium px-4 py-3">{t.colName}</th>
                <th className="text-end font-medium px-4 py-3">{t.colMissed}</th>
                <th className="text-end font-medium px-4 py-3">{t.colPenalty}</th>
                <th className="text-start font-medium px-4 py-3">Note</th>
                <th className="text-end font-medium px-5 py-3">{t.statusLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-stone-500">
                    {t.loading}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-stone-500">
                    {t.noStudentsFound}
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const isAbsent = r.status === 'absent';
                  return (
                    <tr
                      key={r.studentId}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('input, button')) return;
                        toggleStudent(r.studentId);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isAbsent ? 'bg-rose-50/70 hover:bg-rose-50' : 'hover:bg-stone-50'
                      }`}
                    >
                      <td className="px-5 py-3 font-mono tabular-nums font-semibold text-stone-900">
                        #{r.studentId}
                      </td>
                      <td className="px-4 py-3 font-medium text-stone-900">{r.fullName}</td>
                      <td className="px-4 py-3 text-end font-mono tabular-nums text-stone-700">
                        {r.missedClasses}
                      </td>
                      <td className="px-4 py-3 text-end font-mono tabular-nums text-stone-700">
                        <span dir="ltr" className="inline-block">
                          -{r.deductionPercent}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          aria-label={`Note for ${r.fullName}`}
                          value={r.note}
                          onChange={(e) => updateRowNote(r.studentId, e.target.value)}
                          placeholder="..."
                          className="w-full max-w-[200px] px-2.5 py-1 text-xs border border-stone-200 rounded bg-white"
                        />
                      </td>
                      <td className="px-5 py-3 text-end">
                        <button
                          type="button"
                          onClick={() => toggleStudent(r.studentId)}
                          aria-pressed={isAbsent}
                          aria-label={`Toggle attendance for ${r.fullName} (currently ${r.status})`}
                          className={`print-status-clean inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                            isAbsent
                              ? 'bg-rose-600 text-white hover:bg-rose-700 print-status-absent'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 print-status-present'
                          }`}
                        >
                          {isAbsent ? (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>{t.absentLabel}</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{t.presentLabel}</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audio Transcription Session Note Widget */}
      <div className="no-print bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-display text-sm font-semibold text-stone-900">
            {t.voiceNoteTitle}
          </h3>
          <VoiceRecorderButton
            startLabel={t.voiceRecordStart}
            stopLabel={t.voiceRecordStop}
            transcribingLabel={t.transcribingAudio}
            hintLanguage={lang === 'ar' ? 'Arabic' : lang === 'so' ? 'Somali' : 'English'}
            onTranscript={(text) =>
              setVoiceNote((prev) => (prev ? `${prev}\n${text}` : text))
            }
            onError={(msg) => setError(msg)}
          />
        </div>
        <textarea
          rows={2}
          value={voiceNote}
          onChange={(e) => setVoiceNote(e.target.value)}
          placeholder={t.voiceTranscriptLabel}
          className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-800"
        />
      </div>

      <PrintSignatureFooter t={t} />
    </div>
  );
}
