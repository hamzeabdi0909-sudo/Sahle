import { useMemo, useRef, useState } from 'react';
import { Upload, FileDown, CheckCircle2, AlertTriangle, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { Translations } from '../i18n/translations';
import { parseBulkAttendanceCsv } from '../utils/bulkImportRecords';
import { bulkImportAttendanceRecords } from '../utils/api';

interface BulkAttendanceCardProps {
  t: Translations;
  defaultDate: string;
  defaultCourse: string;
  onImported: () => Promise<void>;
}

export function BulkAttendanceCard({
  t,
  defaultDate,
  defaultCourse,
  onImported,
}: BulkAttendanceCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const parsed = useMemo(
    () => parseBulkAttendanceCsv(rawText, defaultDate, defaultCourse),
    [rawText, defaultDate, defaultCourse]
  );

  function loadFile(file: File) {
    setErrorMsg(null);
    setStatusMessage(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRawText(reader.result);
      }
    };
    reader.onerror = () => setErrorMsg('Failed to read attendance CSV file.');
    reader.readAsText(file);
  }

  function handleClear() {
    setFileName('');
    setRawText('');
    setErrorMsg(null);
    setStatusMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleDownloadTemplate() {
    const sample = [
      'Student ID,Date,Course,Status,Note',
      `13,${defaultDate},${defaultCourse},present,`,
      `14,${defaultDate},${defaultCourse},absent,Medical excuse`,
      `15,${defaultDate},${defaultCourse},present,`,
    ].join('\n');
    const blob = new Blob([`\uFEFF${sample}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mustawa_attendance_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleConfirmImport() {
    if (parsed.entries.length === 0) return;
    setImporting(true);
    setErrorMsg(null);
    setStatusMessage(null);
    try {
      const res = await bulkImportAttendanceRecords('admin', parsed.entries);
      const unknownSuffix =
        res.unknownIds.length > 0
          ? ` · ${res.unknownIds.length} ${t.unknownStudentIdsNote} (${res.unknownIds.join(', ')})`
          : '';
      setStatusMessage(`${t.savedSuccess}: +${res.imported}${unknownSuffix}`);
      setFileName('');
      setRawText('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await onImported();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Bulk attendance import failed');
    } finally {
      setImporting(false);
    }
  }

  return (
    <section
      aria-label={t.bulkAttendanceTitle}
      className="no-print bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] p-5 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="font-display text-sm font-semibold text-stone-900">
            {t.bulkAttendanceTitle}
          </h3>
          <p className="text-xs text-stone-500">{t.bulkAttendanceDesc}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 whitespace-nowrap shrink-0"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-800" />
            <span>{t.downloadCsvTemplate}</span>
          </button>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 border border-stone-200 rounded-md hover:bg-stone-200 whitespace-nowrap shrink-0"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md border border-dashed border-stone-300 bg-stone-50/60 px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4 text-emerald-900" />
              </div>
              <div className="min-w-0">
                <label htmlFor="bulk-attendance-file-input" className="sr-only">
                  {t.bulkAttendanceTitle}
                </label>
                <input
                  ref={fileInputRef}
                  id="bulk-attendance-file-input"
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) loadFile(file);
                  }}
                  className="block w-full text-xs text-stone-700 file:me-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-stone-300 file:text-xs file:font-medium file:bg-white file:text-stone-800 hover:file:bg-stone-100 cursor-pointer"
                />
              </div>
            </div>

            {parsed.entries.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-600 bg-white border border-stone-300 rounded-md hover:bg-stone-100"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{t.csvClearFile}</span>
                </button>
                <button
                  type="button"
                  disabled={importing}
                  onClick={handleConfirmImport}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-900 rounded-md hover:bg-emerald-800 disabled:opacity-50 whitespace-nowrap transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {importing
                      ? t.saving
                      : `${t.bulkAttendanceAction} (${parsed.entries.length})`}
                  </span>
                </button>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="bulk-attendance-paste"
              className="block text-xs font-medium text-stone-600 mb-1"
            >
              {t.pasteCsvOrLines}
            </label>
            <textarea
              id="bulk-attendance-paste"
              rows={3}
              value={rawText}
              onChange={(e) => {
                setStatusMessage(null);
                setErrorMsg(null);
                setRawText(e.target.value);
              }}
              placeholder={`13, ${defaultDate}, ${defaultCourse}, absent, Medical leave\n14, present`}
              className="w-full px-3 py-2 text-xs font-mono border border-stone-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
            />
          </div>

          {parsed.entries.length > 0 && (
            <div className="border border-stone-200 rounded-md overflow-hidden">
              <div className="bg-stone-100/80 px-4 py-2 border-b border-stone-200 flex items-center justify-between text-xs">
                <span className="font-medium text-stone-800">
                  {fileName ? `${fileName} · ` : ''}
                  {t.importPreview}: <span className="font-mono">{parsed.entries.length}</span>
                </span>
                {parsed.skippedLines > 0 && (
                  <span className="inline-flex items-center gap-1 text-amber-800 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{parsed.skippedLines} skipped</span>
                  </span>
                )}
              </div>
              <div className="max-h-40 overflow-y-auto divide-y divide-stone-100 text-xs">
                {parsed.entries.slice(0, 40).map((entry, idx) => (
                  <div
                    key={`${entry.studentId}-${entry.date}-${idx}`}
                    className="px-4 py-2 flex items-center justify-between gap-3"
                  >
                    <span className="font-mono font-semibold text-stone-800 w-16 shrink-0">
                      #{entry.studentId}
                    </span>
                    <span className="font-mono text-stone-500 shrink-0">{entry.date}</span>
                    <span className="text-stone-700 flex-1 truncate">{entry.course}</span>
                    <span
                      className={`font-medium shrink-0 ${
                        entry.status === 'absent' ? 'text-rose-700' : 'text-emerald-700'
                      }`}
                    >
                      {entry.status === 'absent' ? t.absentLabel : t.presentLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {statusMessage && (
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md px-3.5 py-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMsg && (
            <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3.5 py-2">
              {errorMsg}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
