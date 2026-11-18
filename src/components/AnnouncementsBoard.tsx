import { useState } from 'react';
import { Megaphone, Trash2, Sparkles, Send } from 'lucide-react';
import type { Language, Translations } from '../i18n/translations';
import type { AnnouncementRecord } from '../types/academic';
import { MUSTAWA_LEVELS, type MustawaLevel } from '../utils/academicLogic';
import {
  createAnnouncementApi,
  deleteAnnouncementApi,
  translateNoticeApi,
  type UserRole,
} from '../utils/api';
import { VoiceRecorderButton } from './VoiceRecorderButton';

interface AnnouncementsBoardProps {
  t: Translations;
  lang: Language;
  role: UserRole;
  announcements: AnnouncementRecord[];
  selectedMustawa: string;
  onSelectMustawa: (m: string) => void;
  onRefresh: () => Promise<void>;
}

export function AnnouncementsBoard({
  t,
  lang,
  role,
  announcements,
  selectedMustawa,
  onSelectMustawa,
  onRefresh,
}: AnnouncementsBoardProps) {
  const [targetMustawa, setTargetMustawa] = useState<MustawaLevel>(
    selectedMustawa !== 'ALL' && MUSTAWA_LEVELS.includes(selectedMustawa as MustawaLevel)
      ? (selectedMustawa as MustawaLevel)
      : 'Mustawa 1'
  );
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleAnnouncements = announcements.filter(
    (a) => selectedMustawa === 'ALL' || a.mustawa === selectedMustawa
  );

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setPublishing(true);
    setError(null);
    try {
      await createAnnouncementApi(role, {
        mustawa: targetMustawa,
        title: title.trim(),
        body: body.trim(),
      });
      setTitle('');
      setBody('');
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish notice');
    } finally {
      setPublishing(false);
    }
  }

  async function handleTranslate() {
    if (!title.trim() && !body.trim()) return;
    setTranslating(true);
    setError(null);
    try {
      const res = await translateNoticeApi(role, {
        title,
        body,
        targetLanguage: lang,
      });
      setTitle(res.title);
      setBody(res.body);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI translation failed');
    } finally {
      setTranslating(false);
    }
  }

  async function handleDelete(id: number) {
    setError(null);
    try {
      await deleteAnnouncementApi(role, id);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete announcement');
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-semibold text-stone-900">
              {t.announcementsTitle}
            </h2>
            <p className="text-sm text-stone-600">{t.announcementsDesc}</p>
          </div>
        </div>

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
          {MUSTAWA_LEVELS.map((m) => (
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
      </div>

      {/* Admin Announcement Composer */}
      {role === 'admin' && (
        <form
          onSubmit={handlePublish}
          className="bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] p-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-display text-base font-semibold text-stone-900">
              {t.postAnnouncement}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <VoiceRecorderButton
                startLabel={t.dictateWithMic}
                stopLabel={t.voiceRecordStop}
                transcribingLabel={t.transcribingAudio}
                hintLanguage={lang === 'ar' ? 'Arabic' : lang === 'so' ? 'Somali' : 'English'}
                onTranscript={(text) => setBody((prev) => (prev ? `${prev} ${text}` : text))}
                onError={(msg) => setError(msg)}
              />
              <button
                type="button"
                onClick={handleTranslate}
                disabled={translating || (!title.trim() && !body.trim())}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-950 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{translating ? t.loading : t.translateWithAi}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="ann-mustawa" className="block text-xs font-medium text-stone-700 mb-1">
                {t.targetMustawa}
              </label>
              <select
                id="ann-mustawa"
                value={targetMustawa}
                onChange={(e) => setTargetMustawa(e.target.value as MustawaLevel)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md bg-white"
              >
                {MUSTAWA_LEVELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="ann-title" className="block text-xs font-medium text-stone-700 mb-1">
                {t.announcementTitlePlaceholder}
              </label>
              <input
                id="ann-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.announcementTitlePlaceholder}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-800"
              />
            </div>
          </div>

          <div>
            <textarea
              rows={3}
              required
              aria-label={t.announcementBodyPlaceholder}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t.announcementBodyPlaceholder}
              className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-800"
            />
          </div>

          {error && (
            <p className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={publishing}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-emerald-900 rounded-md hover:bg-emerald-800 disabled:opacity-50 whitespace-nowrap transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{publishing ? t.saving : t.publishNotice}</span>
            </button>
          </div>
        </form>
      )}

      {/* Notices Feed */}
      <div className="bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] divide-y divide-stone-100">
        {visibleAnnouncements.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Megaphone className="w-6 h-6 text-stone-300 mx-auto" />
            <p className="text-sm text-stone-500">{t.noAnnouncements}</p>
          </div>
        ) : (
          visibleAnnouncements.map((ann) => {
            const isArabicText = /[\u0600-\u06FF]/.test(`${ann.title} ${ann.body}`);
            return (
              <article
                key={ann.id}
                dir={isArabicText ? 'rtl' : 'ltr'}
                className="p-6 flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                    <span className="font-semibold text-emerald-900">{ann.mustawa}</span>
                    <span aria-hidden="true">·</span>
                    <span>{ann.author}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{ann.createdAt.slice(0, 10)}</span>
                  </div>
                  <h3 className="font-display text-base font-semibold text-stone-900">
                    {ann.title}
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                    {ann.body}
                  </p>
                </div>
                {role === 'admin' && (
                  <button
                    type="button"
                    aria-label={`Delete announcement ${ann.title}`}
                    onClick={() => handleDelete(ann.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-700 rounded-md hover:bg-rose-50 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
