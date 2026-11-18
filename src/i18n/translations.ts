export type Language = 'en' | 'ar' | 'so';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  dir: 'ltr' | 'rtl';
  // Navigation & Roles
  roleAdmin: string;
  roleStudent: string;
  switchRole: string;
  signOut: string;
  adminConsole: string;
  adminConsoleDesc: string;
  studentPortal: string;
  studentPortalDesc: string;
  studentIdLoginTitle: string;
  studentIdLoginDesc: string;
  enterStudentIdPlaceholder: string;
  signInAsStudent: string;
  signInAsAdmin: string;
  adminPasscodeLabel: string;
  adminQuickAccess: string;
  readOnlyNotice: string;
  navOverview: string;
  navSearch: string;
  navAttendance: string;
  navExams: string;
  navAnnouncements: string;
  navStudyAi: string;
  navPromotion: string;
  // Mustawa
  mustawaLabel: string;
  allMustawas: string;
  selectMustawa: string;
  // Overview & Directory
  totalStudents: string;
  avgAttendanceRate: string;
  studentsAtRisk: string;
  totalAnnouncements: string;
  studentDirectory: string;
  addStudent: string;
  bulkImport: string;
  exportExcel: string;
  exportCsv: string;
  exportPdf: string;
  printTranscript: string;
  headerPrint: string;
  notificationsLabel: string;
  unreadCountSuffix: string;
  allCaughtUp: string;
  markAllRead: string;
  viewAllNotices: string;
  filterByNameOrId: string;
  colId: string;
  colName: string;
  colMustawa: string;
  colMissed: string;
  colPenalty: string;
  colAvgNet: string;
  colStanding: string;
  colActions: string;
  viewProfile: string;
  deleteStudent: string;
  noStudentsFound: string;
  // Standing labels
  standingGood: string;
  standingWarning: string;
  standingCritical: string;
  standingBarred: string;
  // Student ID Search Portal
  searchPortalTitle: string;
  searchPortalDesc: string;
  searchButton: string;
  quickExamples: string;
  studentNotFound: string;
  profileSummary: string;
  missedClassesCount: string;
  automatedDeduction: string;
  attendanceHistory: string;
  examTranscript: string;
  mustawaNotices: string;
  penaltyPolicyTitle: string;
  penaltyRuleSummary: string;
  // Attendance
  attendanceTitle: string;
  attendanceDesc: string;
  attendanceDate: string;
  courseName: string;
  markAllPresent: string;
  saveAttendance: string;
  saving: string;
  savedSuccess: string;
  presentLabel: string;
  absentLabel: string;
  presentCount: string;
  absentCount: string;
  absenceOnlyHint: string;
  voiceNoteTitle: string;
  voiceRecordStart: string;
  voiceRecordStop: string;
  transcribingAudio: string;
  voiceTranscriptLabel: string;
  // Exams
  examsTitle: string;
  examsDesc: string;
  subjectLabel: string;
  saveAllGrades: string;
  midtermCol: string;
  courseworkCol: string;
  finalCol: string;
  grossCol: string;
  deductionCol: string;
  netCol: string;
  gradeCol: string;
  unsavedChanges: string;
  // Announcements
  announcementsTitle: string;
  announcementsDesc: string;
  postAnnouncement: string;
  announcementTitlePlaceholder: string;
  announcementBodyPlaceholder: string;
  targetMustawa: string;
  publishNotice: string;
  dictateWithMic: string;
  translateWithAi: string;
  noAnnouncements: string;
  // Bulk Import
  bulkImportTitle: string;
  bulkImportDesc: string;
  uploadCsvFile: string;
  pasteStudentList: string;
  importPreview: string;
  confirmImport: string;
  cancel: string;
  // Promotion
  promotionTitle: string;
  promotionDesc: string;
  sourceMustawa: string;
  destinationMustawa: string;
  promoteAllInMustawa: string;
  promoteSelected: string;
  selectAll: string;
  studentsSelected: string;
  confirmPromotion: string;
  promotionSuccess: string;
  // AI Study Tool
  studyAiTitle: string;
  studyAiDesc: string;
  uploadPdfLabel: string;
  uploadPdfHint: string;
  orPasteNotes: string;
  outputLanguageLabel: string;
  questionCountLabel: string;
  generateStudyPack: string;
  generatingStudyPack: string;
  summaryTab: string;
  quizTab: string;
  answerKeyTab: string;
  savedGuidesTitle: string;
  revealAnswer: string;
  hideAnswer: string;
  correctAnswer: string;
  explanationLabel: string;
  checkQuizScore: string;
  yourScore: string;
  // Add Student Modal
  addStudentTitle: string;
  studentIdOptional: string;
  fullNameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  saveStudent: string;
  // General
  dateLabel: string;
  statusLabel: string;
  loading: string;
  errorPrefix: string;
  close: string;
  officialDocBanner: string;
  instructorSignature: string;
  registrarSignature: string;
  officialStampDate: string;
  printedOn: string;
  // Analytics Charts
  analyticsTrendTitle: string;
  analyticsTrendDesc: string;
  analyticsMustawaTitle: string;
  analyticsMustawaDesc: string;
  legendAttendanceRate: string;
  legendAvgNetScore: string;
  noChartData: string;
  // Student 10-Session Trend & Automatic Warnings
  studentTrendTitle: string;
  studentTrendDesc: string;
  rollingRateLabel: string;
  sessionsWindowSuffix: string;
  academicAlertTitleCritical: string;
  academicAlertTitleWarning: string;
  warnOverallFailing: string;
  warnOverallNear: string;
  warnExamFailing: string;
  warnExamNear: string;
  warnAbsenceCritical: string;
  warnAbsenceHigh: string;
  badgeAtRisk: string;
  badgeGradeRisk: string;
  badgeNearThreshold: string;
  badgeBelow50: string;
  badgeHighAbsence: string;
  filterAtRiskOnly: string;
  atRiskBannerTitle: string;
  atRiskBannerDesc: string;
  riskMetricLabel: string;
  // Inline CSV Import, Student Editing, Tier Progress & Exam KPIs
  inlineCsvTitle: string;
  inlineCsvDesc: string;
  downloadCsvTemplate: string;
  csvDuplicatesSkippedNote: string;
  csvClearFile: string;
  editStudent: string;
  editStudentTitle: string;
  updateStudent: string;
  nextPenaltyHint: string;
  maxPenaltyReached: string;
  classAvgLabel: string;
  highestScoreLabel: string;
  passRateLabel: string;
  atRiskCountLabel: string;
  // Home Bottom Navigation & Book Library
  bottomNavHome: string;
  bottomNavBooks: string;
  bottomNavSearch: string;
  bottomNavFiles: string;
  bottomNavMore: string;
  mustawaLibraryTitle: string;
  mustawaLibrarySubtitle: string;
  openVolumeAction: string;
  quickToolsTitle: string;
  quickToolsDesc: string;
  arabicSampleGuideTitle: string;
  arabicSampleGuideDesc: string;
  savedSessionNote: string;
  // Bulk Attendance & Bulk Exam
  bulkAttendanceTitle: string;
  bulkAttendanceDesc: string;
  bulkAttendanceAction: string;
  bulkExamTitle: string;
  bulkExamDesc: string;
  bulkExamAction: string;
  pasteCsvOrLines: string;
  unknownStudentIdsNote: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    appTitle: 'Mustawa',
    appSubtitle: 'University Attendance, Exam & AI Study Portal',
    dir: 'ltr',
    roleAdmin: 'Admin / Teacher',
    roleStudent: 'Student View',
    switchRole: 'Switch Role',
    signOut: 'Exit View',
    adminConsole: 'Faculty & Admin Console',
    adminConsoleDesc: 'Manage Mustawa rosters, take ultra-fast attendance, edit exam spreadsheets, publish notices, and promote cohorts.',
    studentPortal: 'Student Read-Only Portal',
    studentPortalDesc: 'Your personal academic record, attendance standing, automated deductions, exam results, and Mustawa notices.',
    studentIdLoginTitle: 'Student Portal Access',
    studentIdLoginDesc: 'Enter your unique Student ID (e.g. 13) to view your attendance, automated deductions, grades, and Mustawa notices.',
    enterStudentIdPlaceholder: 'Enter Student ID (e.g. 13)',
    signInAsStudent: 'Open Student Portal',
    signInAsAdmin: 'Enter Admin / Teacher Console',
    adminPasscodeLabel: 'Faculty Access Code (demo: admin123)',
    adminQuickAccess: 'Quick Demo Login',
    readOnlyNotice: 'Read-Only Mode · Student records cannot be edited from this view',
    navOverview: 'Overview',
    navSearch: 'ID Lookup',
    navAttendance: 'Attendance',
    navExams: 'Exam Sheet',
    navAnnouncements: 'Notices',
    navStudyAi: 'AI PDF Study',
    navPromotion: 'Promotion',
    mustawaLabel: 'Mustawa',
    allMustawas: 'All Mustawas',
    selectMustawa: 'Select Mustawa',
    totalStudents: 'Enrolled Students',
    avgAttendanceRate: 'Attendance Rate',
    studentsAtRisk: 'Penalty Active',
    totalAnnouncements: 'Active Notices',
    studentDirectory: 'Mustawa Student Directory',
    addStudent: 'Add Student',
    bulkImport: 'Bulk Import',
    exportExcel: 'Export Excel',
    exportCsv: 'Export CSV',
    exportPdf: 'Export PDF',
    printTranscript: 'Print Report',
    headerPrint: 'Print',
    notificationsLabel: 'Announcements',
    unreadCountSuffix: 'unread',
    allCaughtUp: 'All announcements read',
    markAllRead: 'Mark all read',
    viewAllNotices: 'Open Notices Board',
    filterByNameOrId: 'Filter by Student ID or name...',
    colId: 'ID',
    colName: 'Student Name',
    colMustawa: 'Mustawa',
    colMissed: 'Missed',
    colPenalty: 'Deduction',
    colAvgNet: 'Avg Net',
    colStanding: 'Standing',
    colActions: 'Actions',
    viewProfile: 'Inspect',
    deleteStudent: 'Remove',
    noStudentsFound: 'No students matched the current Mustawa filter.',
    standingGood: 'Good Standing',
    standingWarning: 'Penalty Warning',
    standingCritical: 'High Penalty',
    standingBarred: 'Critical Absence',
    searchPortalTitle: 'Student ID Search Portal',
    searchPortalDesc: 'Look up any student by ID to inspect attendance logs, automated score deductions, and exam performance.',
    searchButton: 'Lookup ID',
    quickExamples: 'Quick Lookup:',
    studentNotFound: 'No student record found for that Student ID.',
    profileSummary: 'Academic Profile',
    missedClassesCount: 'Total Missed Classes',
    automatedDeduction: 'Automated Score Deduction',
    attendanceHistory: 'Recent Attendance Log',
    examTranscript: 'Exam Results & Net Scores',
    mustawaNotices: 'Mustawa Announcements',
    penaltyPolicyTitle: 'Automated Penalty Policy',
    penaltyRuleSummary: '0–2 absences: 0% · 3–4: 5% · 5–6: 10% · 7–9: 20% · 10+: 30%',
    attendanceTitle: 'Ultra-Fast Daily Attendance',
    attendanceDesc: 'Default-Present mode: every student starts as Present. Tap only the students who are absent, then save.',
    attendanceDate: 'Session Date',
    courseName: 'Course / Lecture',
    markAllPresent: 'Mark All Present',
    saveAttendance: 'Save Attendance',
    saving: 'Saving...',
    savedSuccess: 'Saved to database',
    presentLabel: 'Present',
    absentLabel: 'Absent',
    presentCount: 'Present',
    absentCount: 'Absent',
    absenceOnlyHint: 'Click any row to toggle Absent / Present',
    voiceNoteTitle: 'Voice Attendance & Session Note (Gemini Transcribe)',
    voiceRecordStart: 'Record Voice Note',
    voiceRecordStop: 'Stop & Transcribe',
    transcribingAudio: 'Transcribing audio...',
    voiceTranscriptLabel: 'Transcribed Session Note',
    examsTitle: 'Spreadsheet Exam Entry',
    examsDesc: 'Edit midterm, coursework, and final scores across the Mustawa in one grid. Attendance deductions apply automatically.',
    subjectLabel: 'Subject',
    saveAllGrades: 'Save All',
    midtermCol: 'Midterm (30)',
    courseworkCol: 'Coursework (20)',
    finalCol: 'Final (50)',
    grossCol: 'Gross',
    deductionCol: 'Penalty',
    netCol: 'Net Score',
    gradeCol: 'Grade',
    unsavedChanges: 'Unsaved edits',
    announcementsTitle: 'Per-Mustawa Announcement Board',
    announcementsDesc: 'Publish level-specific notices visible strictly to students enrolled in that Mustawa.',
    postAnnouncement: 'New Notice',
    announcementTitlePlaceholder: 'Notice headline...',
    announcementBodyPlaceholder: 'Write announcement details in English, Arabic, or Somali...',
    targetMustawa: 'Target Mustawa',
    publishNotice: 'Publish Notice',
    dictateWithMic: 'Dictate with Mic',
    translateWithAi: 'Polish / Translate (AI)',
    noAnnouncements: 'No announcements posted for this Mustawa yet.',
    bulkImportTitle: 'Bulk Student Import',
    bulkImportDesc: 'Upload a .csv file or paste a student list (one per line: "ID, Name, Email, Phone" or just "Name") into the target Mustawa.',
    uploadCsvFile: 'Choose CSV File',
    pasteStudentList: 'Paste Student List',
    importPreview: 'Ready to Import',
    confirmImport: 'Import Students',
    cancel: 'Cancel',
    promotionTitle: 'Academic Year Mustawa Promotion',
    promotionDesc: 'Advance individual students or an entire Mustawa cohort to the next Mustawa level at the end of the academic year.',
    sourceMustawa: 'From Mustawa',
    destinationMustawa: 'Promote To',
    promoteAllInMustawa: 'Promote Entire Mustawa',
    promoteSelected: 'Promote Selected',
    selectAll: 'Select All',
    studentsSelected: 'selected',
    confirmPromotion: 'Execute Promotion',
    promotionSuccess: 'Students promoted successfully',
    studyAiTitle: 'AI PDF Study Tool',
    studyAiDesc: 'Upload lecture PDFs (with native Arabic, Somali, and English comprehension) or paste notes to generate a summary, quiz, and full answer key.',
    uploadPdfLabel: 'Upload Lecture PDF',
    uploadPdfHint: 'Supports Arabic, English, and multilingual academic PDFs up to 12 MB',
    orPasteNotes: 'Or paste lecture text / topic notes',
    outputLanguageLabel: 'Study Pack Language',
    questionCountLabel: 'Quiz Questions',
    generateStudyPack: 'Generate Summary & Quiz',
    generatingStudyPack: 'Analyzing document with Gemini...',
    summaryTab: 'Subject Summary',
    quizTab: 'Practice Quiz',
    answerKeyTab: 'Answer Key',
    savedGuidesTitle: 'Saved Study Guides',
    revealAnswer: 'Show Answer',
    hideAnswer: 'Hide Answer',
    correctAnswer: 'Correct Answer',
    explanationLabel: 'Explanation',
    checkQuizScore: 'Check My Score',
    yourScore: 'Score',
    addStudentTitle: 'Enroll New Student',
    studentIdOptional: 'Student ID (leave blank to auto-assign)',
    fullNameLabel: 'Full Name',
    emailLabel: 'University Email',
    phoneLabel: 'Phone Number',
    saveStudent: 'Save Student',
    dateLabel: 'Date',
    statusLabel: 'Status',
    loading: 'Loading...',
    errorPrefix: 'Error:',
    close: 'Close',
    officialDocBanner: 'Mustawa University · Office of Academic Records',
    instructorSignature: 'Instructor / Examiner Signature',
    registrarSignature: 'Registrar / Dean Verification',
    officialStampDate: 'Official Stamp & Date',
    printedOn: 'Printed',
    analyticsTrendTitle: 'Attendance Rate Trend',
    analyticsTrendDesc: 'Session attendance percentage across recorded dates',
    analyticsMustawaTitle: 'Exam & Attendance by Mustawa',
    analyticsMustawaDesc: 'Attendance rate vs. net exam average across Mustawa 1 – 8',
    legendAttendanceRate: 'Attendance %',
    legendAvgNetScore: 'Avg Net Score %',
    noChartData: 'No recorded data yet for this selection.',
    studentTrendTitle: 'Attendance Rate — Last 10 Sessions',
    studentTrendDesc: 'Rolling attendance rate and per-session status across your latest classes',
    rollingRateLabel: 'Rolling Rate %',
    sessionsWindowSuffix: 'sessions',
    academicAlertTitleCritical: 'Critical Academic Warning — Immediate Attention Required',
    academicAlertTitleWarning: 'Academic Risk Warning — Action Recommended',
    warnOverallFailing: 'Overall net average ({score}%) has dropped below the 50% passing threshold.',
    warnOverallNear: 'Overall net average ({score}%) is near the 50% threshold (50%–58%).',
    warnExamFailing: 'Subject "{subject}" net score ({score}%) is below the 50% passing threshold.',
    warnExamNear: 'Subject "{subject}" net score ({score}%) is near the 50% threshold.',
    warnAbsenceCritical: 'Critical absence limit reached: {count} missed classes ({deduction}% automatic deduction).',
    warnAbsenceHigh: 'High absence limit reached: {count} missed classes ({deduction}% automatic deduction).',
    badgeAtRisk: 'At Risk',
    badgeGradeRisk: 'Grade Risk',
    badgeNearThreshold: 'Near 50%',
    badgeBelow50: 'Below 50%',
    badgeHighAbsence: 'High Absence',
    filterAtRiskOnly: 'At-Risk Only',
    atRiskBannerTitle: 'Students Flagged at Academic Risk',
    atRiskBannerDesc: 'Students with exam or overall scores near or below 50%, or high absence limits, are flagged automatically.',
    riskMetricLabel: 'At-Risk Flagged',
    inlineCsvTitle: 'CSV Bulk Student Upload',
    inlineCsvDesc: 'Upload a .csv file to parse and enroll students directly into the selected Mustawa.',
    downloadCsvTemplate: 'Sample CSV',
    csvDuplicatesSkippedNote: 'duplicate IDs will be skipped',
    csvClearFile: 'Clear',
    editStudent: 'Edit',
    editStudentTitle: 'Edit Student Record',
    updateStudent: 'Update Student',
    nextPenaltyHint: '{remaining} more absence(s) will trigger -{nextDeduction}% deduction (at {threshold} missed).',
    maxPenaltyReached: 'Maximum absence penalty tier (30%) reached.',
    classAvgLabel: 'Class Avg Net',
    highestScoreLabel: 'Highest Net',
    passRateLabel: 'Pass Rate (≥50%)',
    atRiskCountLabel: 'Flagged (≤58%)',
    bottomNavHome: 'Home',
    bottomNavBooks: 'Books',
    bottomNavSearch: 'Search',
    bottomNavFiles: 'My Files',
    bottomNavMore: 'More',
    mustawaLibraryTitle: 'Mustawa Academic Volumes',
    mustawaLibrarySubtitle: 'Select any Mustawa volume to open its student roster, attendance records, and study materials.',
    openVolumeAction: 'Open Mustawa',
    quickToolsTitle: 'Faculty Quick Launch',
    quickToolsDesc: 'Jump straight into attendance, exam spreadsheets, announcements, or cohort promotion.',
    arabicSampleGuideTitle: 'Arabic Morphology Study Pack',
    arabicSampleGuideDesc: 'Bilingual summary, practice quiz, and answer key ready in AI PDF Study.',
    savedSessionNote: 'Last accessed Student ID',
    bulkAttendanceTitle: 'Bulk Attendance Import',
    bulkAttendanceDesc: 'Upload a .csv file or paste lines (ID, Date, Course, Status, Note) to record attendance in bulk.',
    bulkAttendanceAction: 'Import Attendance',
    bulkExamTitle: 'Bulk Exam Score Import',
    bulkExamDesc: 'Upload a .csv file or paste lines (ID, Subject, Midterm, Coursework, Final) to update scores in bulk.',
    bulkExamAction: 'Import Exam Scores',
    pasteCsvOrLines: 'Or paste CSV lines directly',
    unknownStudentIdsNote: 'unknown ID(s) skipped',
  },
  ar: {
    appTitle: 'Mustawa',
    appSubtitle: 'بوابة الحضور الجامعي والنتائج والدراسة بالذكاء الاصطناعي',
    dir: 'rtl',
    roleAdmin: 'الإدارة / المعلم',
    roleStudent: 'بوابة الطالب',
    switchRole: 'تبديل الدور',
    signOut: 'خروج',
    adminConsole: 'لوحة التحكم الأكاديمية',
    adminConsoleDesc: 'إدارة قوائم Mustawa، وتسجيل الحضور السريع، وإدخال جداول الدرجات، ونشر الإعلانات، وترقية الطلاب.',
    studentPortal: 'بوابة الطالب (للقراءة فقط)',
    studentPortalDesc: 'ملفك الأكاديمي الشخصي، سجل الحضور والخصم التلقائي، نتائج الاختبارات، وإعلانات Mustawa الخاص بك.',
    studentIdLoginTitle: 'دخول بوابة الطالب',
    studentIdLoginDesc: 'أدخل الرقم الجامعي الخاص بك (مثل 13) لعرض سجل الحضور والخصم التلقائي والنتائج وإعلانات Mustawa.',
    enterStudentIdPlaceholder: 'أدخل الرقم الجامعي (مثال: 13)',
    signInAsStudent: 'فتح بوابة الطالب',
    signInAsAdmin: 'دخول لوحة المعلم / الإدارة',
    adminPasscodeLabel: 'رمز دخول الإدارة (تجريبي: admin123)',
    adminQuickAccess: 'دخول تجريبي سريع',
    readOnlyNotice: 'وضع القراءة فقط · لا يمكن تعديل البيانات من بوابة الطالب',
    navOverview: 'نظرة عامة',
    navSearch: 'بحث بالرقم',
    navAttendance: 'الحضور اليومي',
    navExams: 'جدول الدرجات',
    navAnnouncements: 'الإعلانات',
    navStudyAi: 'أداة الدراسة AI',
    navPromotion: 'الترقية السنوية',
    mustawaLabel: 'Mustawa',
    allMustawas: 'جميع مستويات Mustawa',
    selectMustawa: 'اختر Mustawa',
    totalStudents: 'إجمالي الطلاب',
    avgAttendanceRate: 'نسبة الحضور',
    studentsAtRisk: 'حالات الخصم',
    totalAnnouncements: 'الإعلانات النشطة',
    studentDirectory: 'دليل طلاب Mustawa',
    addStudent: 'إضافة طالب',
    bulkImport: 'استيراد جماعي',
    exportExcel: 'تصدير Excel',
    exportCsv: 'تصدير CSV',
    exportPdf: 'تصدير PDF',
    printTranscript: 'طباعة التقرير',
    headerPrint: 'طباعة',
    notificationsLabel: 'الإشعارات',
    unreadCountSuffix: 'غير مقروء',
    allCaughtUp: 'تمت قراءة جميع الإعلانات',
    markAllRead: 'تحديد الكل كمقروء',
    viewAllNotices: 'فتح لوحة الإعلانات',
    filterByNameOrId: 'ابحث بالرقم الجامعي أو الاسم...',
    colId: 'الرقم',
    colName: 'اسم الطالب',
    colMustawa: 'Mustawa',
    colMissed: 'الغياب',
    colPenalty: 'نسبة الخصم',
    colAvgNet: 'المعدل الصافي',
    colStanding: 'الحالة',
    colActions: 'إجراءات',
    viewProfile: 'عرض',
    deleteStudent: 'حذف',
    noStudentsFound: 'لا يوجد طلاب مطابقون لتصفية Mustawa الحالية.',
    standingGood: 'وضع منتظم',
    standingWarning: 'تنبيه خصم',
    standingCritical: 'خصم مرتفع',
    standingBarred: 'تجاوز حد الغياب',
    searchPortalTitle: 'بوابة البحث بالرقم الجامعي',
    searchPortalDesc: 'ابحث عن أي طالب برقمه الجامعي لعرض إجمالي الغياب، الخصم التلقائي، وكشف الدرجات.',
    searchButton: 'بحث',
    quickExamples: 'بحث سريع:',
    studentNotFound: 'لم يتم العثور على طالب بهذا الرقم الجامعي.',
    profileSummary: 'الملف الأكاديمي',
    missedClassesCount: 'إجمالي الحصص المتغيب عنها',
    automatedDeduction: 'الخصم التلقائي من الدرجات',
    attendanceHistory: 'سجل الحضور الأخير',
    examTranscript: 'نتائج الاختبارات والدرجة الصافية',
    mustawaNotices: 'إعلانات Mustawa',
    penaltyPolicyTitle: 'سياسة الخصم التلقائي',
    penaltyRuleSummary: '0–2 غياب: 0% · 3–4: 5% · 5–6: 10% · 7–9: 20% · 10+: 30%',
    attendanceTitle: 'تسجيل الحضور السريع',
    attendanceDesc: 'وضع الحضور الافتراضي: جميع الطلاب حاضرون تلقائياً. اضغط فقط على أسماء الغائبين ثم احفظ.',
    attendanceDate: 'تاريخ المحاضرة',
    courseName: 'المادة / الجلسة',
    markAllPresent: 'تحديد الكل حاضر',
    saveAttendance: 'حفظ الحضور',
    saving: 'جارٍ الحفظ...',
    savedSuccess: 'تم الحفظ في قاعدة البيانات',
    presentLabel: 'حاضر',
    absentLabel: 'غائب',
    presentCount: 'حاضر',
    absentCount: 'غائب',
    absenceOnlyHint: 'اضغط على أي صف لتبديل غائب / حاضر',
    voiceNoteTitle: 'ملاحظة صوتية للحضور (تفريغ Gemini)',
    voiceRecordStart: 'تسجيل ملاحظة صوتية',
    voiceRecordStop: 'إيقاف وتفريغ النص',
    transcribingAudio: 'جارٍ تفريغ الصوت...',
    voiceTranscriptLabel: 'النص المفرغ للملاحظة',
    examsTitle: 'جدول إدخال درجات الاختبارات',
    examsDesc: 'أدخل درجات أعمال السنة والنصفي والنهائي في شاشة واحدة مع احتساب خصم الغياب تلقائياً.',
    subjectLabel: 'المادة',
    saveAllGrades: 'حفظ الكل',
    midtermCol: 'النصفي (30)',
    courseworkCol: 'الأعمال (20)',
    finalCol: 'النهائي (50)',
    grossCol: 'المجموع',
    deductionCol: 'الخصم',
    netCol: 'الصافي',
    gradeCol: 'التقدير',
    unsavedChanges: 'تعديلات غير محفوظة',
    announcementsTitle: 'لوحة إعلانات كل Mustawa',
    announcementsDesc: 'انشر أخباراً وتنبيهات تظهر حصرياً لطلاب Mustawa المحدد.',
    postAnnouncement: 'إعلان جديد',
    announcementTitlePlaceholder: 'عنوان الإعلان...',
    announcementBodyPlaceholder: 'اكتب تفاصيل الإعلان بالعربية أو الإنجليزية أو الصومالية...',
    targetMustawa: 'Mustawa المستهدف',
    publishNotice: 'نشر الإعلان',
    dictateWithMic: 'إملاء بالمايكروفون',
    translateWithAi: 'تحسين / ترجمة بالذكاء الاصطناعي',
    noAnnouncements: 'لا توجد إعلانات لهذا المستوى بعد.',
    bulkImportTitle: 'الاستيراد الجماعي للطلاب',
    bulkImportDesc: 'ارفع ملف CSV أو الصق قائمة الطلاب (سطر لكل طالب: الرقم، الاسم، البريد، الهاتف أو الاسم فقط) لإضافتهم إلى Mustawa محدد.',
    uploadCsvFile: 'اختيار ملف CSV',
    pasteStudentList: 'لصق قائمة الطلاب',
    importPreview: 'جاهز للاستيراد',
    confirmImport: 'استيراد الطلاب',
    cancel: 'إلغاء',
    promotionTitle: 'ترقية الطلاب إلى Mustawa التالي',
    promotionDesc: 'ترقية طلاب محددين أو كامل طلاب Mustawa إلى المستوى الأعلى في نهاية العام الدراسي.',
    sourceMustawa: 'من Mustawa',
    destinationMustawa: 'الترقية إلى',
    promoteAllInMustawa: 'ترقية جميع طلاب هذا Mustawa',
    promoteSelected: 'ترقية المحددين',
    selectAll: 'تحديد الكل',
    studentsSelected: 'محدد',
    confirmPromotion: 'تنفيذ الترقية',
    promotionSuccess: 'تمت ترقية الطلاب بنجاح',
    studyAiTitle: 'أداة الدراسة الذكية لملفات PDF',
    studyAiDesc: 'ارفع ملف PDF (بدعم متقدم للغة العربية واللغات الأخرى) لتوليد ملخص شامل وأسئلة اختبار مع نموذج الإجابة الكامل.',
    uploadPdfLabel: 'رفع ملف المحاضرة PDF',
    uploadPdfHint: 'يدعم العربية والإنجليزية والملفات متعددة اللغات حتى 12 ميجابايت',
    orPasteNotes: 'أو الصق نص المحاضرة هنا',
    outputLanguageLabel: 'لغة الملخص والاختبار',
    questionCountLabel: 'عدد الأسئلة',
    generateStudyPack: 'توليد الملخص والاختبار',
    generatingStudyPack: 'جارٍ تحليل المستند عبر Gemini...',
    summaryTab: 'ملخص المادة',
    quizTab: 'اختبار تدريبي',
    answerKeyTab: 'نموذج الإجابة',
    savedGuidesTitle: 'الملخصات المحفوظة',
    revealAnswer: 'إظهار الإجابة',
    hideAnswer: 'إخفاء الإجابة',
    correctAnswer: 'الإجابة الصحيحة',
    explanationLabel: 'الشرح',
    checkQuizScore: 'تصحيح الاختبار',
    yourScore: 'النتيجة',
    addStudentTitle: 'تسجيل طالب جديد',
    studentIdOptional: 'الرقم الجامعي (اتركه فارغاً للتوليد التلقائي)',
    fullNameLabel: 'الاسم الكامل',
    emailLabel: 'البريد الجامعي',
    phoneLabel: 'رقم الهاتف',
    saveStudent: 'حفظ الطالب',
    dateLabel: 'التاريخ',
    statusLabel: 'الحالة',
    loading: 'جارٍ التحميل...',
    errorPrefix: 'خطأ:',
    close: 'إغلاق',
    officialDocBanner: 'جامعة Mustawa · عمادة الشؤون الأكاديمية والتسجيل',
    instructorSignature: 'توقيع المحاضر / الممتحن',
    registrarSignature: 'اعتماد المسجل / العميد',
    officialStampDate: 'الختم الرسمي والتاريخ',
    printedOn: 'تاريخ الطباعة',
    analyticsTrendTitle: 'اتجاه نسبة الحضور',
    analyticsTrendDesc: 'نسبة الحضور في الجلسات المسجلة عبر التواريخ',
    analyticsMustawaTitle: 'النتائج والحضور حسب Mustawa',
    analyticsMustawaDesc: 'نسبة الحضور مقابل متوسط الدرجة الصافية عبر Mustawa 1 – 8',
    legendAttendanceRate: 'نسبة الحضور %',
    legendAvgNetScore: 'المعدل الصافي %',
    noChartData: 'لا توجد بيانات مسجلة لهذا الاختيار بعد.',
    studentTrendTitle: 'معدل الحضور — آخر 10 جلسات',
    studentTrendDesc: 'نسبة الحضور التراكمية وحالة كل جلسة عبر أحدث المحاضرات المسجلة',
    rollingRateLabel: 'نسبة الحضور التراكمية %',
    sessionsWindowSuffix: 'جلسات',
    academicAlertTitleCritical: 'تنبيه أكاديمي حرج — يتطلب متابعة فورية',
    academicAlertTitleWarning: 'تحذير أكاديمي — يُنصح بالمراجعة',
    warnOverallFailing: 'المعدل الصافي الإجمالي ({score}%) انخفض دون حد النجاح البالغ 50%.',
    warnOverallNear: 'المعدل الصافي الإجمالي ({score}%) قريب من حد الـ 50% (50%–58%).',
    warnExamFailing: 'الدرجة الصافية لمادة "{subject}" ({score}%) أقل من حد النجاح البالغ 50%.',
    warnExamNear: 'الدرجة الصافية لمادة "{subject}" ({score}%) قريبة من حد الـ 50%.',
    warnAbsenceCritical: 'تم بلوغ الحد الحرج للغياب: {count} حصص غياب (خصم تلقائي {deduction}%).',
    warnAbsenceHigh: 'تنبيه ارتفاع الغياب: {count} حصص غياب (خصم تلقائي {deduction}%).',
    badgeAtRisk: 'معرض للخطر',
    badgeGradeRisk: 'خطر الدرجات',
    badgeNearThreshold: 'قريب من 50%',
    badgeBelow50: 'أقل من 50%',
    badgeHighAbsence: 'غياب مرتفع',
    filterAtRiskOnly: 'المعرضون للخطر فقط',
    atRiskBannerTitle: 'طلاب تم رصدهم في منطقة الخطر الأكاديمي',
    atRiskBannerDesc: 'يتم تمييز الطلاب ذوي الدرجات القريبة من 50% أو الأقل منها، أو ذوي الغياب المرتفع تلقائياً.',
    riskMetricLabel: 'طلاب تحت التنبيه',
    inlineCsvTitle: 'رفع جماعي للطلاب عبر ملف CSV',
    inlineCsvDesc: 'اختر ملف .csv لتحليل البيانات وتسجيل الطلاب مباشرة في Mustawa المحدد.',
    downloadCsvTemplate: 'نموذج CSV',
    csvDuplicatesSkippedNote: 'أرقام جامعية مكررة سيتم تجاوزها',
    csvClearFile: 'مسح',
    editStudent: 'تعديل',
    editStudentTitle: 'تعديل بيانات الطالب',
    updateStudent: 'حفظ التعديلات',
    nextPenaltyHint: 'بقاء {remaining} غياب إضافي يفعّل خصم -{nextDeduction}% (عند {threshold} غياب).',
    maxPenaltyReached: 'تم الوصول إلى الحد الأقصى لخصم الغياب (30%).',
    classAvgLabel: 'متوسط الصف الصافي',
    highestScoreLabel: 'أعلى درجة صافية',
    passRateLabel: 'نسبة النجاح (≥50%)',
    atRiskCountLabel: 'تحت التنبيه (≤58%)',
    bottomNavHome: 'الرئيسية',
    bottomNavBooks: 'الكتب',
    bottomNavSearch: 'البحث',
    bottomNavFiles: 'ملفاتي',
    bottomNavMore: 'المزيد',
    mustawaLibraryTitle: 'مجلدات ومقررات Mustawa',
    mustawaLibrarySubtitle: 'اختر أي مستوى دراسي لعرض قوائم الطلاب وسجلات الحضور والاختبارات والمواد العلمية.',
    openVolumeAction: 'فتح المستوى',
    quickToolsTitle: 'الوصول السريع لإدارة الكلية',
    quickToolsDesc: 'انتقل مباشرة إلى رصد الحضور أو جدول الدرجات أو الإعلانات أو الترقية الأكاديمية.',
    arabicSampleGuideTitle: 'حقيبة علم الصرف والميزان الصرفي',
    arabicSampleGuideDesc: 'ملخص علمي شامل واختبار تدريبي مع نموذج الإجابة جاهز في أداة الدراسة.',
    savedSessionNote: 'آخر رقم جامعي تم فتحه',
    bulkAttendanceTitle: 'استيراد الحضور الجماعي',
    bulkAttendanceDesc: 'ارفع ملف .csv أو الصق السطور (الرقم، التاريخ، المادة، الحالة، ملاحظة) لتسجيل الحضور دفعة واحدة.',
    bulkAttendanceAction: 'استيراد الحضور',
    bulkExamTitle: 'استيراد درجات الاختبارات الجماعي',
    bulkExamDesc: 'ارفع ملف .csv أو الصق السطور (الرقم، المادة، النصفي، أعمال السنة، النهائي) لتحديث الدرجات دفعة واحدة.',
    bulkExamAction: 'استيراد الدرجات',
    pasteCsvOrLines: 'أو الصق سطور CSV مباشرة',
    unknownStudentIdsNote: 'أرقام جامعية غير موجودة تم تجاوزها',
  },
  so: {
    appTitle: 'Mustawa',
    appSubtitle: 'Nidaamka Xaadirinta, Imtixaanaadka & Waxbarashada AI ee Jaamacadda',
    dir: 'ltr',
    roleAdmin: 'Maamulka / Macallinka',
    roleStudent: 'Ardayga',
    switchRole: 'Beddel Doorka',
    signOut: 'Ka Bax',
    adminConsole: 'Xarunta Maamulka & Macallinka',
    adminConsoleDesc: 'Maamul liisaska Mustawa, qaad xaadirinta degdegga ah, geli dhibcaha imtixaanka, daabac ogeysiisyada, oo gudbi ardayda.',
    studentPortal: 'Bogga Ardayga (Akhri Kaliya)',
    studentPortalDesc: 'Xogtaada waxbarasho, diiwaanka xaadirinta, ganaaxa tooska ah, natiijooyinka imtixaanka iyo ogeysiisyada Mustawa.',
    studentIdLoginTitle: 'Gelitaanka Bogga Ardayga',
    studentIdLoginDesc: 'Geli lambarkaaga ardayga (tusaale: 13) si aad u aragto xaadirinta, ganaaxa dhibcaha, natiijooyinka iyo ogeysiisyada Mustawa.',
    enterStudentIdPlaceholder: 'Geli ID-ga Ardayga (tusaale: 13)',
    signInAsStudent: 'Fur Bogga Ardayga',
    signInAsAdmin: 'Gal Xarunta Macallinka / Maamulka',
    adminPasscodeLabel: 'Furaha Maamulka (tusaale: admin123)',
    adminQuickAccess: 'Gelitaan Degdeg ah',
    readOnlyNotice: 'Akhri Kaliya · Ardaygu waxba kama beddeli karo xogtan',
    navOverview: 'Guudmar',
    navSearch: 'Raadi ID',
    navAttendance: 'Xaadirinta',
    navExams: 'Imtixaanaadka',
    navAnnouncements: 'Ogeysiisyada',
    navStudyAi: 'AI PDF Waxbarasho',
    navPromotion: 'U Gudbinta',
    mustawaLabel: 'Mustawa',
    allMustawas: 'Dhammaan Mustawa',
    selectMustawa: 'Dooro Mustawa',
    totalStudents: 'Ardayda Diiwaangashan',
    avgAttendanceRate: 'Heerka Xaadirinta',
    studentsAtRisk: 'Ganaax Leh',
    totalAnnouncements: 'Ogeysiisyada Firfircoon',
    studentDirectory: 'Liiska Ardayda Mustawa',
    addStudent: 'Ku Dar Arday',
    bulkImport: 'Soo Deji Koox',
    exportExcel: 'Soo Degso Excel',
    exportCsv: 'Soo Degso CSV',
    exportPdf: 'Soo Degso PDF',
    printTranscript: 'Daabac Warbixin',
    headerPrint: 'Daabac',
    notificationsLabel: 'Ogeysiisyada',
    unreadCountSuffix: 'aan la akhrin',
    allCaughtUp: 'Dhammaan waa la akhriyay',
    markAllRead: 'Calaamadee wada akhrisan',
    viewAllNotices: 'Fur Guddiga Ogeysiisyada',
    filterByNameOrId: 'Ku shaandhee ID ama magac...',
    colId: 'ID',
    colName: 'Magaca Ardayga',
    colMustawa: 'Mustawa',
    colMissed: 'Maqnaansho',
    colPenalty: 'Ganaax',
    colAvgNet: 'Celceliska Net',
    colStanding: 'Xaaladda',
    colActions: 'Ficil',
    viewProfile: 'Eeg',
    deleteStudent: 'Tirtir',
    noStudentsFound: 'Ma jiro arday ku habboon shaandhada Mustawa ee hadda.',
    standingGood: 'Xaalad Wanaagsan',
    standingWarning: 'Digniin Ganaax',
    standingCritical: 'Ganaax Sare',
    standingBarred: 'Maqnaansho Badan',
    searchPortalTitle: 'Bogga Raadinta ID-ga Ardayga',
    searchPortalDesc: 'Geli ID-ga ardayga si aad u eegto taariikhda maqnaanshaha, ganaaxa dhibcaha iyo natiijooyinka imtixaanka.',
    searchButton: 'Raadi ID',
    quickExamples: 'Raadin Degdeg ah:',
    studentNotFound: 'Lama helin arday leh ID-gaas.',
    profileSummary: 'Xogta Ardayga',
    missedClassesCount: 'Wadarta Xiisadaha la Maqnaa',
    automatedDeduction: 'Ganaaxa Dhibcaha ee Tooska ah',
    attendanceHistory: 'Diiwaanka Xaadirinta ee Dhow',
    examTranscript: 'Natiijooyinka Imtixaanka',
    mustawaNotices: 'Ogeysiisyada Mustawa',
    penaltyPolicyTitle: 'Sharciga Ganaaxa Maqnaanshaha',
    penaltyRuleSummary: '0–2 maqnaansho: 0% · 3–4: 5% · 5–6: 10% · 7–9: 20% · 10+: 30%',
    attendanceTitle: 'Xaadirinta Maalinlaha ee Degdegga ah',
    attendanceDesc: 'Habka Joogitaanka Tooska ah: arday kasta wuxuu ku bilaabmaa Jooge. Taabo kaliya kuwa maqan, kadibna kaydi.',
    attendanceDate: 'Taariikhda Casharka',
    courseName: 'Maaddada / Casharka',
    markAllPresent: 'Dhammaan Waa Joogaan',
    saveAttendance: 'Kaydi Xaadirinta',
    saving: 'Waa la kaydinayaa...',
    savedSuccess: 'Waa la kaydiyay',
    presentLabel: 'Jooga',
    absentLabel: 'Maqan',
    presentCount: 'Jooga',
    absentCount: 'Maqan',
    absenceOnlyHint: 'Guji saf kasta si aad u beddesho Maqan / Jooga',
    voiceNoteTitle: 'Qoraal Cod ah (Gemini Transcribe)',
    voiceRecordStart: 'Duub Cod',
    voiceRecordStop: 'Jooji & Qor',
    transcribingAudio: 'Codka waa la qorayaa...',
    voiceTranscriptLabel: 'Qoraalka Codka',
    examsTitle: 'Shaxda Gelinta Dhibcaha Imtixaanka',
    examsDesc: 'Ku qor dhibcaha Midterm, Shaqada iyo Final hal shax. Ganaaxa maqnaanshaha si toos ah ayuu u jarmaa.',
    subjectLabel: 'Maaddada',
    saveAllGrades: 'Kaydi Dhammaan',
    midtermCol: 'Midterm (30)',
    courseworkCol: 'Shaqo (20)',
    finalCol: 'Final (50)',
    grossCol: 'Wadarta',
    deductionCol: 'Ganaax',
    netCol: 'Net',
    gradeCol: 'Darajo',
    unsavedChanges: 'Isbeddel aan la kaydin',
    announcementsTitle: 'Guddiga Ogeysiisyada Mustawa',
    announcementsDesc: 'Daabac warar iyo ogeysiisyo u gaar ah ardayda ku jirta Mustawa-gaas.',
    postAnnouncement: 'Ogeysiis Cusub',
    announcementTitlePlaceholder: 'Cinwaanka ogeysiiska...',
    announcementBodyPlaceholder: 'Ku qor faahfaahinta Ingiriisi, Carabi, ama Soomaali...',
    targetMustawa: 'Mustawa-ga la Beegsanayo',
    publishNotice: 'Daabac Ogeysiiska',
    dictateWithMic: 'Ku Hadal Makarafoonka',
    translateWithAi: 'Hagaaji / Turjun (AI)',
    noAnnouncements: 'Weli ogeysiis looma soo dhigin Mustawa-gan.',
    bulkImportTitle: 'Soo Dejinta Ardayda Badan',
    bulkImportDesc: 'Soo geli fayl CSV ah ama ku dheji liis ("ID, Magaca, Email, Telefoon" ama "Magaca" oo kaliya) si loogu daro Mustawa.',
    uploadCsvFile: 'Dooro Fayl CSV',
    pasteStudentList: 'Ku Dheji Liiska Ardayda',
    importPreview: 'Diyaar u ah Soo Dejin',
    confirmImport: 'Soo Deji Ardayda',
    cancel: 'Jooji',
    promotionTitle: 'U Gudbinta Mustawa-ga Xiga',
    promotionDesc: 'U gudbi arday gaar ah ama dhammaan fasalka Mustawa heerka ku xiga dhammaadka sanad dugsiyeedka.',
    sourceMustawa: 'Ka Bilaabma Mustawa',
    destinationMustawa: 'U Gudub Mustawa',
    promoteAllInMustawa: 'Gudbi Dhammaan Mustawa-gan',
    promoteSelected: 'Gudbi Kuwa La Doortay',
    selectAll: 'Dooro Dhammaan',
    studentsSelected: 'la doortay',
    confirmPromotion: 'Fulinta Gudbinta',
    promotionSuccess: 'Ardayda si guul leh ayaa loo gudbiyay',
    studyAiTitle: 'Qalabka Waxbarashada AI ee PDF',
    studyAiDesc: 'Soo geli PDF (oo leh faham sare oo Carabi, Soomaali iyo Ingiriisi ah) si AI uu u soo saaro soo koobid, su’aalo iyo jawaabo buuxa.',
    uploadPdfLabel: 'Soo Geli Faylka PDF',
    uploadPdfHint: 'Waxay taageertaa Carabi, Ingiriisi iyo luqado badan ilaa 12 MB',
    orPasteNotes: 'Ama ku dheji qoraalka casharka',
    outputLanguageLabel: 'Luqadda Natiijada',
    questionCountLabel: 'Tirada Su’aalaha',
    generateStudyPack: 'Samee Soo Koobid & Imtixaan',
    generatingStudyPack: 'Gemini ayaa falanqeynaya faylka...',
    summaryTab: 'Soo Koobid',
    quizTab: 'Su’aalo Tababar',
    answerKeyTab: 'Furaha Jawaabaha',
    savedGuidesTitle: 'Hagaha Waxbarasho ee Kaydsan',
    revealAnswer: 'Muuji Jawaabta',
    hideAnswer: 'Qari Jawaabta',
    correctAnswer: 'Jawaabta Saxda ah',
    explanationLabel: 'Sharaxaad',
    checkQuizScore: 'Hubi Dhibcahayga',
    yourScore: 'Natiijada',
    addStudentTitle: 'Diiwaangeli Arday Cusub',
    studentIdOptional: 'ID-ga Ardayga (ka tag si toos loogu sameeyo)',
    fullNameLabel: 'Magaca oo Buuxa',
    emailLabel: 'Email-ka Jaamacadda',
    phoneLabel: 'Lambarka Telefoonka',
    saveStudent: 'Kaydi Ardayga',
    dateLabel: 'Taariikhda',
    statusLabel: 'Xaaladda',
    loading: 'Waa la soo rarayaa...',
    errorPrefix: 'Khalad:',
    close: 'Xir',
    officialDocBanner: 'Jaamacadda Mustawa · Xafiiska Diiwaanka Waxbarashada',
    instructorSignature: 'Saxiixa Macallinka / Imtixaan-qaadaha',
    registrarSignature: 'Hubinta Diiwaanhayaha / Hormuudka',
    officialStampDate: 'Shaabadda Rasmiga ah & Taariikhda',
    printedOn: 'La daabacay',
    analyticsTrendTitle: 'Isbeddelka Heerka Xaadirinta',
    analyticsTrendDesc: 'Boqolleyga xaadirinta casharrada taariikhaha la diiwaangeliyay',
    analyticsMustawaTitle: 'Imtixaanka & Xaadirinta Mustawa-yada',
    analyticsMustawaDesc: 'Heerka xaadirinta vs. celceliska dhibcaha Net ee Mustawa 1 – 8',
    legendAttendanceRate: 'Xaadirinta %',
    legendAvgNetScore: 'Celceliska Net %',
    noChartData: 'Weli xog looma diiwaangelin doorashadan.',
    studentTrendTitle: 'Heerka Xaadirinta — 10-kii Cashar ee Ugu Dambeeyay',
    studentTrendDesc: 'Boqolleyga xaadirinta ee isbiirsaday iyo xaaladda cashar kasta',
    rollingRateLabel: 'Heerka Xaadirinta %',
    sessionsWindowSuffix: 'cashar',
    academicAlertTitleCritical: 'Digniin Waxbarasho oo Halis ah — Waxay u Baahan Tahay Daryeel Degdeg ah',
    academicAlertTitleWarning: 'Digniin Khatar Waxbarasho — Tallaabo ayaa la Taliyey',
    warnOverallFailing: 'Celceliska guud ({score}%) wuxuu ka hoos maray xadka baasista ee 50%.',
    warnOverallNear: 'Celceliska guud ({score}%) wuxuu u dhow yahay xadka 50% (50%–58%).',
    warnExamFailing: 'Maaddada "{subject}" dhibcaheeda Net ({score}%) waxay ka hooseeyaan xadka 50%.',
    warnExamNear: 'Maaddada "{subject}" dhibcaheeda Net ({score}%) waxay u dhow yihiin xadka 50%.',
    warnAbsenceCritical: 'Xad sare oo maqnaansho: {count} cashar oo maqan (ganaax toos ah {deduction}%).',
    warnAbsenceHigh: 'Maqnaansho badan: {count} cashar oo maqan (ganaax toos ah {deduction}%).',
    badgeAtRisk: 'Khatar Ku Jira',
    badgeGradeRisk: 'Khatar Dhibco',
    badgeNearThreshold: 'U Dhow 50%',
    badgeBelow50: 'Ka Hooseeya 50%',
    badgeHighAbsence: 'Maqnaansho Badan',
    filterAtRiskOnly: 'Kuwa Khatarta Ku Jira Kaliya',
    atRiskBannerTitle: 'Ardayda Khatarta Waxbarasho Ku Jira',
    atRiskBannerDesc: 'Ardayda dhibcahoodu u dhow yihiin ama ka hooseeyaan 50%, ama maqnaanshahoodu badan yahay, si toos ah ayaa loo calaamadeeyaa.',
    riskMetricLabel: 'Ardayda Digniinta Leh',
    inlineCsvTitle: 'Soo Dejinta Kooxda ee Faylka CSV',
    inlineCsvDesc: 'Dooro fayl .csv si toos ah loogu diiwaangeliyo arday badan Mustawa-ga la doortay.',
    downloadCsvTemplate: 'Tusaale CSV',
    csvDuplicatesSkippedNote: 'ID-yo soo noqnoqday waa la dhaafi doonaa',
    csvClearFile: 'Nadiifi',
    editStudent: 'Wax Ka Beddel',
    editStudentTitle: 'Wax Ka Beddel Xogta Ardayga',
    updateStudent: 'Cusbooneysii Ardayga',
    nextPenaltyHint: '{remaining} maqnaansho oo kale waxay kicinaysaa -{nextDeduction}% ganaax (marka la gaaro {threshold}).',
    maxPenaltyReached: 'Heerka ugu sarreeya ee ganaaxa maqnaanshaha (30%) waa la gaaray.',
    classAvgLabel: 'Celceliska Fasalka',
    highestScoreLabel: 'Dhibcaha Ugu Sarreeya',
    passRateLabel: 'Heerka Baasista (≥50%)',
    atRiskCountLabel: 'Digniin Leh (≤58%)',
    bottomNavHome: 'Hoyga',
    bottomNavBooks: 'Buugaagta',
    bottomNavSearch: 'Baaritaan',
    bottomNavFiles: 'Faylashayda',
    bottomNavMore: 'Dheeraad',
    mustawaLibraryTitle: 'Buugaagta & Heerarka Mustawa',
    mustawaLibrarySubtitle: 'Dooro heer kasta oo Mustawa ah si aad u furto liiska ardayda, xaadirinta, iyo casharrada.',
    openVolumeAction: 'Fur Mustawa',
    quickToolsTitle: 'Qalabka Degdegga ah ee Macallinka',
    quickToolsDesc: 'Toos ugu gudub xaadirinta, buugga imtixaanka, ogeysiisyada, ama gudbinta fasalka.',
    arabicSampleGuideTitle: 'Casharka Cilmi Sarfiga (Carabi)',
    arabicSampleGuideDesc: 'Soo koobid, su’aalo tababar iyo fure jawaabo ah oo diyaar ku ah Qalabka AI.',
    savedSessionNote: 'ID-ga Ardayga ee u dambeeyay',
    bulkAttendanceTitle: 'Soo Dejinta Xaadirinta Kooxda',
    bulkAttendanceDesc: 'Soo geli fayl .csv ama ku dheji sadarada (ID, Taariikhda, Maaddada, Xaaladda, Fiiro) hal mar.',
    bulkAttendanceAction: 'Soo Deji Xaadirinta',
    bulkExamTitle: 'Soo Dejinta Dhibcaha Imtixaanka ee Kooxda',
    bulkExamDesc: 'Soo geli fayl .csv ama ku dheji sadarada (ID, Maaddada, Dhexe, Shaqo-fasal, Ugu dambayn) hal mar.',
    bulkExamAction: 'Soo Deji Dhibcaha',
    pasteCsvOrLines: 'Ama ku dheji sadarada CSV toos',
    unknownStudentIdsNote: 'ID-yo aan la aqoon ayaa la dhaafay',
  },
};
