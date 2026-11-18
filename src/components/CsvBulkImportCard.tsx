import { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, FileDown, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import type { Translations } from '../i18n/translations';
import {
  MUSTAWA_LEVELS,
  parseBulkStudentInput,
  type MustawaLevel,
} from '../utils/academicLogic';
import { bulkImportStudentsApi } from '../utils/api';

interface CsvBulkImportCardProps {
  t: Translations;
  selectedMustawa: string;
  existingStudentIds: Set<string>;
  onImported: () => Promise<void>;
}

export function CsvBulkImportCard({
  t,
  selectedMustawa,
  existingStudentIds,
  onImported,
}: CsvBulkImportCardProps) {
  const defaultTarget = MUSTAWA_LEVELS.includes(selectedMustawa as MustawaLevel)
    ? (selectedMustawa as MustawaLevel)
    : 'Mustawa 1';

  const [targetMustawa, setTargetMustawa] = useState<MustawaLevel>(defaultTarget);
  const [fileName, setFileName] = useState<string>('');
  const [rawCsvText, setRawCsvText] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (MUSTAWA_LEVELS.includes(selectedMustawa as MustawaLevel)) {
      setTargetMustawa(selectedMustawa as MustawaLevel);
    }
  }, [selectedMustawa]);

  const parsed = useMemo(() => parseBulkStudentInput(rawCsvText), [rawCsvText]);

  const duplicateCount = useMemo(() => {
    return parsed.students.filter(
      (s) => s.studentId && existingStudentIds.has(s.studentId.toLowerCase())
    ).length;
  }, [parsed.students, existingStudentIds]);

  const newStudentsCount = parsed.students.length - duplicateCount;

  function loadFile(file: File) {
    setErrorMsg(null);
    setStatusMessage(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRawCsvText(reader.result);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read CSV file.');
    };
    reader.readAsText(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      loadFile(file);
    }
  }

  function handleClear() {
    setFileName('');
    setRawCsvText('');
    setErrorMsg(null);
    setStatusMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleDownloadTemplate() {
    const sample = [
      'ID,Full Name,Email,Phone',
      '201,Salma Hassan Noor,salma.noor@mustawa.edu,+252-61-5220201',
      '202,Ibrahim Mohamed Ali,ibrahim.ali@mustawa.edu,+252-61-5220202',
      ',Kaltun Abdi Farah,kaltun.farah@mustawa.edu,+252-61-5220203',
    ].join('\n');
    const blob = new Blob([`\uFEFF${sample}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mustawa_students_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleConfirmImport() {
    if (parsed.students.length === 0) return;
    setImporting(true);
    setErrorMsg(null);
    setStatusMessage(null);
    try {
      const res = await bulkImportStudentsApi('admin', targetMustawa, parsed.students);
      setStatusMessage(
        `${targetMustawa}: +${res.inserted} ${t.importPreview}${
          res.skippedDuplicates > 0 ? ` (${res.skippedDuplicates} skipped)` : ''
        }`
      );
      setFileName('');
      setRawCsvText('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await onImported();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Bulk import failed');
    } finally {
      setImporting(false);
    }
  }

  return (
    <section
      aria-label={t.inlineCsvTitle}
      className="no-print bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] p-5 space-y-4"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h3 className="font-display text-sm font-semibold text-stone-900">
            {t.inlineCsvTitle}
          </h3>
          <p className="text-xs text-stone-500">{t.inlineCsvDesc}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <label
              htmlFor="overview-csv-mustawa"
              className="text-xs font-medium text-stone-700 whitespace-nowrap"
            >
              {t.targetMustawa}
            </label>
            <select
              id="overview-csv-mustawa"
              value={targetMustawa}
              onChange={(e) => setTargetMustawa(e.target.value as MustawaLevel)}
              className="px-2.5 py-1.5 text-xs font-medium border border-stone-300 rounded-md bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
            >
              {MUSTAWA_LEVELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 whitespace-nowrap shrink-0 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-800" />
            <span>{t.downloadCsvTemplate}</span>
          </button>
        </div>
      </div>

      {/* Inline File Input & Drag-Drop Strip */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const droppedFile = e.dataTransfer.files?.[0];
          if (droppedFile) {
            loadFile(droppedFile);
          }
        }}
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md border border-dashed px-4 py-3 transition-colors ${
          isDragging
            ? 'border-emerald-700 bg-emerald-50/70'
            : 'border-stone-300 bg-stone-50/50'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <Upload className="w-4 h-4 text-emerald-900" />
          </div>
          <div className="min-w-0">
            <label htmlFor="overview-csv-file-input" className="sr-only">
              {t.uploadCsvFile}
            </label>
            <input
              ref={fileInputRef}
              id="overview-csv-file-input"
              type="file"
              accept=".csv,.txt"
              aria-label={t.uploadCsvFile}
              onChange={handleFileChange}
              className="block w-full text-xs text-stone-700 file:me-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-stone-300 file:text-xs file:font-medium file:bg-white file:text-stone-800 hover:file:bg-stone-100 cursor-pointer"
            />
          </div>
        </div>

        {parsed.students.length > 0 && (
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
              disabled={importing || newStudentsCount === 0}
              onClick={handleConfirmImport}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-900 rounded-md hover:bg-emerald-800 disabled:opacity-50 whitespace-nowrap transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>
                {importing
                  ? t.saving
                  : `${t.confirmImport} (${newStudentsCount}) → ${targetMustawa}`}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Parsed CSV Preview Table */}
      {parsed.students.length > 0 && (
        <div className="border border-stone-200 rounded-md overflow-hidden">
          <div className="bg-stone-100/80 px-4 py-2 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-medium text-stone-800">
              {fileName ? `${fileName} · ` : ''}
              {t.importPreview}: <span className="font-mono">{parsed.students.length}</span>
            </span>
            {duplicateCount > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-800 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>
                  {duplicateCount} {t.csvDuplicatesSkippedNote}
                </span>
              </span>
            )}
          </div>
          <div className="max-h-44 overflow-y-auto divide-y divide-stone-100 text-xs">
            {parsed.students.slice(0, 50).map((st, idx) => {
              const isDup =
                Boolean(st.studentId) &&
                existingStudentIds.has(st.studentId!.toLowerCase());
              return (
                <div
                  key={`${st.studentId || 'auto'}-${idx}`}
                  className={`px-4 py-2 flex items-center justify-between gap-4 ${
                    isDup ? 'bg-amber-50/50 text-stone-500' : ''
                  }`}
                >
                  <span className="font-mono w-16 shrink-0 text-stone-600">
                    {st.studentId ? `#${st.studentId}` : 'Auto ID'}
                  </span>
                  <span className="font-medium text-stone-900 flex-1 truncate">
                    {st.fullName}
                  </span>
                  <span className="text-stone-500 hidden sm:inline truncate max-w-[200px]">
                    {st.email || '—'}
                  </span>
                  <span
                    className={`font-medium shrink-0 ${
                      isDup ? 'text-amber-700' : 'text-emerald-700'
                    }`}
                  >
                    {isDup ? 'Duplicate' : targetMustawa}
                  </span>
                </div>
              );
            })}
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
    </section>
  );
}
