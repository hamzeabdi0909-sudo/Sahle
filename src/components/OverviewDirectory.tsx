import { useMemo, useState } from 'react';
import {
  Plus,
  Upload,
  FileSpreadsheet,
  FileText,
  FileDown,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  X,
  Printer,
  Pencil,
  ArrowUpDown,
} from 'lucide-react';
import type { Translations } from '../i18n/translations';
import type {
  AnnouncementRecord,
  DailyAttendanceBucket,
  StudentRecord,
} from '../types/academic';
import {
  ALL_MUSTAWA_OPTIONS,
  MUSTAWA_LEVELS,
  evaluateStudentRisk,
  getExamScoreTier,
  parseBulkStudentInput,
  type MustawaLevel,
  type StudentRiskAssessment,
} from '../utils/academicLogic';
import {
  bulkImportStudentsApi,
  createSingleStudent,
  removeStudent,
  updateSingleStudent,
} from '../utils/api';
import {
  exportStudentsDirectoryCsv,
  exportStudentsDirectoryExcel,
  exportStudentsDirectoryPdf,
} from '../utils/exportReports';
import { PrintOfficialHeader, PrintSignatureFooter } from './PrintOfficialChrome';
import { MustawaAnalyticsWidget } from './MustawaAnalyticsWidget';
import { CsvBulkImportCard } from './CsvBulkImportCard';

interface OverviewDirectoryProps {
  t: Translations;
  students: StudentRecord[];
  announcements: AnnouncementRecord[];
  attendanceBuckets: DailyAttendanceBucket[];
  selectedMustawa: string;
  onSelectMustawa: (m: string) => void;
  onRefresh: () => Promise<void>;
  onInspectStudent: (id: string) => void;
}

export function OverviewDirectory({
  t,
  students,
  announcements,
  attendanceBuckets,
  selectedMustawa,
  onSelectMustawa,
  onRefresh,
  onInspectStudent,
}: OverviewDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [atRiskOnly, setAtRiskOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'mustawa' | 'missed' | 'avg'>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Add Student form state
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newMustawa, setNewMustawa] = useState<MustawaLevel>('Mustawa 1');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [savingStudent, setSavingStudent] = useState(false);

  // Edit Student form state
  const [editName, setEditName] = useState('');
  const [editMustawa, setEditMustawa] = useState<MustawaLevel>('Mustawa 1');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [updatingStudent, setUpdatingStudent] = useState(false);

  // Bulk import state
  const [bulkMustawa, setBulkMustawa] = useState<MustawaLevel>('Mustawa 1');
  const [bulkRawText, setBulkRawText] = useState('');
  const [importingBulk, setImportingBulk] = useState(false);

  const existingStudentIds = useMemo(
    () => new Set(students.map((s) => s.id.toLowerCase())),
    [students]
  );

  const riskById = useMemo(() => {
    const map = new Map<string, StudentRiskAssessment>();
    for (const s of students) {
      map.set(s.id, evaluateStudentRisk(s));
    }
    return map;
  }, [students]);

  const mustawaScopedStudents = useMemo(() => {
    return students.filter(
      (s) => selectedMustawa === 'ALL' || s.mustawa === selectedMustawa
    );
  }, [students, selectedMustawa]);

  const atRiskInScope = useMemo(() => {
    return mustawaScopedStudents.filter((s) => riskById.get(s.id)?.isAtRisk);
  }, [mustawaScopedStudents, riskById]);

  const filteredStudents = useMemo(() => {
    const filtered = mustawaScopedStudents.filter((s) => {
      if (atRiskOnly && !riskById.get(s.id)?.isAtRisk) return false;
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        s.id.toLowerCase().includes(q) ||
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);
      return matchesSearch;
    });

    const mult = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return mult * a.fullName.localeCompare(b.fullName);
        case 'mustawa':
          return mult * a.mustawa.localeCompare(b.mustawa);
        case 'missed':
          return mult * (a.missedClasses - b.missedClasses);
        case 'avg': {
          const av = a.averageNetScore ?? -1;
          const bv = b.averageNetScore ?? -1;
          return mult * (av - bv);
        }
        case 'id':
        default: {
          const na = Number.parseInt(a.id, 10);
          const nb = Number.parseInt(b.id, 10);
          if (Number.isFinite(na) && Number.isFinite(nb)) {
            return mult * (na - nb);
          }
          return mult * a.id.localeCompare(b.id);
        }
      }
    });
  }, [mustawaScopedStudents, atRiskOnly, riskById, searchTerm, sortBy, sortDir]);

  const metrics = useMemo(() => {
    const total = filteredStudents.length;
    const totalSessions = filteredStudents.reduce((acc, s) => acc + s.totalSessions, 0);
    const totalMissed = filteredStudents.reduce((acc, s) => acc + s.missedClasses, 0);
    const rate =
      totalSessions > 0
        ? Math.round(((totalSessions - totalMissed) / totalSessions) * 1000) / 10
        : 100;
    const atRisk = filteredStudents.filter((s) => riskById.get(s.id)?.isAtRisk).length;
    const activeNotices = announcements.filter(
      (a) => selectedMustawa === 'ALL' || a.mustawa === selectedMustawa
    ).length;
    return { total, rate, atRisk, activeNotices };
  }, [filteredStudents, riskById, announcements, selectedMustawa]);

  const bulkPreview = useMemo(() => parseBulkStudentInput(bulkRawText), [bulkRawText]);

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSavingStudent(true);
    setActionError(null);
    try {
      await createSingleStudent('admin', {
        id: newId.trim() || undefined,
        fullName: newName.trim(),
        mustawa: newMustawa,
        email: newEmail.trim(),
        phone: newPhone.trim(),
      });
      setNewId('');
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setShowAddModal(false);
      await onRefresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to add student');
    } finally {
      setSavingStudent(false);
    }
  }

  async function handleBulkImport() {
    if (bulkPreview.students.length === 0) return;
    setImportingBulk(true);
    setActionError(null);
    try {
      await bulkImportStudentsApi('admin', bulkMustawa, bulkPreview.students);
      setBulkRawText('');
      setShowBulkModal(false);
      await onRefresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Bulk import failed');
    } finally {
      setImportingBulk(false);
    }
  }

  async function handleDelete(id: string) {
    setActionError(null);
    try {
      await removeStudent('admin', id);
      await onRefresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to remove student');
    }
  }

  function openEditModal(s: StudentRecord) {
    setEditingStudent(s);
    setEditName(s.fullName);
    setEditMustawa(s.mustawa);
    setEditEmail(s.email);
    setEditPhone(s.phone);
    setActionError(null);
  }

  async function handleUpdateStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!editingStudent || !editName.trim()) return;
    setUpdatingStudent(true);
    setActionError(null);
    try {
      await updateSingleStudent('admin', editingStudent.id, {
        fullName: editName.trim(),
        mustawa: editMustawa,
        email: editEmail.trim(),
        phone: editPhone.trim(),
      });
      setEditingStudent(null);
      await onRefresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update student');
    } finally {
      setUpdatingStudent(false);
    }
  }

  function toggleSort(column: 'id' | 'name' | 'mustawa' | 'missed' | 'avg') {
    if (sortBy === column) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDir(column === 'missed' ? 'desc' : 'asc');
    }
  }

  function handleCsvFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBulkRawText(reader.result);
      }
    };
    reader.readAsText(file);
  }

  function renderStanding(standing: StudentRecord['standing']) {
    if (standing === 'good') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{t.standingGood}</span>
        </span>
      );
    }
    if (standing === 'warning') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 whitespace-nowrap">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{t.standingWarning}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 whitespace-nowrap">
        <XCircle className="w-3.5 h-3.5" />
        <span>{standing === 'barred' ? t.standingBarred : t.standingCritical}</span>
      </span>
    );
  }

  return (
    <div className="space-y-6">
      <PrintOfficialHeader
        t={t}
        reportTitle={t.studentDirectory}
        metadataItems={[
          `${t.mustawaLabel}: ${selectedMustawa === 'ALL' ? t.allMustawas : selectedMustawa}`,
          `${t.totalStudents}: ${metrics.total}`,
          `${t.avgAttendanceRate}: ${metrics.rate}%`,
          t.penaltyRuleSummary,
        ]}
      />

      {/* 4-Column Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] p-5">
          <p className="text-xs font-medium text-stone-500">{t.totalStudents}</p>
          <p className="mt-2 font-mono tabular-nums text-2xl font-bold text-stone-900">
            {metrics.total}
          </p>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] p-5">
          <p className="text-xs font-medium text-stone-500">{t.avgAttendanceRate}</p>
          <p className="mt-2 font-mono tabular-nums text-2xl font-bold text-emerald-800">
            {metrics.rate}%
          </p>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] p-5">
          <p className="text-xs font-medium text-stone-500">{t.riskMetricLabel}</p>
          <p className="mt-2 font-mono tabular-nums text-2xl font-bold text-rose-700">
            {metrics.atRisk}
          </p>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] p-5">
          <p className="text-xs font-medium text-stone-500">{t.totalAnnouncements}</p>
          <p className="mt-2 font-mono tabular-nums text-2xl font-bold text-emerald-950">
            {metrics.activeNotices}
          </p>
        </div>
      </div>

      {/* Automatic At-Risk Students Alert Strip */}
      {atRiskInScope.length > 0 && (
        <section
          aria-label={t.atRiskBannerTitle}
          className="no-print bg-amber-50/75 border border-amber-200 rounded-lg p-5 space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h3 className="font-display text-sm font-bold text-stone-900">
                  {t.atRiskBannerTitle} ({atRiskInScope.length})
                </h3>
                <p className="text-xs text-stone-600">{t.atRiskBannerDesc}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAtRiskOnly((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                atRiskOnly
                  ? 'bg-rose-700 text-white border-rose-700'
                  : 'bg-white text-stone-800 border-amber-300 hover:bg-amber-100/70'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>
                {t.filterAtRiskOnly} ({atRiskInScope.length})
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {atRiskInScope.map((s) => {
              const sRisk = riskById.get(s.id);
              const isCritical = sRisk?.highestSeverity === 'critical';
              const reasonLabel = sRisk?.hasLowGradeRisk
                ? s.lowestNetScore !== undefined && s.lowestNetScore !== null && s.lowestNetScore < 50
                  ? `${t.badgeBelow50} (${s.lowestNetScore.toFixed(0)}%)`
                  : `${t.badgeNearThreshold} (${(s.averageNetScore ?? s.lowestNetScore ?? 50).toFixed(0)}%)`
                : `${s.missedClasses} ${t.colMissed}`;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onInspectStudent(s.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    isCritical
                      ? 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100'
                      : 'bg-white text-amber-950 border-amber-200 hover:bg-amber-100/80'
                  }`}
                >
                  <span className="font-mono font-semibold">#{s.id}</span>
                  <span>{s.fullName}</span>
                  <span className="text-stone-400">·</span>
                  <span className="font-mono text-[11px]">{reasonLabel}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Recharts Oversight Widget */}
      <MustawaAnalyticsWidget
        t={t}
        students={students}
        attendanceBuckets={attendanceBuckets}
        selectedMustawa={selectedMustawa}
        onSelectMustawa={onSelectMustawa}
      />

      {/* Filter & Actions Bar */}
      <div className="no-print bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] p-5 space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="relative w-full xl:w-64 shrink-0">
            <Search className="w-4 h-4 text-stone-400 absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" />
            <input
              type="text"
              aria-label={t.filterByNameOrId}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.filterByNameOrId}
              className="w-full ps-9 pe-3 py-2 text-sm bg-stone-50/40 border border-stone-300 rounded-md text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-emerald-900 rounded-md hover:bg-emerald-800 whitespace-nowrap shrink-0 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addStudent}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowBulkModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 whitespace-nowrap shrink-0 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t.bulkImport}</span>
            </button>
            <button
              type="button"
              onClick={() => exportStudentsDirectoryCsv(filteredStudents, selectedMustawa)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 whitespace-nowrap shrink-0 transition-colors"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-800" />
              <span>{t.exportCsv}</span>
            </button>
            <button
              type="button"
              onClick={() => exportStudentsDirectoryExcel(filteredStudents, selectedMustawa)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 whitespace-nowrap shrink-0 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.exportExcel}</span>
            </button>
            <button
              type="button"
              onClick={() => exportStudentsDirectoryPdf(filteredStudents, selectedMustawa)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 whitespace-nowrap shrink-0 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-rose-700" />
              <span>{t.exportPdf}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 whitespace-nowrap shrink-0 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-stone-700" />
              <span>{t.printTranscript}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2 border-t border-stone-100">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-100 rounded-md w-fit max-w-full">
            <button
              type="button"
              onClick={() => onSelectMustawa('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap shrink-0 transition-colors ${
                selectedMustawa === 'ALL'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t.allMustawas}
            </button>
            {ALL_MUSTAWA_OPTIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onSelectMustawa(m)}
                className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap shrink-0 transition-colors ${
                  selectedMustawa === m
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <p className="text-xs text-stone-500">
            {t.penaltyPolicyTitle}: {t.penaltyRuleSummary}
          </p>
        </div>

        {actionError && (
          <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3.5 py-2.5">
            {actionError}
          </div>
        )}
      </div>

      {/* Inline CSV Bulk Import File Input Component */}
      <CsvBulkImportCard
        t={t}
        selectedMustawa={selectedMustawa}
        existingStudentIds={existingStudentIds}
        onImported={onRefresh}
      />

      {/* High-Density Student Table */}
      <div className="print-card-clean bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-100/80 text-xs text-stone-600 border-b border-stone-200">
              <tr>
                <th className="text-start font-medium px-5 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort('id')}
                    className="inline-flex items-center gap-1 hover:text-stone-900"
                  >
                    <span>{t.colId}</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </button>
                </th>
                <th className="text-start font-medium px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort('name')}
                    className="inline-flex items-center gap-1 hover:text-stone-900"
                  >
                    <span>{t.colName}</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </button>
                </th>
                <th className="text-start font-medium px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort('mustawa')}
                    className="inline-flex items-center gap-1 hover:text-stone-900"
                  >
                    <span>{t.colMustawa}</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </button>
                </th>
                <th className="text-end font-medium px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort('missed')}
                    className="inline-flex items-center gap-1 hover:text-stone-900"
                  >
                    <span>{t.colMissed}</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </button>
                </th>
                <th className="text-end font-medium px-4 py-3">{t.colPenalty}</th>
                <th className="text-end font-medium px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort('avg')}
                    className="inline-flex items-center gap-1 hover:text-stone-900"
                  >
                    <span>{t.colAvgNet}</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </button>
                </th>
                <th className="text-start font-medium px-4 py-3">{t.colStanding}</th>
                <th className="no-print text-end font-medium px-5 py-3">{t.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-stone-500">
                    {t.noStudentsFound}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const sRisk = riskById.get(s.id);
                  const isCritical = sRisk?.highestSeverity === 'critical';
                  const isWarning = sRisk?.highestSeverity === 'warning';
                  const avgTier =
                    s.averageNetScore !== null ? getExamScoreTier(s.averageNetScore) : 'ok';
                  const lowestTier =
                    s.lowestNetScore !== undefined && s.lowestNetScore !== null
                      ? getExamScoreTier(s.lowestNetScore)
                      : 'ok';

                  return (
                    <tr
                      key={s.id}
                      className={`transition-colors ${
                        isCritical
                          ? 'bg-rose-50/40 hover:bg-rose-50/70'
                          : isWarning
                          ? 'bg-amber-50/35 hover:bg-amber-50/60'
                          : 'hover:bg-stone-50/90'
                      }`}
                    >
                      <td className="px-5 py-3 font-mono tabular-nums font-semibold text-stone-900">
                        #{s.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-stone-900">{s.fullName}</span>
                          {sRisk?.isAtRisk && (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border whitespace-nowrap ${
                                isCritical
                                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                                  : 'bg-amber-100 text-amber-800 border-amber-200'
                              }`}
                            >
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span>
                                {sRisk.hasLowGradeRisk
                                  ? lowestTier === 'failing' || avgTier === 'failing'
                                    ? t.badgeBelow50
                                    : t.badgeNearThreshold
                                  : t.badgeHighAbsence}
                              </span>
                            </span>
                          )}
                        </div>
                        {s.email && <div className="text-xs text-stone-500">{s.email}</div>}
                      </td>
                      <td className="px-4 py-3 text-stone-700 whitespace-nowrap">{s.mustawa}</td>
                      <td className="px-4 py-3 text-end font-mono tabular-nums text-stone-800">
                        {s.missedClasses}
                      </td>
                      <td
                        className={`px-4 py-3 text-end font-mono tabular-nums font-medium ${
                          s.deductionPercent > 0 ? 'text-rose-700' : 'text-stone-600'
                        }`}
                      >
                        <span dir="ltr" className="inline-block">
                          -{s.deductionPercent}%
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 text-end font-mono tabular-nums font-semibold ${
                          avgTier === 'failing'
                            ? 'text-rose-700'
                            : avgTier === 'near'
                            ? 'text-amber-700'
                            : 'text-stone-900'
                        }`}
                      >
                        {s.averageNetScore !== null ? `${s.averageNetScore.toFixed(1)}%` : '—'}
                      </td>
                      <td className="px-4 py-3">{renderStanding(s.standing)}</td>
                      <td className="no-print px-5 py-3 text-end">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onInspectStudent(s.id)}
                            aria-label={`${t.viewProfile} ${s.fullName}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-950 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 whitespace-nowrap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{t.viewProfile}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(s)}
                            aria-label={`${t.editStudent} ${s.fullName}`}
                            className="p-1.5 text-stone-500 hover:text-emerald-900 rounded-md hover:bg-stone-100 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(s.id)}
                            aria-label={`${t.deleteStudent} ${s.fullName}`}
                            className="p-1.5 text-stone-400 hover:text-rose-700 rounded-md hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

      {/* Add Student Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-student-title"
          className="fixed inset-0 z-50 bg-stone-900/50 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-stone-200 rounded-lg w-full max-w-md p-6 space-y-5 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 id="add-student-title" className="font-display text-lg font-semibold text-stone-900">
                {t.addStudentTitle}
              </h3>
              <button
                type="button"
                aria-label={t.close}
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {t.studentIdOptional}
                </label>
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  placeholder="e.g. 25"
                  className="w-full px-3 py-2 text-sm font-mono border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {t.fullNameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {t.mustawaLabel}
                </label>
                <select
                  value={newMustawa}
                  onChange={(e) => setNewMustawa(e.target.value as MustawaLevel)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md bg-white"
                >
                  {MUSTAWA_LEVELS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    {t.emailLabel}
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    {t.phoneLabel}
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={savingStudent}
                  className="px-4 py-2 text-xs font-medium text-white bg-emerald-900 rounded-md hover:bg-emerald-800 disabled:opacity-60"
                >
                  {savingStudent ? t.saving : t.saveStudent}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-import-title"
          className="fixed inset-0 z-50 bg-stone-900/50 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-stone-200 rounded-lg w-full max-w-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="flex items-center justify-between">
              <h3 id="bulk-import-title" className="font-display text-lg font-semibold text-stone-900">
                {t.bulkImportTitle}
              </h3>
              <button
                type="button"
                aria-label={t.close}
                onClick={() => setShowBulkModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-stone-600">{t.bulkImportDesc}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {t.targetMustawa}
                </label>
                <select
                  value={bulkMustawa}
                  onChange={(e) => setBulkMustawa(e.target.value as MustawaLevel)}
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
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {t.uploadCsvFile}
                </label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleCsvFileUpload}
                  className="block w-full text-xs text-stone-600 file:me-3 file:py-2 file:px-3 file:rounded-md file:border file:border-stone-300 file:text-xs file:font-medium file:bg-stone-50 file:text-stone-700 hover:file:bg-stone-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="bulk-paste-area"
                className="block text-xs font-medium text-stone-700 mb-1"
              >
                {t.pasteStudentList}
              </label>
              <textarea
                id="bulk-paste-area"
                rows={6}
                value={bulkRawText}
                onChange={(e) => setBulkRawText(e.target.value)}
                placeholder={'101, Salma Hassan Noor, salma@mustawa.edu, +2526150001\n102, Ibrahim Mohamed Ali\nKaltun Abdi Farah'}
                className="w-full px-3.5 py-2.5 text-sm font-mono border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-800"
              />
            </div>

            {bulkPreview.students.length > 0 && (
              <div className="border border-stone-200 rounded-md overflow-hidden">
                <div className="bg-stone-50 px-4 py-2 border-b border-stone-200 text-xs font-medium text-stone-700 flex items-center justify-between">
                  <span>
                    {t.importPreview}: {bulkPreview.students.length}
                  </span>
                  <span className="text-stone-500">{bulkMustawa}</span>
                </div>
                <div className="max-h-40 overflow-y-auto divide-y divide-stone-100 text-xs">
                  {bulkPreview.students.map((st, idx) => (
                    <div key={idx} className="px-4 py-2 flex items-center justify-between gap-4">
                      <span className="font-mono text-stone-500">
                        {st.studentId ? `#${st.studentId}` : 'Auto ID'}
                      </span>
                      <span className="font-medium text-stone-900 flex-1">{st.fullName}</span>
                      <span className="text-stone-500">{st.email || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                disabled={bulkPreview.students.length === 0 || importingBulk}
                onClick={handleBulkImport}
                className="px-4 py-2 text-xs font-medium text-white bg-emerald-900 rounded-md hover:bg-emerald-800 disabled:opacity-50"
              >
                {importingBulk ? t.saving : `${t.confirmImport} (${bulkPreview.students.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-student-title"
          className="fixed inset-0 z-50 bg-stone-900/50 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-stone-200 rounded-lg w-full max-w-md p-6 space-y-5 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 id="edit-student-title" className="font-display text-lg font-semibold text-stone-900">
                {t.editStudentTitle} · #{editingStudent.id}
              </h3>
              <button
                type="button"
                aria-label={t.close}
                onClick={() => setEditingStudent(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {t.fullNameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {t.mustawaLabel}
                </label>
                <select
                  value={editMustawa}
                  onChange={(e) => setEditMustawa(e.target.value as MustawaLevel)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md bg-white"
                >
                  {ALL_MUSTAWA_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    {t.emailLabel}
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    {t.phoneLabel}
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={updatingStudent}
                  className="px-4 py-2 text-xs font-medium text-white bg-emerald-900 rounded-md hover:bg-emerald-800 disabled:opacity-60"
                >
                  {updatingStudent ? t.saving : t.updateStudent}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
