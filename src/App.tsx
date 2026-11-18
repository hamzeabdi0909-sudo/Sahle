import { useCallback, useEffect, useState } from 'react';
import {
  LayoutGrid,
  Search,
  CheckSquare,
  Table2,
  Megaphone,
  Sparkles,
  GraduationCap,
  LogOut,
  Menu,
  X,
  Globe,
  Printer,
} from 'lucide-react';
import { TRANSLATIONS, type Language } from './i18n/translations';
import type {
  AnnouncementRecord,
  DailyAttendanceBucket,
  StudentRecord,
} from './types/academic';
import type { MustawaLevel } from './utils/academicLogic';
import {
  fetchAnalyticsBuckets,
  fetchAnnouncements,
  fetchStudents,
  lookupStudentById,
  type UserRole,
} from './utils/api';
import {
  getNotificationStorageKey,
  getRelevantAnnouncements,
  mergeReadAnnouncementIds,
  readStoredReadIds,
  writeStoredReadIds,
} from './utils/announcementNotifications';
import { HeaderNotificationsBell } from './components/HeaderNotificationsBell';
import { RoleGateView } from './components/RoleGateView';
import { OverviewDirectory } from './components/OverviewDirectory';
import { StudentLookupPortal } from './components/StudentLookupPortal';
import { AttendanceBoard } from './components/AttendanceBoard';
import { ExamSpreadsheet } from './components/ExamSpreadsheet';
import { AnnouncementsBoard } from './components/AnnouncementsBoard';
import { PromotionPanel } from './components/PromotionPanel';
import { StudyAiTool } from './components/StudyAiTool';

type AdminTab =
  | 'overview'
  | 'search'
  | 'attendance'
  | 'exams'
  | 'announcements'
  | 'study'
  | 'promotion';

type StudentTab = 'portal' | 'announcements' | 'study';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('mustawa_lang');
    return saved === 'ar' || saved === 'so' || saved === 'en' ? saved : 'en';
  });

  const [role, setRole] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem('mustawa_role');
    return saved === 'admin' || saved === 'student' ? saved : null;
  });

  const [studentSessionId, setStudentSessionId] = useState<string>(() => {
    return localStorage.getItem('mustawa_student_id') || '13';
  });

  const [studentMustawa, setStudentMustawa] = useState<string>('ALL');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');
  const [studentTab, setStudentTab] = useState<StudentTab>('portal');
  const [selectedMustawa, setSelectedMustawa] = useState<string>('ALL');
  const [inspectStudentId, setInspectStudentId] = useState<string>('13');

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [attendanceBuckets, setAttendanceBuckets] = useState<DailyAttendanceBucket[]>([]);
  const [readAnnouncementIds, setReadAnnouncementIds] = useState<number[]>([]);
  const [gateError, setGateError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (!role) {
      setReadAnnouncementIds([]);
      return;
    }
    const key = getNotificationStorageKey(role, studentSessionId);
    setReadAnnouncementIds(readStoredReadIds(key));
  }, [role, studentSessionId]);

  useEffect(() => {
    localStorage.setItem('mustawa_lang', lang);
    document.documentElement.dir = t.dir;
    document.documentElement.lang = lang;
  }, [lang, t.dir]);

  const refreshAllData = useCallback(async () => {
    try {
      const [stuList, annList, buckets] = await Promise.all([
        fetchStudents('ALL'),
        fetchAnnouncements('ALL'),
        fetchAnalyticsBuckets(),
      ]);
      setStudents(stuList);
      setAnnouncements(annList);
      setAttendanceBuckets(buckets);
    } catch {
      // Errors handled inside individual tabs
    }
  }, []);

  useEffect(() => {
    if (role === 'admin') {
      refreshAllData();
    } else if (role === 'student' && studentSessionId) {
      lookupStudentById(studentSessionId)
        .then((res) => {
          setStudentMustawa(res.student.mustawa);
          setAnnouncements(res.announcements);
        })
        .catch(() => {
          setRole(null);
          localStorage.removeItem('mustawa_role');
        });
    }
  }, [role, studentSessionId, refreshAllData]);

  async function handleEnterStudent(id: string) {
    setGateError(null);
    try {
      const res = await lookupStudentById(id);
      setStudentSessionId(res.student.id);
      setStudentMustawa(res.student.mustawa);
      setAnnouncements(res.announcements);
      setRole('student');
      setStudentTab('portal');
      localStorage.setItem('mustawa_role', 'student');
      localStorage.setItem('mustawa_student_id', res.student.id);
    } catch {
      setGateError(t.studentNotFound);
    }
  }

  function handleEnterAdmin(initialTab: AdminTab = 'overview', initialMustawa = 'ALL') {
    setGateError(null);
    setRole('admin');
    setAdminTab(initialTab);
    setSelectedMustawa(initialMustawa);
    localStorage.setItem('mustawa_role', 'admin');
  }

  function handleSignOut() {
    setRole(null);
    localStorage.removeItem('mustawa_role');
    setMobileMenuOpen(false);
  }

  function handleMarkAnnouncementRead(id: number) {
    if (!role) return;
    const key = getNotificationStorageKey(role, studentSessionId);
    setReadAnnouncementIds((prev) => {
      const next = mergeReadAnnouncementIds(prev, [id]);
      writeStoredReadIds(key, next);
      return next;
    });
  }

  function handleMarkAllAnnouncementsRead() {
    if (!role) return;
    const key = getNotificationStorageKey(role, studentSessionId);
    const relevant = getRelevantAnnouncements(announcements, role, studentMustawa);
    setReadAnnouncementIds((prev) => {
      const next = mergeReadAnnouncementIds(
        prev,
        relevant.map((a) => a.id)
      );
      writeStoredReadIds(key, next);
      return next;
    });
  }

  if (!role) {
    return (
      <RoleGateView
        t={t}
        lang={lang}
        onChangeLang={setLang}
        onEnterStudent={handleEnterStudent}
        onEnterAdmin={handleEnterAdmin}
        errorMsg={gateError}
      />
    );
  }

  const adminNavItems: Array<{ id: AdminTab; label: string; icon: typeof LayoutGrid }> = [
    { id: 'overview', label: t.navOverview, icon: LayoutGrid },
    { id: 'search', label: t.navSearch, icon: Search },
    { id: 'attendance', label: t.navAttendance, icon: CheckSquare },
    { id: 'exams', label: t.navExams, icon: Table2 },
    { id: 'announcements', label: t.navAnnouncements, icon: Megaphone },
    { id: 'study', label: t.navStudyAi, icon: Sparkles },
    { id: 'promotion', label: t.navPromotion, icon: GraduationCap },
  ];

  const studentNavItems: Array<{ id: StudentTab; label: string; icon: typeof LayoutGrid }> = [
    { id: 'portal', label: t.studentPortal, icon: Search },
    { id: 'announcements', label: t.navAnnouncements, icon: Megaphone },
    { id: 'study', label: t.navStudyAi, icon: Sparkles },
  ];

  const relevantAnnouncements = getRelevantAnnouncements(
    announcements,
    role,
    studentMustawa
  );

  const currentTabLabel =
    role === 'admin'
      ? adminNavItems.find((i) => i.id === adminTab)?.label
      : studentNavItems.find((i) => i.id === studentTab)?.label;

  return (
    <div dir={t.dir} className="min-h-screen bg-[#F6F5F1] text-stone-900 flex">
      {/* Desktop Sidebar — Deep Oxford Forest */}
      <aside className="no-print hidden lg:flex lg:w-64 lg:flex-col bg-[#0F241D] text-stone-100 border-e border-emerald-950 shrink-0">
        <div className="px-6 py-5 border-b border-emerald-900/70 flex items-center gap-3">
          <GraduationCap className="w-6 h-6 text-amber-300 shrink-0" />
          <span className="font-display text-lg font-bold tracking-tight text-stone-50 whitespace-nowrap">
            {t.appTitle}
          </span>
        </div>

        <div className="px-5 py-4 border-b border-emerald-900/70">
          <p className="text-xs text-emerald-200/75">
            {role === 'admin' ? t.roleAdmin : t.roleStudent}
          </p>
          <p className="text-sm font-semibold text-stone-50 mt-0.5">
            {role === 'admin' ? t.adminConsole : `ID #${studentSessionId} · ${studentMustawa}`}
          </p>
        </div>

        <nav aria-label="Primary navigation" className="flex-1 px-3 py-4 space-y-1">
          {role === 'admin'
            ? adminNavItems.map((item) => {
                const Icon = item.icon;
                const active = adminTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAdminTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-stone-50 text-emerald-950 font-semibold shadow-sm'
                        : 'text-emerald-100/80 hover:bg-emerald-900/60 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })
            : studentNavItems.map((item) => {
                const Icon = item.icon;
                const active = studentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStudentTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-stone-50 text-emerald-950 font-semibold shadow-sm'
                        : 'text-emerald-100/80 hover:bg-emerald-900/60 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
        </nav>

        <div className="p-4 border-t border-emerald-900/70">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-emerald-100 bg-emerald-900/50 border border-emerald-800/70 rounded-md hover:bg-emerald-900 hover:text-white whitespace-nowrap transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.switchRole}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="no-print fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-stone-900/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[80vw] bg-[#0F241D] text-stone-100 h-full flex flex-col border-e border-emerald-950 z-10">
            <div className="px-5 py-4 border-b border-emerald-900/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-amber-300 shrink-0" />
                <span className="font-display text-lg font-bold text-stone-50">{t.appTitle}</span>
              </div>
              <button
                type="button"
                aria-label={t.close}
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {role === 'admin'
                ? adminNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = adminTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setAdminTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium ${
                          active
                            ? 'bg-stone-50 text-emerald-950 font-semibold'
                            : 'text-emerald-100/80 hover:bg-emerald-900/60 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })
                : studentNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = studentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setStudentTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium ${
                          active
                            ? 'bg-stone-50 text-emerald-950 font-semibold'
                            : 'text-emerald-100/80 hover:bg-emerald-900/60 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
            </nav>
            <div className="p-4 border-t border-emerald-900/70">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-emerald-100 bg-emerald-900/50 border border-emerald-800/70 rounded-md"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.switchRole}</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Contract: Breadcrumb — Language Switcher — Primary Role Action */}
        <header className="no-print bg-white border-b border-stone-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 sm:gap-8">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-stone-600 hover:text-stone-900 rounded-md border border-stone-200"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-sm truncate">
              <span className="font-semibold text-stone-900 whitespace-nowrap">
                {currentTabLabel}
              </span>
              <span aria-hidden="true" className="text-stone-300 hidden sm:inline">
                /
              </span>
              <span className="text-xs text-stone-500 hidden sm:inline whitespace-nowrap">
                {role === 'admin' ? t.roleAdmin : `${t.roleStudent} · #${studentSessionId}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div
              className="flex items-center gap-1 p-1 bg-stone-100 rounded-md"
              role="group"
              aria-label="Language switcher"
            >
              <Globe className="w-3.5 h-3.5 text-stone-400 ms-1.5 hidden sm:block" />
              {(['en', 'ar', 'so'] as Language[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap shrink-0 transition-colors ${
                    lang === code
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {code === 'en' ? 'EN' : code === 'ar' ? 'العربية' : 'Soomaali'}
                </button>
              ))}
            </div>

            <HeaderNotificationsBell
              t={t}
              relevantAnnouncements={relevantAnnouncements}
              readIds={readAnnouncementIds}
              onMarkOneRead={handleMarkAnnouncementRead}
              onMarkAllRead={handleMarkAllAnnouncementsRead}
              onOpenNoticesBoard={() => {
                if (role === 'admin') {
                  setAdminTab('announcements');
                } else {
                  setStudentTab('announcements');
                }
              }}
            />

            <button
              type="button"
              onClick={() => window.print()}
              aria-label={t.headerPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 whitespace-nowrap shrink-0 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.headerPrint}</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 whitespace-nowrap shrink-0 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.signOut}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {role === 'admin' && (
            <>
              {adminTab === 'overview' && (
                <OverviewDirectory
                  t={t}
                  students={students}
                  announcements={announcements}
                  attendanceBuckets={attendanceBuckets}
                  selectedMustawa={selectedMustawa}
                  onSelectMustawa={setSelectedMustawa}
                  onRefresh={refreshAllData}
                  onInspectStudent={(id) => {
                    setInspectStudentId(id);
                    setAdminTab('search');
                  }}
                />
              )}
              {adminTab === 'search' && (
                <StudentLookupPortal t={t} initialStudentId={inspectStudentId} />
              )}
              {adminTab === 'attendance' && (
                <AttendanceBoard
                  t={t}
                  lang={lang}
                  defaultMustawa={
                    selectedMustawa !== 'ALL' && selectedMustawa !== 'Graduated'
                      ? (selectedMustawa as MustawaLevel)
                      : 'Mustawa 2'
                  }
                  onSaved={refreshAllData}
                />
              )}
              {adminTab === 'exams' && (
                <ExamSpreadsheet
                  t={t}
                  selectedMustawa={selectedMustawa}
                  onSaved={refreshAllData}
                />
              )}
              {adminTab === 'announcements' && (
                <AnnouncementsBoard
                  t={t}
                  lang={lang}
                  role="admin"
                  announcements={announcements}
                  selectedMustawa={selectedMustawa}
                  onSelectMustawa={setSelectedMustawa}
                  onRefresh={refreshAllData}
                />
              )}
              {adminTab === 'study' && <StudyAiTool t={t} lang={lang} />}
              {adminTab === 'promotion' && (
                <PromotionPanel t={t} students={students} onPromoted={refreshAllData} />
              )}
            </>
          )}

          {role === 'student' && (
            <>
              {studentTab === 'portal' && (
                <StudentLookupPortal
                  t={t}
                  initialStudentId={studentSessionId}
                  readOnlyStudentMode
                />
              )}
              {studentTab === 'announcements' && (
                <AnnouncementsBoard
                  t={t}
                  lang={lang}
                  role="student"
                  announcements={announcements}
                  selectedMustawa={studentMustawa}
                  onSelectMustawa={() => {}}
                  onRefresh={async () => {}}
                />
              )}
              {studentTab === 'study' && <StudyAiTool t={t} lang={lang} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
