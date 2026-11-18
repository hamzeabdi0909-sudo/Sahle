import { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Search,
  ArrowRight,
  Globe,
  BookOpen,
  User,
  CheckSquare,
  Table2,
  Megaphone,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';
import type { Language, Translations } from '../i18n/translations';
import { MUSTAWA_LEVELS, type MustawaLevel } from '../utils/academicLogic';

export type HomeTab = 'home' | 'books' | 'search' | 'files' | 'more';

export type GateAdminTab =
  | 'overview'
  | 'search'
  | 'attendance'
  | 'exams'
  | 'announcements'
  | 'study'
  | 'promotion';

interface RoleGateViewProps {
  t: Translations;
  lang: Language;
  onChangeLang: (l: Language) => void;
  onEnterStudent: (studentId: string) => Promise<void>;
  onEnterAdmin: (initialTab?: GateAdminTab, initialMustawa?: string) => void;
  errorMsg: string | null;
}

interface MustawaVolumeMeta {
  level: MustawaLevel;
  arabicTitle: string;
  subtitles: Record<Language, string>;
  bgClass: string;
  spineClass: string;
}

const MUSTAWA_VOLUMES: MustawaVolumeMeta[] = [
  {
    level: 'Mustawa 1',
    arabicTitle: 'المستوى الأول',
    subtitles: {
      en: 'Foundations · Nahw & Computing',
      ar: 'مبادئ النحو والحوسبة التأسيسية',
      so: 'Aasaaska Naxwaha & Kumbuyuutarka',
    },
    bgClass: 'bg-[#94443B] hover:bg-[#A04B41]',
    spineClass: 'border-e-[10px] border-[#6A2D26]',
  },
  {
    level: 'Mustawa 2',
    arabicTitle: 'المستوى الثاني',
    subtitles: {
      en: 'Arabic Morphology & Data Structures',
      ar: 'علم الصرف وهياكل البيانات',
      so: 'Cilmi Sarfiga & Qaab-dhismeedka Xogta',
    },
    bgClass: 'bg-[#A0683A] hover:bg-[#AE7241]',
    spineClass: 'border-e-[10px] border-[#754925]',
  },
  {
    level: 'Mustawa 3',
    arabicTitle: 'المستوى الثالث',
    subtitles: {
      en: 'Systems Architecture & Jurisprudence',
      ar: 'معمارية الأنظمة والفقه',
      so: 'Dhismaha Nidaamyada & Fiqiga',
    },
    bgClass: 'bg-[#3C664C] hover:bg-[#437356]',
    spineClass: 'border-e-[10px] border-[#274633]',
  },
  {
    level: 'Mustawa 4',
    arabicTitle: 'المستوى الرابع',
    subtitles: {
      en: 'Software Engineering & Usul al-Fiqh',
      ar: 'هندسة البرمجيات وأصول الفقه',
      so: 'Injineerinka Barnaamijyada & Usuulul Fiqiga',
    },
    bgClass: 'bg-[#314E5C] hover:bg-[#385969]',
    spineClass: 'border-e-[10px] border-[#1F3540]',
  },
  {
    level: 'Mustawa 5',
    arabicTitle: 'المستوى الخامس',
    subtitles: {
      en: 'Databases & Classical Rhetoric',
      ar: 'قواعد البيانات والبلاغة العربية',
      so: 'Kaydka Xogta & Balaaqada Carabiga',
    },
    bgClass: 'bg-[#94443B] hover:bg-[#A04B41]',
    spineClass: 'border-e-[10px] border-[#6A2D26]',
  },
  {
    level: 'Mustawa 6',
    arabicTitle: 'المستوى السادس',
    subtitles: {
      en: 'Distributed Systems & Hadith Sciences',
      ar: 'الأنظمة الموزعة وعلوم الحديث',
      so: 'Nidaamyada Qaybsan & Cilmiga Xadiiska',
    },
    bgClass: 'bg-[#A0683A] hover:bg-[#AE7241]',
    spineClass: 'border-e-[10px] border-[#754925]',
  },
  {
    level: 'Mustawa 7',
    arabicTitle: 'المستوى السابع',
    subtitles: {
      en: 'Applied AI & Comparative Scholarship',
      ar: 'الذكاء الاصطناعي والبحث المقارن',
      so: 'Sirdoonka Macmalka ah & Cilmi-baaris',
    },
    bgClass: 'bg-[#3C664C] hover:bg-[#437356]',
    spineClass: 'border-e-[10px] border-[#274633]',
  },
  {
    level: 'Mustawa 8',
    arabicTitle: 'المستوى الثامن',
    subtitles: {
      en: 'Capstone Research & Graduation Thesis',
      ar: 'بحث التخرج والرسالة العلمية',
      so: 'Mashruuca Qalin-jabinta & Qoraalka',
    },
    bgClass: 'bg-[#314E5C] hover:bg-[#385969]',
    spineClass: 'border-e-[10px] border-[#1F3540]',
  },
];

function HomeTabIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-[22px] h-[22px]"
      aria-hidden="true"
    >
      <path d="M4 10.5L12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-8.5z" />
    </svg>
  );
}

function MoreGridPlusIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-[22px] h-[22px]"
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <path d="M17 13.75v6.5M13.75 17h6.5" />
    </svg>
  );
}

export function RoleGateView({
  t,
  lang,
  onChangeLang,
  onEnterStudent,
  onEnterAdmin,
  errorMsg,
}: RoleGateViewProps) {
  const [activeTab, setActiveTab] = useState<HomeTab>('home');
  const [studentIdInput, setStudentIdInput] = useState(() => {
    return localStorage.getItem('mustawa_student_id') || '13';
  });
  const [passcode, setPasscode] = useState('admin123');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(false);

  async function handleStudentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentIdInput.trim()) return;
    setLoadingStudent(true);
    try {
      await onEnterStudent(studentIdInput.trim());
    } finally {
      setLoadingStudent(false);
    }
  }

  function enterAdminWithGuard(targetTab: GateAdminTab = 'overview', targetMustawa = 'ALL') {
    if (passcode.trim() !== 'admin123') {
      setPasscodeError('Invalid passcode (demo: admin123)');
      return;
    }
    setPasscodeError(null);
    onEnterAdmin(targetTab, targetMustawa);
  }

  function handleAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    enterAdminWithGuard('overview', 'ALL');
  }

  const bottomTabs: Array<{
    id: HomeTab;
    label: string;
  }> = [
    { id: 'home', label: t.bottomNavHome },
    { id: 'books', label: t.bottomNavBooks },
    { id: 'search', label: t.bottomNavSearch },
    { id: 'files', label: t.bottomNavFiles },
    { id: 'more', label: t.bottomNavMore },
  ];

  const featuredVolumes = MUSTAWA_VOLUMES.slice(0, 3);

  return (
    <div
      dir={t.dir}
      className="min-h-screen bg-[#10100F] text-[#F4F0E8] flex flex-col selection:bg-[#D4AF63] selection:text-[#141413]"
    >
      {/* Top Bar — 2 zones: Wordmark + Language Switcher */}
      <header className="sticky top-0 z-30 w-full border-b border-[#252522] bg-[#141413]/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4 sm:gap-8">
          <div className="flex items-center gap-2.5 shrink-0">
            <GraduationCap className="w-5 h-5 text-[#D4AF63]" />
            <span className="font-display text-lg font-bold tracking-tight text-[#F7F3EA] whitespace-nowrap">
              {t.appTitle}
            </span>
          </div>

          <div
            className="flex items-center gap-2 shrink-0"
            role="group"
            aria-label="Language switcher"
          >
            <Globe className="w-4 h-4 text-[#8C8C88] hidden sm:block" />
            <div className="flex items-center gap-1 p-1 bg-[#1C1C1A] border border-[#2A2A27] rounded-md">
              {(['en', 'ar', 'so'] as Language[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onChangeLang(code)}
                  className={`px-2.5 sm:px-3 py-1 text-xs font-medium rounded whitespace-nowrap shrink-0 transition-colors ${
                    lang === code
                      ? 'bg-[#D4AF63] text-[#141413] font-semibold'
                      : 'text-[#A39E93] hover:text-[#F4F0E8]'
                  }`}
                >
                  {code === 'en' ? 'English' : code === 'ar' ? 'العربية' : 'Soomaali'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Canvas (padded at bottom for fixed dark navigation bar) */}
      <main className="flex-1 px-4 sm:px-6 pt-8 pb-28">
        <div className="max-w-5xl mx-auto space-y-8">
          {activeTab === 'home' && (
            <>
              {/* Editorial Title Header */}
              <div className="max-w-2xl space-y-2">
                <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F7F3EA] text-balance">
                  {t.appTitle} · {t.appSubtitle}
                </h1>
                <p className="text-xs sm:text-sm text-[#A39E93] leading-relaxed">
                  {t.mustawaLabel} 1 — {t.mustawaLabel} 8 · {t.penaltyRuleSummary}
                </p>
              </div>

              {/* Dual Role Access Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                {/* Student Read-Only Portal Card */}
                <section className="bg-[#181816] border border-[#2A2A27] rounded-xl p-6 sm:p-7 flex flex-col gap-5">
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#22221E] border border-[#34322B] flex items-center justify-center">
                        <Search className="w-5 h-5 text-[#D4AF63]" />
                      </div>
                      <span className="text-xs font-medium text-[#A39E93]">{t.studentPortal}</span>
                    </div>
                    <div className="space-y-1">
                      <h2 className="font-display text-xl font-semibold text-[#F7F3EA]">
                        {t.studentIdLoginTitle}
                      </h2>
                      <p className="text-sm text-[#A39E93] leading-relaxed">
                        {t.studentIdLoginDesc}
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={handleStudentSubmit}
                    className="flex-1 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div>
                        <label
                          htmlFor="gate-student-id"
                          className="block text-xs font-medium text-[#C8C3B8] mb-1.5"
                        >
                          {t.colId}
                        </label>
                        <input
                          id="gate-student-id"
                          type="text"
                          value={studentIdInput}
                          onChange={(e) => setStudentIdInput(e.target.value)}
                          placeholder={t.enterStudentIdPlaceholder}
                          className="w-full px-3.5 py-2.5 text-sm font-mono bg-[#111110] border border-[#32322E] rounded-lg text-[#F7F3EA] placeholder:text-[#6E6C66] focus:outline-none focus:ring-2 focus:ring-[#D4AF63]"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#8C8C88]">
                        <span>{t.quickExamples}</span>
                        {['13', '19', '30', '10'].map((sampleId) => (
                          <button
                            key={sampleId}
                            type="button"
                            onClick={() => setStudentIdInput(sampleId)}
                            className="font-mono text-[#D4AF63] underline underline-offset-2 hover:text-[#E5C67E] px-1 py-0.5"
                          >
                            #{sampleId}
                          </button>
                        ))}
                      </div>

                      {errorMsg && (
                        <p className="text-xs font-medium text-rose-300 bg-rose-950/50 border border-rose-800/60 rounded-md px-3 py-2">
                          {errorMsg}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loadingStudent}
                      className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#141413] bg-[#D4AF63] rounded-lg hover:bg-[#DFBC72] transition-colors disabled:opacity-60"
                    >
                      <span>{loadingStudent ? t.loading : t.signInAsStudent}</span>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </button>
                  </form>
                </section>

                {/* Admin / Teacher Console Card */}
                <section className="bg-[#181816] border border-[#2A2A27] rounded-xl p-6 sm:p-7 flex flex-col gap-5">
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#1A2B23] border border-[#2B4739] flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-[#7AC49B]" />
                      </div>
                      <span className="text-xs font-medium text-[#A39E93]">{t.roleAdmin}</span>
                    </div>
                    <div className="space-y-1">
                      <h2 className="font-display text-xl font-semibold text-[#F7F3EA]">
                        {t.adminConsole}
                      </h2>
                      <p className="text-sm text-[#A39E93] leading-relaxed">
                        {t.adminConsoleDesc}
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={handleAdminSubmit}
                    className="flex-1 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div>
                        <label
                          htmlFor="gate-admin-passcode"
                          className="block text-xs font-medium text-[#C8C3B8] mb-1.5"
                        >
                          {t.adminPasscodeLabel}
                        </label>
                        <input
                          id="gate-admin-passcode"
                          type="password"
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm font-mono bg-[#111110] border border-[#32322E] rounded-lg text-[#F7F3EA] focus:outline-none focus:ring-2 focus:ring-[#7AC49B]"
                        />
                      </div>

                      {passcodeError && (
                        <p className="text-xs font-medium text-rose-300 bg-rose-950/50 border border-rose-800/60 rounded-md px-3 py-2">
                          {passcodeError}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#F7F3EA] bg-[#1F3B2F] border border-[#325D4B] rounded-lg hover:bg-[#274A3B] transition-colors"
                    >
                      <span>{t.signInAsAdmin}</span>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </button>
                  </form>
                </section>
              </div>

              {/* Scholarly Mustawa Book-Spine Shelf matching attached reference */}
              <section aria-label={t.mustawaLibraryTitle} className="space-y-3.5 pt-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h2 className="font-display text-lg font-semibold text-[#F7F3EA]">
                      {t.mustawaLibraryTitle}
                    </h2>
                    <p className="text-xs text-[#8C8C88]">{t.mustawaLibrarySubtitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('books')}
                    className="text-xs font-semibold text-[#D4AF63] hover:text-[#E5C67E] whitespace-nowrap shrink-0"
                  >
                    {t.bottomNavBooks} ({MUSTAWA_LEVELS.length})
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {featuredVolumes.map((vol) => (
                    <button
                      key={vol.level}
                      type="button"
                      onClick={() => enterAdminWithGuard('overview', vol.level)}
                      className={`group text-start rounded-lg ${vol.bgClass} ${vol.spineClass} px-5 py-6 transition-transform duration-150 hover:-translate-y-0.5 shadow-md flex flex-col justify-between min-h-[132px]`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs text-white/80 font-mono">
                        <span>{vol.level}</span>
                        <BookOpen className="w-4 h-4 opacity-80 group-hover:opacity-100" />
                      </div>
                      <div className="space-y-1 mt-3">
                        <p className="font-display text-2xl font-bold text-white leading-snug">
                          {vol.arabicTitle}
                        </p>
                        <p className="text-xs text-white/85 truncate">{vol.subtitles[lang]}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === 'books' && (
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1.5">
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F7F3EA]">
                    {t.mustawaLibraryTitle}
                  </h1>
                  <p className="text-sm text-[#A39E93]">{t.mustawaLibrarySubtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => enterAdminWithGuard('study', 'ALL')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#141413] bg-[#D4AF63] rounded-lg hover:bg-[#DFBC72] whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t.navStudyAi}</span>
                </button>
              </div>

              {/* Featured Pre-Seeded Arabic Study Volume */}
              <button
                type="button"
                onClick={() => enterAdminWithGuard('study', 'ALL')}
                className="w-full text-start bg-[#181816] border border-[#34322B] hover:border-[#D4AF63]/60 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
              >
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#D4AF63]">
                    {t.navStudyAi} · Mustawa 2
                  </p>
                  <h2 className="font-display text-xl font-bold text-[#F7F3EA]">
                    {t.arabicSampleGuideTitle}
                  </h2>
                  <p className="text-sm text-[#A39E93]">{t.arabicSampleGuideDesc}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4AF63] shrink-0">
                  <span>{t.openVolumeAction}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </span>
              </button>

              {/* All 8 Mustawa Book Volumes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {MUSTAWA_VOLUMES.map((vol) => (
                  <button
                    key={vol.level}
                    type="button"
                    onClick={() => enterAdminWithGuard('overview', vol.level)}
                    className={`group text-start rounded-lg ${vol.bgClass} ${vol.spineClass} p-5 transition-transform duration-150 hover:-translate-y-0.5 shadow-md flex flex-col justify-between min-h-[152px]`}
                  >
                    <div className="flex items-center justify-between text-xs text-white/80 font-mono">
                      <span>{vol.level}</span>
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 mt-4">
                      <p className="font-display text-2xl font-bold text-white">
                        {vol.arabicTitle}
                      </p>
                      <p className="text-xs text-white/85 line-clamp-2">{vol.subtitles[lang]}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'search' && (
            <section className="max-w-xl mx-auto bg-[#181816] border border-[#2A2A27] rounded-xl p-6 sm:p-8 space-y-6">
              <div className="space-y-1.5">
                <h1 className="font-display text-2xl font-bold text-[#F7F3EA]">
                  {t.searchPortalTitle}
                </h1>
                <p className="text-sm text-[#A39E93]">{t.studentIdLoginDesc}</p>
              </div>

              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="search-tab-student-id"
                    className="block text-xs font-medium text-[#C8C3B8] mb-1.5"
                  >
                    {t.colId}
                  </label>
                  <input
                    id="search-tab-student-id"
                    type="text"
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value)}
                    placeholder={t.enterStudentIdPlaceholder}
                    className="w-full px-4 py-3 text-base font-mono bg-[#111110] border border-[#32322E] rounded-lg text-[#F7F3EA] focus:outline-none focus:ring-2 focus:ring-[#D4AF63]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#8C8C88]">
                  <span>{t.quickExamples}</span>
                  {['13', '19', '30', '10'].map((sampleId) => (
                    <button
                      key={sampleId}
                      type="button"
                      onClick={() => setStudentIdInput(sampleId)}
                      className="font-mono text-[#D4AF63] underline underline-offset-2 hover:text-[#E5C67E] px-1.5 py-0.5"
                    >
                      #{sampleId}
                    </button>
                  ))}
                </div>

                {errorMsg && (
                  <p className="text-xs font-medium text-rose-300 bg-rose-950/50 border border-rose-800/60 rounded-md px-3 py-2">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loadingStudent}
                  className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-[#141413] bg-[#D4AF63] rounded-lg hover:bg-[#DFBC72] transition-colors"
                >
                  <Search className="w-4 h-4" />
                  <span>{loadingStudent ? t.loading : t.signInAsStudent}</span>
                </button>
              </form>
            </section>
          )}

          {activeTab === 'files' && (
            <section className="max-w-xl mx-auto bg-[#181816] border border-[#2A2A27] rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-[#22221E] border border-[#34322B] flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-[#D4AF63]" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold text-[#F7F3EA]">
                    {t.bottomNavFiles}
                  </h1>
                  <p className="text-xs text-[#A39E93]">{t.studentPortalDesc}</p>
                </div>
              </div>

              <div className="bg-[#121211] border border-[#282825] rounded-lg p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-[#8C8C88]">{t.savedSessionNote}</p>
                  <p className="font-mono text-lg font-bold text-[#F7F3EA] mt-0.5">
                    ID #{studentIdInput || '13'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={loadingStudent}
                  onClick={() => onEnterStudent(studentIdInput || '13')}
                  className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#141413] bg-[#D4AF63] rounded-lg hover:bg-[#DFBC72] whitespace-nowrap"
                >
                  <span>{t.signInAsStudent}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => enterAdminWithGuard('study', 'ALL')}
                className="w-full text-start bg-[#121211] border border-[#282825] hover:border-[#D4AF63]/50 rounded-lg p-4 flex items-center justify-between gap-4 transition-colors"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-[#F7F3EA]">
                    {t.arabicSampleGuideTitle}
                  </p>
                  <p className="text-xs text-[#8C8C88]">{t.savedGuidesTitle}</p>
                </div>
                <Sparkles className="w-4 h-4 text-[#D4AF63] shrink-0" />
              </button>
            </section>
          )}

          {activeTab === 'more' && (
            <section className="space-y-6">
              <div className="space-y-1.5">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F7F3EA]">
                  {t.quickToolsTitle}
                </h1>
                <p className="text-sm text-[#A39E93]">{t.quickToolsDesc}</p>
              </div>

              <div className="max-w-md space-y-2">
                <label
                  htmlFor="more-admin-passcode"
                  className="block text-xs font-medium text-[#C8C3B8]"
                >
                  {t.adminPasscodeLabel}
                </label>
                <input
                  id="more-admin-passcode"
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-[#181816] border border-[#32322E] rounded-lg text-[#F7F3EA] focus:outline-none focus:ring-2 focus:ring-[#D4AF63]"
                />
                {passcodeError && (
                  <p className="text-xs text-rose-300">{passcodeError}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(
                  [
                    { tab: 'overview', label: t.navOverview, desc: t.studentDirectory, icon: LayoutGrid },
                    { tab: 'attendance', label: t.navAttendance, desc: t.attendanceDesc, icon: CheckSquare },
                    { tab: 'exams', label: t.navExams, desc: t.examsDesc, icon: Table2 },
                    { tab: 'announcements', label: t.navAnnouncements, desc: t.announcementsDesc, icon: Megaphone },
                    { tab: 'study', label: t.navStudyAi, desc: t.studyAiTitle, icon: Sparkles },
                    { tab: 'promotion', label: t.navPromotion, desc: t.promotionTitle, icon: GraduationCap },
                  ] as const
                ).map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.tab}
                      type="button"
                      onClick={() => enterAdminWithGuard(item.tab, 'ALL')}
                      className="text-start bg-[#181816] border border-[#2A2A27] hover:border-[#D4AF63]/60 rounded-xl p-5 space-y-2.5 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#22221E] border border-[#34322B] flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#D4AF63]" />
                      </div>
                      <h2 className="font-display text-base font-semibold text-[#F7F3EA]">
                        {item.label}
                      </h2>
                      <p className="text-xs text-[#8C8C88] line-clamp-2">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Fixed Obsidian Bottom Navigation Bar matching the reference screenshot */}
      <nav
        aria-label="Home navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-[#141413]/95 backdrop-blur-md border-t border-[#262624]"
      >
        <div className="max-w-3xl mx-auto grid grid-cols-5 h-[62px]">
          {bottomTabs.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => setActiveTab(item.id)}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors px-1 ${
                  active
                    ? 'text-[#D4AF63]'
                    : 'text-[#8C8C88] hover:text-[#D0CCC2]'
                }`}
              >
                {item.id === 'home' && <HomeTabIcon active={active} />}
                {item.id === 'books' && (
                  <BookOpen
                    className="w-[22px] h-[22px]"
                    strokeWidth={active ? 2 : 1.75}
                    aria-hidden="true"
                  />
                )}
                {item.id === 'search' && (
                  <Search
                    className="w-[22px] h-[22px]"
                    strokeWidth={active ? 2 : 1.75}
                    aria-hidden="true"
                  />
                )}
                {item.id === 'files' && (
                  <User
                    className="w-[22px] h-[22px]"
                    strokeWidth={active ? 2 : 1.75}
                    aria-hidden="true"
                  />
                )}
                {item.id === 'more' && <MoreGridPlusIcon active={active} />}

                <span
                  className={`text-[11px] leading-none whitespace-nowrap ${
                    active ? 'font-bold' : 'font-medium'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
