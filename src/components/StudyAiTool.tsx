import { useEffect, useState } from 'react';
import {
  FileUp,
  Sparkles,
  BookOpen,
  HelpCircle,
  KeyRound,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import type { Language, Translations } from '../i18n/translations';
import type { StudyGuideRecord } from '../types/academic';
import { fetchStudyGuides, generateStudyGuideApi } from '../utils/api';
import { VoiceRecorderButton } from './VoiceRecorderButton';

interface StudyAiToolProps {
  t: Translations;
  lang: Language;
}

export function StudyAiTool({ t, lang }: StudyAiToolProps) {
  const [pdfFileName, setPdfFileName] = useState<string>('');
  const [pdfBase64, setPdfBase64] = useState<string>('');
  const [rawText, setRawText] = useState<string>('');
  const [outputLanguage, setOutputLanguage] = useState<string>('auto');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [guides, setGuides] = useState<StudyGuideRecord[]>([]);
  const [activeGuide, setActiveGuide] = useState<StudyGuideRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'quiz' | 'answers'>('summary');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizChecked, setQuizChecked] = useState(false);

  useEffect(() => {
    fetchStudyGuides()
      .then((list) => {
        setGuides(list);
        if (list.length > 0) setActiveGuide(list[0]);
      })
      .catch(() => {});
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      setError('PDF file exceeds 12 MB limit.');
      return;
    }
    setError(null);
    setPdfFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const comma = result.indexOf(',');
      setPdfBase64(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.readAsDataURL(file);
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!pdfBase64 && !rawText.trim()) {
      setError('Upload a PDF document or paste lecture notes first.');
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const guide = await generateStudyGuideApi({
        pdfBase64: pdfBase64 || undefined,
        fileName: pdfFileName || undefined,
        rawText: rawText.trim() || undefined,
        outputLanguage,
        questionCount,
      });
      setGuides((prev) => [guide, ...prev]);
      setActiveGuide(guide);
      setActiveTab('summary');
      setSelectedAnswers({});
      setQuizChecked(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze PDF');
    } finally {
      setGenerating(false);
    }
  }

  const isGuideArabic = activeGuide
    ? /[\u0600-\u06FF]/.test(`${activeGuide.title} ${activeGuide.summary}`)
    : false;

  const quizScore = activeGuide
    ? activeGuide.quiz.reduce(
        (acc, q, idx) => (selectedAnswers[idx] === q.correctIndex ? acc + 1 : acc),
        0
      )
    : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] p-6 space-y-5">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-semibold text-stone-900">
            {t.studyAiTitle}
          </h2>
          <p className="text-sm text-stone-600">{t.studyAiDesc}</p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <label className="flex flex-col items-center justify-center border border-dashed border-stone-300 rounded-lg p-6 bg-stone-50/60 hover:bg-stone-50 cursor-pointer transition-colors">
              <FileUp className="w-6 h-6 text-emerald-900 mb-2" />
              <span className="text-sm font-medium text-stone-900">
                {pdfFileName || t.uploadPdfLabel}
              </span>
              <span className="text-xs text-stone-500 mt-1 text-center">{t.uploadPdfHint}</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="study-raw-notes" className="text-xs font-medium text-stone-700">
                  {t.orPasteNotes}
                </label>
                <VoiceRecorderButton
                  startLabel={t.dictateWithMic}
                  stopLabel={t.voiceRecordStop}
                  transcribingLabel={t.transcribingAudio}
                  hintLanguage={lang === 'ar' ? 'Arabic' : lang === 'so' ? 'Somali' : 'English'}
                  onTranscript={(text) => setRawText((prev) => (prev ? `${prev}\n${text}` : text))}
                  onError={(msg) => setError(msg)}
                />
              </div>
              <textarea
                id="study-raw-notes"
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="مثال: علم الصرف وبناء الكلمة العربية / Lecture notes..."
                className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-800"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label
                  htmlFor="study-lang"
                  className="block text-xs font-medium text-stone-700 mb-1"
                >
                  {t.outputLanguageLabel}
                </label>
                <select
                  id="study-lang"
                  value={outputLanguage}
                  onChange={(e) => setOutputLanguage(e.target.value)}
                  className="px-3 py-2 text-sm border border-stone-300 rounded-md bg-white"
                >
                  <option value="auto">Auto (Match PDF)</option>
                  <option value="Arabic (Modern Standard Arabic)">العربية (Arabic)</option>
                  <option value="English">English</option>
                  <option value="Somali">Soomaali</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="study-qcount"
                  className="block text-xs font-medium text-stone-700 mb-1"
                >
                  {t.questionCountLabel}
                </label>
                <select
                  id="study-qcount"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="px-3 py-2 text-sm font-mono border border-stone-300 rounded-md bg-white"
                >
                  {[3, 5, 8, 10].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-900 rounded-md hover:bg-emerald-800 disabled:opacity-60 whitespace-nowrap transition-colors"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.generatingStudyPack}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.generateStudyPack}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3.5 py-2.5">
            {error}
          </div>
        )}
      </div>

      {/* Results & Saved Study Guides */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Saved Guides List */}
        <aside className="bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-200 bg-stone-100/80">
            <h3 className="text-xs font-semibold text-stone-700">{t.savedGuidesTitle}</h3>
          </div>
          <div className="divide-y divide-stone-100">
            {guides.length === 0 ? (
              <p className="p-4 text-xs text-stone-500">
                Generated PDF summaries and quizzes will appear here.
              </p>
            ) : (
              guides.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setActiveGuide(g);
                    setSelectedAnswers({});
                    setQuizChecked(false);
                  }}
                  className={`w-full text-start px-4 py-3 text-xs space-y-1 transition-colors ${
                    activeGuide?.id === g.id ? 'bg-emerald-50 text-emerald-950' : 'hover:bg-stone-50'
                  }`}
                >
                  <p className="font-semibold line-clamp-1">{g.title}</p>
                  <p className="text-stone-500 truncate">
                    {g.sourceName} · {g.quiz.length} Qs
                  </p>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Active Study Guide Workspace */}
        <section className="lg:col-span-3 bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] overflow-hidden">
          {!activeGuide ? (
            <div className="p-12 text-center space-y-2">
              <BookOpen className="w-7 h-7 text-stone-300 mx-auto" />
              <p className="text-sm text-stone-500">{t.studyAiDesc}</p>
            </div>
          ) : (
            <div dir={isGuideArabic ? 'rtl' : 'ltr'}>
              <div className="px-6 py-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-stone-500">
                    {activeGuide.sourceName} · {activeGuide.language}
                  </p>
                  <h3 className="font-display text-lg font-bold text-stone-900">
                    {activeGuide.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-md shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('summary')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap ${
                      activeTab === 'summary'
                        ? 'bg-white text-stone-900 shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{t.summaryTab}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('quiz')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap ${
                      activeTab === 'quiz'
                        ? 'bg-white text-stone-900 shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{t.quizTab}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('answers')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap ${
                      activeTab === 'answers'
                        ? 'bg-white text-stone-900 shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{t.answerKeyTab}</span>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'summary' && (
                  <div className="space-y-6">
                    <div className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                      {activeGuide.summary}
                    </div>
                    {activeGuide.keyConcepts.length > 0 && (
                      <div className="pt-4 border-t border-stone-100 space-y-2.5">
                        <h4 className="text-xs font-semibold text-stone-900">Key Concepts</h4>
                        <ul className="space-y-1.5 text-sm text-stone-700 list-disc ps-5">
                          {activeGuide.keyConcepts.map((kc, i) => (
                            <li key={i}>{kc}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'quiz' && (
                  <div className="space-y-6">
                    {activeGuide.quiz.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className="border border-stone-200 rounded-lg p-4 space-y-3"
                      >
                        <p className="text-sm font-semibold text-stone-900">
                          {qIdx + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((opt, oIdx) => {
                            const chosen = selectedAnswers[qIdx] === oIdx;
                            const isCorrect = q.correctIndex === oIdx;
                            let highlight = 'border-stone-200 hover:bg-stone-50';
                            if (quizChecked) {
                              if (isCorrect) highlight = 'border-emerald-400 bg-emerald-50';
                              else if (chosen && !isCorrect)
                                highlight = 'border-rose-300 bg-rose-50';
                            } else if (chosen) {
                              highlight = 'border-emerald-800 bg-emerald-50';
                            }
                            return (
                              <label
                                key={oIdx}
                                className={`flex items-center gap-3 p-2.5 rounded-md border text-sm cursor-pointer transition-colors ${highlight}`}
                              >
                                <input
                                  type="radio"
                                  name={`quiz-q-${qIdx}`}
                                  checked={chosen}
                                  onChange={() =>
                                    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))
                                  }
                                  className="text-emerald-900 accent-emerald-900"
                                />
                                <span className="flex-1 text-stone-800">{opt}</span>
                                {quizChecked && isCorrect && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                                )}
                                {quizChecked && chosen && !isCorrect && (
                                  <XCircle className="w-4 h-4 text-rose-700 shrink-0" />
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-2">
                      {quizChecked ? (
                        <p className="font-mono tabular-nums text-sm font-bold text-stone-900">
                          {t.yourScore}: {quizScore} / {activeGuide.quiz.length}
                        </p>
                      ) : (
                        <span />
                      )}
                      <button
                        type="button"
                        onClick={() => setQuizChecked(true)}
                        className="px-4 py-2 text-xs font-medium text-white bg-emerald-900 rounded-md hover:bg-emerald-800"
                      >
                        {t.checkQuizScore}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'answers' && (
                  <div className="space-y-4">
                    {activeGuide.quiz.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className="border border-stone-200 rounded-lg p-4 space-y-2"
                      >
                        <p className="text-sm font-semibold text-stone-900">
                          {qIdx + 1}. {q.question}
                        </p>
                        <p className="text-sm font-medium text-emerald-800">
                          {t.correctAnswer}: {q.options[q.correctIndex]}
                        </p>
                        <p className="text-xs text-stone-600 leading-relaxed">
                          <span className="font-semibold text-stone-700">{t.explanationLabel}: </span>
                          {q.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
