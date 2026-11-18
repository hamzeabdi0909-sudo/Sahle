import { useMemo, useState } from 'react';
import { ArrowRight, GraduationCap } from 'lucide-react';
import type { Translations } from '../i18n/translations';
import type { StudentRecord } from '../types/academic';
import {
  ALL_MUSTAWA_OPTIONS,
  MUSTAWA_LEVELS,
  getNextMustawa,
  type MustawaLevel,
} from '../utils/academicLogic';
import { promoteStudentsApi } from '../utils/api';

interface PromotionPanelProps {
  t: Translations;
  students: StudentRecord[];
  onPromoted: () => Promise<void>;
}

export function PromotionPanel({ t, students, onPromoted }: PromotionPanelProps) {
  const [sourceMustawa, setSourceMustawa] = useState<MustawaLevel>('Mustawa 1');
  const [targetMustawa, setTargetMustawa] = useState<MustawaLevel>('Mustawa 2');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [promoting, setPromoting] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cohort = useMemo(
    () => students.filter((s) => s.mustawa === sourceMustawa),
    [students, sourceMustawa]
  );

  function handleSourceChange(nextSource: MustawaLevel) {
    setSourceMustawa(nextSource);
    setTargetMustawa(getNextMustawa(nextSource));
    setSelectedIds(new Set());
    setResultMsg(null);
  }

  function toggleId(id: string) {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === cohort.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cohort.map((s) => s.id)));
    }
  }

  async function executePromotion(promoteWholeCohort: boolean) {
    setPromoting(true);
    setError(null);
    setResultMsg(null);
    try {
      const res = await promoteStudentsApi('admin', {
        sourceMustawa: promoteWholeCohort ? sourceMustawa : undefined,
        targetMustawa,
        studentIds: promoteWholeCohort ? undefined : Array.from(selectedIds),
      });
      setSelectedIds(new Set());
      setResultMsg(
        `${t.promotionSuccess}: ${res.promotedCount} → ${res.destinationMustawa}`
      );
      await onPromoted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Promotion failed');
    } finally {
      setPromoting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] p-6 space-y-5">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-semibold text-stone-900">
            {t.promotionTitle}
          </h2>
          <p className="text-sm text-stone-600">{t.promotionDesc}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="promo-source" className="block text-xs font-medium text-stone-700 mb-1">
              {t.sourceMustawa}
            </label>
            <select
              id="promo-source"
              value={sourceMustawa}
              onChange={(e) => handleSourceChange(e.target.value as MustawaLevel)}
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
            <label htmlFor="promo-dest" className="block text-xs font-medium text-stone-700 mb-1">
              {t.destinationMustawa}
            </label>
            <select
              id="promo-dest"
              value={targetMustawa}
              onChange={(e) => setTargetMustawa(e.target.value as MustawaLevel)}
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md bg-white"
            >
              {ALL_MUSTAWA_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={promoting || selectedIds.size === 0 || sourceMustawa === targetMustawa}
              onClick={() => executePromotion(false)}
              className="px-3.5 py-2 text-xs font-medium text-stone-800 bg-stone-100 border border-stone-300 rounded-md hover:bg-stone-200 disabled:opacity-50 whitespace-nowrap"
            >
              {t.promoteSelected} ({selectedIds.size})
            </button>
            <button
              type="button"
              disabled={promoting || cohort.length === 0 || sourceMustawa === targetMustawa}
              onClick={() => executePromotion(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-900 rounded-md hover:bg-emerald-800 disabled:opacity-50 whitespace-nowrap transition-colors"
            >
              <GraduationCap className="w-4 h-4" />
              <span>{t.promoteAllInMustawa}</span>
            </button>
          </div>
        </div>

        {resultMsg && (
          <div className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md px-3.5 py-2.5">
            {resultMsg}
          </div>
        )}
        {error && (
          <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3.5 py-2.5">
            {error}
          </div>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] overflow-hidden">
        <div className="px-5 py-3.5 bg-stone-100/80 border-b border-stone-200 flex items-center justify-between text-xs font-medium text-stone-700">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-emerald-900 hover:underline"
            >
              {t.selectAll} ({cohort.length})
            </button>
            <span className="text-stone-400">·</span>
            <span>
              {selectedIds.size} {t.studentsSelected}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-600">
            <span>{sourceMustawa}</span>
            <ArrowRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-emerald-900">{targetMustawa}</span>
          </div>
        </div>

        <div className="divide-y divide-stone-100">
          {cohort.length === 0 ? (
            <p className="p-8 text-center text-sm text-stone-500">{t.noStudentsFound}</p>
          ) : (
            cohort.map((s) => (
              <label
                key={s.id}
                className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-stone-50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(s.id)}
                    onChange={() => toggleId(s.id)}
                    className="w-4 h-4 rounded border-stone-300 text-emerald-900 focus:ring-emerald-800 accent-emerald-900"
                  />
                  <span className="font-mono tabular-nums text-xs font-semibold text-stone-600">
                    #{s.id}
                  </span>
                  <span className="text-sm font-medium text-stone-900">{s.fullName}</span>
                </div>
                <div className="text-xs font-mono tabular-nums text-stone-500">
                  {s.averageNetScore !== null ? `${s.averageNetScore.toFixed(1)}%` : '—'}
                </div>
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
