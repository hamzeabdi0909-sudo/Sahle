import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import {
  calculateAttendancePenalty,
  clampScore,
  computeNetExamScore,
  getNextMustawa,
  type MustawaLevel,
  type ParsedBulkStudent,
} from '../utils/academicLogic.ts';
import type {
  AnnouncementRecord,
  AttendanceRecord,
  DailyAttendanceBucket,
  ExamGradeRecord,
  QuizQuestion,
  StudentLookupPayload,
  StudentRecord,
  StudyGuideRecord,
} from '../types/academic.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'university.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      mustawa TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      date TEXT NOT NULL,
      course TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('present', 'absent')),
      note TEXT NOT NULL DEFAULT '',
      UNIQUE(student_id, date, course),
      FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS exam_grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      midterm REAL NOT NULL DEFAULT 0,
      coursework REAL NOT NULL DEFAULT 0,
      final_exam REAL NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      UNIQUE(student_id, subject),
      FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mustawa TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT 'Faculty Admin',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS study_guides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      source_name TEXT NOT NULL,
      language TEXT NOT NULL,
      summary TEXT NOT NULL,
      key_concepts TEXT NOT NULL,
      quiz_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const row = db.prepare('SELECT COUNT(*) AS count FROM students').get() as { count: number };
  if (row.count === 0) {
    seedInitialData();
  }
  seedMustawa5To8IfMissing();
  seedRiskAndSessionHistoryIfMissing();
  seedSampleStudyGuideIfMissing();
}

function seedInitialData() {
  const now = new Date().toISOString();
  const insertStudent = db.prepare(
    'INSERT INTO students (id, full_name, mustawa, email, phone, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const seedStudents: Array<[string, string, MustawaLevel, string, string]> = [
    ['10', 'Amina Yusuf Hassan', 'Mustawa 1', 'amina.yusuf@mustawa.edu', '+252-61-5110010'],
    ['11', 'Omar Khalid Al-Mansoor', 'Mustawa 1', 'omar.khalid@mustawa.edu', '+252-61-5110011'],
    ['12', 'Halima Mohamed Farah', 'Mustawa 1', 'halima.farah@mustawa.edu', '+252-61-5110012'],
    ['13', 'Abdirahman Hassan Warsame', 'Mustawa 2', 'abdirahman.13@mustawa.edu', '+252-61-5110013'],
    ['14', 'Fatima Zahra Ibrahim', 'Mustawa 2', 'fatima.ibrahim@mustawa.edu', '+252-61-5110014'],
    ['15', 'Yusuf Abdullahi Noor', 'Mustawa 2', 'yusuf.noor@mustawa.edu', '+252-61-5110015'],
    ['16', 'Khadija Ali Osman', 'Mustawa 2', 'khadija.osman@mustawa.edu', '+252-61-5110016'],
    ['17', 'Mustafa Tariq Al-Harbi', 'Mustawa 3', 'mustafa.harbi@mustawa.edu', '+252-61-5110017'],
    ['18', 'Hodan Jama Ismail', 'Mustawa 3', 'hodan.ismail@mustawa.edu', '+252-61-5110018'],
    ['19', 'Bilal Ahmed Saeed', 'Mustawa 3', 'bilal.saeed@mustawa.edu', '+252-61-5110019'],
    ['20', 'Maryam Abdiqadir Duale', 'Mustawa 4', 'maryam.duale@mustawa.edu', '+252-61-5110020'],
    ['21', 'Zaid Abdullah Al-Qasimi', 'Mustawa 4', 'zaid.qasimi@mustawa.edu', '+252-61-5110021'],
  ];

  const insertAttendance = db.prepare(
    'INSERT INTO attendance (student_id, date, course, status, note) VALUES (?, ?, ?, ?, ?)'
  );
  const insertGrade = db.prepare(
    'INSERT INTO exam_grades (student_id, subject, midterm, coursework, final_exam, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertAnnouncement = db.prepare(
    'INSERT INTO announcements (mustawa, title, body, author, created_at) VALUES (?, ?, ?, ?, ?)'
  );

  const tx = db.transaction(() => {
    for (const s of seedStudents) {
      insertStudent.run(s[0], s[1], s[2], s[3], s[4], now);
    }

    const dates = ['2026-11-10', '2026-11-12', '2026-11-14', '2026-11-16', '2026-11-17'];
    const absentMap: Record<string, string[]> = {
      '10': [],
      '11': ['2026-11-12', '2026-11-16', '2026-11-17'], // 3 missed -> 5%
      '12': ['2026-11-10'],
      '13': ['2026-11-10', '2026-11-12', '2026-11-14', '2026-11-16'], // 4 missed -> 5%
      '14': [],
      '15': ['2026-11-10', '2026-11-12', '2026-11-14', '2026-11-16', '2026-11-17'], // 5 missed -> 10%
      '16': ['2026-11-14'],
      '17': ['2026-11-10', '2026-11-12'],
      '18': [],
      '19': ['2026-11-10', '2026-11-12', '2026-11-14', '2026-11-16', '2026-11-17'], // 5 missed -> 10%
      '20': [],
      '21': ['2026-11-12'],
    };

    for (const s of seedStudents) {
      const id = s[0];
      const missedDates = new Set(absentMap[id] || []);
      for (const d of dates) {
        const status = missedDates.has(d) ? 'absent' : 'present';
        insertAttendance.run(id, d, 'Core Lecture', status, status === 'absent' ? 'Unexcused absence' : '');
      }
    }

    // Add 2 extra historical absences for student 19 so we also demonstrate the 20% tier (7 missed)
    insertAttendance.run('19', '2026-11-04', 'Core Lecture', 'absent', 'Missed morning lab');
    insertAttendance.run('19', '2026-11-06', 'Core Lecture', 'absent', 'Missed morning lab');

    // Exam grades
    const subjectsByStudent: Record<string, Array<[string, number, number, number]>> = {
      '10': [['Arabic Rhetoric', 27, 19, 45], ['Foundations of Computing', 26, 18, 44]],
      '11': [['Arabic Rhetoric', 22, 16, 38], ['Foundations of Computing', 24, 17, 40]],
      '12': [['Arabic Rhetoric', 28, 19, 47], ['Foundations of Computing', 25, 18, 43]],
      '13': [['Data Structures', 26, 18, 44], ['Arabic Syntax & Morphology', 24, 17, 41], ['Database Systems', 27, 19, 45]],
      '14': [['Data Structures', 29, 20, 48], ['Arabic Syntax & Morphology', 28, 19, 46]],
      '15': [['Data Structures', 21, 15, 36], ['Arabic Syntax & Morphology', 20, 14, 34]],
      '16': [['Data Structures', 25, 18, 42], ['Arabic Syntax & Morphology', 26, 18, 43]],
      '17': [['Software Architecture', 26, 18, 44], ['Research Methodology', 24, 17, 42]],
      '18': [['Software Architecture', 29, 19, 47], ['Research Methodology', 28, 20, 46]],
      '19': [['Software Architecture', 22, 15, 35], ['Research Methodology', 21, 14, 33]],
      '20': [['Capstone Seminar', 29, 20, 48], ['Applied Ethics', 28, 19, 47]],
      '21': [['Capstone Seminar', 25, 17, 42], ['Applied Ethics', 26, 18, 43]],
    };

    for (const [sid, rows] of Object.entries(subjectsByStudent)) {
      for (const [subj, mid, cw, fin] of rows) {
        insertGrade.run(sid, subj, mid, cw, fin, now);
      }
    }

    // Per-Mustawa Announcements
    insertAnnouncement.run(
      'Mustawa 1',
      'Orientation & Academic Advising Week',
      'All Mustawa 1 students must complete their course registration verification at Hall B before Thursday 14:00.',
      'Dean of Admissions',
      now
    );
    insertAnnouncement.run(
      'Mustawa 2',
      'جدول اختبارات منتصف الفصل — Mustawa 2',
      'يرجى من جميع طلاب Mustawa 2 مراجعة قاعات الاختبار وإحضار البطاقة الجامعية. سيتم احتساب خصم الغياب تلقائياً في الكشف النهائي.',
      'Dr. Tariq Al-Mansoor',
      now
    );
    insertAnnouncement.run(
      'Mustawa 2',
      'Data Structures Lab Submission Extended',
      'Lab 4 tree traversal exercises are now due Saturday 23:59. Upload your PDF study summaries in the AI Study portal.',
      'Prof. A. Warsame',
      now
    );
    insertAnnouncement.run(
      'Mustawa 3',
      'Ogeysiis Muhiim ah — Mustawa 3',
      'Ardayda Mustawa 3 waxaa la ogeysiinayaa in kulanka diyaarinta mashruuca qalin-jabinta uu dhacayo Isniinta 10:00 AM.',
      'Academic Coordinator',
      now
    );
    insertAnnouncement.run(
      'Mustawa 4',
      'Final Graduation Clearance & Transcript Audit',
      'Mustawa 4 candidates should verify their net exam averages and attendance standing prior to end-of-year promotion.',
      'Registrar Office',
      now
    );
  });

  tx();
}

function seedMustawa5To8IfMissing() {
  const alreadySeeded = db
    .prepare('SELECT value FROM app_meta WHERE key = ?')
    .get('seed_mustawa_5_8') as { value: string } | undefined;
  if (alreadySeeded) return;

  const now = new Date().toISOString();
  const insertStudent = db.prepare(
    'INSERT OR IGNORE INTO students (id, full_name, mustawa, email, phone, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertAttendance = db.prepare(
    'INSERT OR IGNORE INTO attendance (student_id, date, course, status, note) VALUES (?, ?, ?, ?, ?)'
  );
  const insertGrade = db.prepare(
    'INSERT OR IGNORE INTO exam_grades (student_id, subject, midterm, coursework, final_exam, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertAnnouncement = db.prepare(
    'INSERT INTO announcements (mustawa, title, body, author, created_at) VALUES (?, ?, ?, ?, ?)'
  );

  const upperStudents: Array<[string, string, MustawaLevel, string, string]> = [
    ['22', 'Salma Nur Ibrahim', 'Mustawa 5', 'salma.ibrahim@mustawa.edu', '+252-61-5110022'],
    ['23', 'Hassan Farah Mohamed', 'Mustawa 5', 'hassan.farah@mustawa.edu', '+252-61-5110023'],
    ['24', 'Nadia Tariq Al-Zahrani', 'Mustawa 6', 'nadia.zahrani@mustawa.edu', '+252-61-5110024'],
    ['25', 'Ibrahim Ali Omar', 'Mustawa 6', 'ibrahim.omar@mustawa.edu', '+252-61-5110025'],
    ['26', 'Safiya Abdi Warsame', 'Mustawa 7', 'safiya.warsame@mustawa.edu', '+252-61-5110026'],
    ['27', 'Khalid Mansoor Al-Dosari', 'Mustawa 7', 'khalid.dosari@mustawa.edu', '+252-61-5110027'],
    ['28', 'Aisha Jama Hussein', 'Mustawa 8', 'aisha.hussein@mustawa.edu', '+252-61-5110028'],
    ['29', 'Yasin Abdullahi Duale', 'Mustawa 8', 'yasin.duale@mustawa.edu', '+252-61-5110029'],
  ];

  const dates = ['2026-11-10', '2026-11-12', '2026-11-14', '2026-11-16', '2026-11-17'];
  const absentMap: Record<string, string[]> = {
    '22': ['2026-11-12'],
    '23': ['2026-11-10', '2026-11-14', '2026-11-17'],
    '24': [],
    '25': ['2026-11-10', '2026-11-12', '2026-11-16', '2026-11-17'],
    '26': ['2026-11-14'],
    '27': ['2026-11-10', '2026-11-12', '2026-11-14', '2026-11-16', '2026-11-17'],
    '28': [],
    '29': ['2026-11-10', '2026-11-16'],
  };

  const gradesMap: Record<string, Array<[string, number, number, number]>> = {
    '22': [['Compiler Design', 27, 19, 45], ['Distributed Systems', 28, 18, 44]],
    '23': [['Compiler Design', 24, 17, 41], ['Distributed Systems', 23, 16, 40]],
    '24': [['Machine Learning', 29, 19, 47], ['Cloud Architecture', 28, 19, 46]],
    '25': [['Machine Learning', 23, 16, 39], ['Cloud Architecture', 24, 17, 40]],
    '26': [['Information Security', 27, 18, 44], ['Advanced Arabic Texts', 26, 19, 43]],
    '27': [['Information Security', 22, 16, 38], ['Advanced Arabic Texts', 24, 15, 39]],
    '28': [['Senior Thesis Defense', 29, 20, 48], ['Research Colloquium', 28, 19, 47]],
    '29': [['Senior Thesis Defense', 26, 18, 43], ['Research Colloquium', 25, 18, 42]],
  };

  const tx = db.transaction(() => {
    for (const s of upperStudents) {
      insertStudent.run(s[0], s[1], s[2], s[3], s[4], now);
      const missed = new Set(absentMap[s[0]] || []);
      for (const d of dates) {
        const status = missed.has(d) ? 'absent' : 'present';
        insertAttendance.run(
          s[0],
          d,
          'Core Lecture',
          status,
          status === 'absent' ? 'Unexcused absence' : ''
        );
      }
      for (const [subj, mid, cw, fin] of gradesMap[s[0]] || []) {
        insertGrade.run(s[0], subj, mid, cw, fin, now);
      }
    }

    insertAnnouncement.run(
      'Mustawa 5',
      'Senior Honors Track Registration — Mustawa 5',
      'Mustawa 5 students eligible for honors electives must submit advisor approvals by Tuesday.',
      'Faculty Dean',
      now
    );
    insertAnnouncement.run(
      'Mustawa 7',
      'إرشادات مشروع التخرج التمهيدي — Mustawa 7',
      'على جميع طلاب Mustawa 7 تسليم مقترحات البحث النهائية عبر البوابة الأكاديمية قبل نهاية الأسبوع.',
      'Graduate Committee',
      now
    );

    db.prepare('INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)').run(
      'seed_mustawa_5_8',
      '1'
    );
  });

  tx();
}

function seedRiskAndSessionHistoryIfMissing() {
  const alreadySeeded = db
    .prepare('SELECT value FROM app_meta WHERE key = ?')
    .get('seed_risk_and_10_sessions') as { value: string } | undefined;
  if (alreadySeeded) return;

  const now = new Date().toISOString();
  const existingStudents = db
    .prepare('SELECT id FROM students')
    .all() as Array<{ id: string }>;

  const insertStudent = db.prepare(
    'INSERT OR IGNORE INTO students (id, full_name, mustawa, email, phone, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertAttendance = db.prepare(
    'INSERT OR IGNORE INTO attendance (student_id, date, course, status, note) VALUES (?, ?, ?, ?, ?)'
  );
  const insertGrade = db.prepare(
    'INSERT OR IGNORE INTO exam_grades (student_id, subject, midterm, coursework, final_exam, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const earlyDates = ['2026-10-27', '2026-10-29', '2026-11-01', '2026-11-03', '2026-11-05'];
  const all10Dates = [...earlyDates, '2026-11-10', '2026-11-12', '2026-11-14', '2026-11-16', '2026-11-17'];

  const tx = db.transaction(() => {
    // Top up existing seeded students with earlier 'present' sessions so last-10-sessions chart is rich
    for (const s of existingStudents) {
      for (const d of earlyDates) {
        insertAttendance.run(s.id, d, 'Core Lecture', 'present', '');
      }
    }

    // Seed student #30: low attendance penalty (1 missed -> 0%), but exam scores near/below 50% threshold
    insertStudent.run(
      '30',
      'Tariq Osman Jama',
      'Mustawa 4',
      'tariq.jama@mustawa.edu',
      '+252-61-5110030',
      now
    );
    for (const d of all10Dates) {
      const isAbsent = d === '2026-11-16';
      insertAttendance.run(
        '30',
        d,
        'Core Lecture',
        isAbsent ? 'absent' : 'present',
        isAbsent ? 'Unexcused absence' : ''
      );
    }
    insertGrade.run('30', 'Capstone Seminar', 14, 9, 24, now); // 47.0% (< 50%)
    insertGrade.run('30', 'Applied Ethics', 16, 10, 27, now); // 53.0% (near 50%)

    db.prepare('INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)').run(
      'seed_risk_and_10_sessions',
      '1'
    );
  });

  tx();
}

export function listStudents(mustawaFilter?: string): StudentRecord[] {
  const rows = (mustawaFilter && mustawaFilter !== 'ALL'
    ? db.prepare('SELECT * FROM students WHERE mustawa = ? ORDER BY CAST(id AS INTEGER), id').all(mustawaFilter)
    : db.prepare('SELECT * FROM students ORDER BY CAST(id AS INTEGER), id').all()) as Array<{
    id: string;
    full_name: string;
    mustawa: MustawaLevel;
    email: string;
    phone: string;
    created_at: string;
  }>;

  const attendanceStats = db
    .prepare(
      `SELECT student_id,
              COUNT(*) AS total_sessions,
              SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS missed_classes
       FROM attendance
       GROUP BY student_id`
    )
    .all() as Array<{ student_id: string; total_sessions: number; missed_classes: number }>;

  const statsMap = new Map<string, { total: number; missed: number }>();
  for (const stat of attendanceStats) {
    statsMap.set(stat.student_id, {
      total: stat.total_sessions || 0,
      missed: stat.missed_classes || 0,
    });
  }

  const allGrades = db.prepare('SELECT student_id, subject, midterm, coursework, final_exam FROM exam_grades').all() as Array<{
    student_id: string;
    subject: string;
    midterm: number;
    coursework: number;
    final_exam: number;
  }>;

  const gradesMap = new Map<
    string,
    Array<{ subject: string; midterm: number; coursework: number; final_exam: number }>
  >();
  for (const g of allGrades) {
    const arr = gradesMap.get(g.student_id) || [];
    arr.push(g);
    gradesMap.set(g.student_id, arr);
  }

  return rows.map((r) => {
    const st = statsMap.get(r.id) || { total: 0, missed: 0 };
    const penalty = calculateAttendancePenalty(st.missed);
    const sGrades = gradesMap.get(r.id) || [];
    let avgNet: number | null = null;
    let lowestNet: number | null = null;
    let lowestSubject: string | null = null;

    if (sGrades.length > 0) {
      let sum = 0;
      for (const g of sGrades) {
        const res = computeNetExamScore(g.midterm, g.coursework, g.final_exam, st.missed);
        sum += res.netScore;
        if (lowestNet === null || res.netScore < lowestNet) {
          lowestNet = res.netScore;
          lowestSubject = g.subject;
        }
      }
      avgNet = Math.round((sum / sGrades.length) * 100) / 100;
    }

    return {
      id: r.id,
      fullName: r.full_name,
      mustawa: r.mustawa,
      email: r.email,
      phone: r.phone,
      createdAt: r.created_at,
      missedClasses: st.missed,
      totalSessions: st.total,
      deductionPercent: penalty.deductionPercent,
      standing: penalty.standing,
      averageNetScore: avgNet,
      lowestNetScore: lowestNet,
      lowestSubject,
    };
  });
}

export function getStudentLookup(studentId: string): StudentLookupPayload | null {
  const all = listStudents();
  const student = all.find((s) => s.id.toLowerCase() === studentId.trim().toLowerCase());
  if (!student) return null;

  const attendanceRows = db
    .prepare('SELECT id, student_id, date, course, status, note FROM attendance WHERE student_id = ? ORDER BY date DESC, id DESC')
    .all(student.id) as Array<{
    id: number;
    student_id: string;
    date: string;
    course: string;
    status: 'present' | 'absent';
    note: string;
  }>;

  const attendance: AttendanceRecord[] = attendanceRows.map((a) => ({
    id: a.id,
    studentId: a.student_id,
    date: a.date,
    course: a.course,
    status: a.status,
    note: a.note,
  }));

  const gradeRows = db
    .prepare('SELECT * FROM exam_grades WHERE student_id = ? ORDER BY subject ASC')
    .all(student.id) as Array<{
    id: number;
    student_id: string;
    subject: string;
    midterm: number;
    coursework: number;
    final_exam: number;
    updated_at: string;
  }>;

  const exams: ExamGradeRecord[] = gradeRows.map((g) => {
    const calc = computeNetExamScore(g.midterm, g.coursework, g.final_exam, student.missedClasses);
    return {
      id: g.id,
      studentId: g.student_id,
      studentName: student.fullName,
      mustawa: student.mustawa,
      subject: g.subject,
      missedClasses: student.missedClasses,
      ...calc,
      updatedAt: g.updated_at,
    };
  });

  const announcements = listAnnouncements(student.mustawa);

  return {
    student,
    attendance,
    exams,
    announcements,
  };
}

export function generateNextStudentId(): string {
  const rows = db.prepare('SELECT id FROM students').all() as Array<{ id: string }>;
  let maxNum = 100;
  for (const r of rows) {
    const n = Number.parseInt(r.id, 10);
    if (Number.isFinite(n) && n > maxNum) {
      maxNum = n;
    }
  }
  return String(maxNum + 1);
}

export function createStudent(input: {
  id?: string;
  fullName: string;
  mustawa: MustawaLevel;
  email?: string;
  phone?: string;
}): StudentRecord {
  const id = input.id && input.id.trim() ? input.id.trim() : generateNextStudentId();
  const existing = db.prepare('SELECT id FROM students WHERE id = ?').get(id);
  if (existing) {
    throw new Error(`Student ID "${id}" already exists.`);
  }
  const now = new Date().toISOString();
  db.prepare('INSERT INTO students (id, full_name, mustawa, email, phone, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    id,
    input.fullName.trim(),
    input.mustawa,
    (input.email || '').trim(),
    (input.phone || '').trim(),
    now
  );

  const created = listStudents().find((s) => s.id === id);
  if (!created) throw new Error('Failed to retrieve created student');
  return created;
}

export function updateStudent(
  id: string,
  input: {
    fullName: string;
    mustawa: MustawaLevel;
    email?: string;
    phone?: string;
  }
): StudentRecord {
  const res = db
    .prepare(
      'UPDATE students SET full_name = ?, mustawa = ?, email = ?, phone = ? WHERE id = ?'
    )
    .run(
      input.fullName.trim(),
      input.mustawa,
      (input.email || '').trim(),
      (input.phone || '').trim(),
      id
    );
  if (res.changes === 0) {
    throw new Error(`Student ID "${id}" not found.`);
  }
  const updated = listStudents().find((s) => s.id === id);
  if (!updated) throw new Error('Failed to retrieve updated student');
  return updated;
}

export function deleteStudent(id: string): boolean {
  const res = db.prepare('DELETE FROM students WHERE id = ?').run(id);
  return res.changes > 0;
}

export function bulkImportStudents(
  mustawa: MustawaLevel,
  items: ParsedBulkStudent[]
): { inserted: number; skippedDuplicates: number } {
  const now = new Date().toISOString();
  const checkStmt = db.prepare('SELECT id FROM students WHERE id = ?');
  const insertStmt = db.prepare(
    'INSERT INTO students (id, full_name, mustawa, email, phone, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );

  let inserted = 0;
  let skippedDuplicates = 0;

  const tx = db.transaction(() => {
    for (const item of items) {
      let sid = item.studentId?.trim();
      if (sid) {
        const exists = checkStmt.get(sid);
        if (exists) {
          skippedDuplicates++;
          continue;
        }
      } else {
        sid = generateNextStudentId();
      }
      insertStmt.run(sid, item.fullName.trim(), mustawa, item.email.trim(), item.phone.trim(), now);
      inserted++;
    }
  });

  tx();
  return { inserted, skippedDuplicates };
}

export function getAttendanceForSession(mustawa: MustawaLevel, date: string, course: string) {
  const students = listStudents(mustawa);
  const existing = db
    .prepare('SELECT student_id, status, note FROM attendance WHERE date = ? AND course = ?')
    .all(date, course) as Array<{ student_id: string; status: 'present' | 'absent'; note: string }>;

  const statusMap = new Map(existing.map((e) => [e.student_id, e]));
  return students.map((s) => {
    const rec = statusMap.get(s.id);
    return {
      studentId: s.id,
      fullName: s.fullName,
      mustawa: s.mustawa,
      missedClasses: s.missedClasses,
      deductionPercent: s.deductionPercent,
      // Default-present mode: if no record yet, defaults to present
      status: rec ? rec.status : ('present' as const),
      note: rec ? rec.note : '',
      hasSavedRecord: Boolean(rec),
    };
  });
}

export function saveBulkAttendance(
  date: string,
  course: string,
  entries: Array<{ studentId: string; status: 'present' | 'absent'; note?: string }>
) {
  const upsert = db.prepare(`
    INSERT INTO attendance (student_id, date, course, status, note)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(student_id, date, course)
    DO UPDATE SET status = excluded.status, note = excluded.note
  `);

  const tx = db.transaction(() => {
    for (const e of entries) {
      upsert.run(e.studentId, date, course.trim() || 'Core Lecture', e.status, (e.note || '').trim());
    }
  });

  tx();
}

export function importBulkAttendanceRecords(
  entries: Array<{
    studentId: string;
    date: string;
    course: string;
    status: 'present' | 'absent';
    note?: string;
  }>
): { imported: number; unknownIds: string[] } {
  const existingRows = db.prepare('SELECT id FROM students').all() as Array<{ id: string }>;
  const idMap = new Map(existingRows.map((r) => [r.id.toLowerCase(), r.id]));

  const upsert = db.prepare(`
    INSERT INTO attendance (student_id, date, course, status, note)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(student_id, date, course)
    DO UPDATE SET status = excluded.status, note = excluded.note
  `);

  let imported = 0;
  const unknownSet = new Set<string>();

  const tx = db.transaction(() => {
    for (const e of entries) {
      const canonicalId = idMap.get(e.studentId.trim().toLowerCase());
      if (!canonicalId) {
        unknownSet.add(e.studentId.trim());
        continue;
      }
      const cleanDate = e.date.trim() || new Date().toISOString().slice(0, 10);
      const cleanCourse = e.course.trim() || 'Core Lecture';
      const cleanStatus = e.status === 'absent' ? 'absent' : 'present';
      upsert.run(canonicalId, cleanDate, cleanCourse, cleanStatus, (e.note || '').trim());
      imported++;
    }
  });

  tx();
  return { imported, unknownIds: Array.from(unknownSet) };
}

export function getExamSpreadsheet(mustawa: string, subject: string): ExamGradeRecord[] {
  const students = listStudents(mustawa);
  const grades = db
    .prepare('SELECT * FROM exam_grades WHERE subject = ?')
    .all(subject) as Array<{
    id: number;
    student_id: string;
    subject: string;
    midterm: number;
    coursework: number;
    final_exam: number;
    updated_at: string;
  }>;

  const gradeMap = new Map(grades.map((g) => [g.student_id, g]));

  return students.map((s) => {
    const g = gradeMap.get(s.id);
    const midterm = g ? g.midterm : 0;
    const coursework = g ? g.coursework : 0;
    const finalExam = g ? g.final_exam : 0;
    const calc = computeNetExamScore(midterm, coursework, finalExam, s.missedClasses);
    return {
      id: g?.id,
      studentId: s.id,
      studentName: s.fullName,
      mustawa: s.mustawa,
      subject,
      missedClasses: s.missedClasses,
      ...calc,
      updatedAt: g?.updated_at,
    };
  });
}

export function listExamSubjects(): string[] {
  const rows = db.prepare('SELECT DISTINCT subject FROM exam_grades ORDER BY subject ASC').all() as Array<{
    subject: string;
  }>;
  const defaults = ['Data Structures', 'Arabic Syntax & Morphology', 'Arabic Rhetoric', 'Database Systems', 'Software Architecture'];
  const set = new Set<string>([...rows.map((r) => r.subject), ...defaults]);
  return Array.from(set);
}

export function saveBulkExamGrades(
  subject: string,
  entries: Array<{ studentId: string; midterm: number; coursework: number; finalExam: number }>
) {
  const now = new Date().toISOString();
  const upsert = db.prepare(`
    INSERT INTO exam_grades (student_id, subject, midterm, coursework, final_exam, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(student_id, subject)
    DO UPDATE SET midterm = excluded.midterm, coursework = excluded.coursework, final_exam = excluded.final_exam, updated_at = excluded.updated_at
  `);

  const tx = db.transaction(() => {
    for (const e of entries) {
      upsert.run(
        e.studentId,
        subject.trim(),
        Number(e.midterm) || 0,
        Number(e.coursework) || 0,
        Number(e.finalExam) || 0,
        now
      );
    }
  });

  tx();
}

export function importBulkExamRecords(
  entries: Array<{
    studentId: string;
    subject: string;
    midterm: number;
    coursework: number;
    finalExam: number;
  }>
): { imported: number; unknownIds: string[] } {
  const now = new Date().toISOString();
  const existingRows = db.prepare('SELECT id FROM students').all() as Array<{ id: string }>;
  const idMap = new Map(existingRows.map((r) => [r.id.toLowerCase(), r.id]));

  const upsert = db.prepare(`
    INSERT INTO exam_grades (student_id, subject, midterm, coursework, final_exam, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(student_id, subject)
    DO UPDATE SET midterm = excluded.midterm, coursework = excluded.coursework, final_exam = excluded.final_exam, updated_at = excluded.updated_at
  `);

  let imported = 0;
  const unknownSet = new Set<string>();

  const tx = db.transaction(() => {
    for (const e of entries) {
      const canonicalId = idMap.get(e.studentId.trim().toLowerCase());
      if (!canonicalId) {
        unknownSet.add(e.studentId.trim());
        continue;
      }
      const cleanSubject = e.subject.trim();
      if (!cleanSubject) continue;
      upsert.run(
        canonicalId,
        cleanSubject,
        clampScore(Number(e.midterm) || 0, 0, 30),
        clampScore(Number(e.coursework) || 0, 0, 20),
        clampScore(Number(e.finalExam) || 0, 0, 50),
        now
      );
      imported++;
    }
  });

  tx();
  return { imported, unknownIds: Array.from(unknownSet) };
}

export function listAnnouncements(mustawaFilter?: string): AnnouncementRecord[] {
  const rows = (mustawaFilter && mustawaFilter !== 'ALL'
    ? db.prepare('SELECT * FROM announcements WHERE mustawa = ? ORDER BY id DESC').all(mustawaFilter)
    : db.prepare('SELECT * FROM announcements ORDER BY id DESC').all()) as Array<{
    id: number;
    mustawa: MustawaLevel;
    title: string;
    body: string;
    author: string;
    created_at: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    mustawa: r.mustawa,
    title: r.title,
    body: r.body,
    author: r.author,
    createdAt: r.created_at,
  }));
}

export function createAnnouncement(input: {
  mustawa: MustawaLevel;
  title: string;
  body: string;
  author?: string;
}): AnnouncementRecord {
  const now = new Date().toISOString();
  const res = db
    .prepare('INSERT INTO announcements (mustawa, title, body, author, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(input.mustawa, input.title.trim(), input.body.trim(), (input.author || 'Faculty Admin').trim(), now);

  return {
    id: Number(res.lastInsertRowid),
    mustawa: input.mustawa,
    title: input.title.trim(),
    body: input.body.trim(),
    author: (input.author || 'Faculty Admin').trim(),
    createdAt: now,
  };
}

export function deleteAnnouncement(id: number): boolean {
  const res = db.prepare('DELETE FROM announcements WHERE id = ?').run(id);
  return res.changes > 0;
}

export function promoteStudents(input: {
  sourceMustawa?: MustawaLevel;
  targetMustawa?: MustawaLevel;
  studentIds?: string[];
}): { promotedCount: number; destinationMustawa: MustawaLevel } {
  let promotedCount = 0;
  let destination: MustawaLevel = input.targetMustawa || 'Mustawa 2';

  const updateStmt = db.prepare('UPDATE students SET mustawa = ? WHERE id = ?');

  const tx = db.transaction(() => {
    if (input.studentIds && input.studentIds.length > 0) {
      const placeholders = input.studentIds.map(() => '?').join(',');
      const rows = db
        .prepare(`SELECT id, mustawa FROM students WHERE id IN (${placeholders})`)
        .all(...input.studentIds) as Array<{ id: string; mustawa: MustawaLevel }>;

      for (const r of rows) {
        const dest = input.targetMustawa || getNextMustawa(r.mustawa);
        destination = dest;
        if (dest !== r.mustawa) {
          updateStmt.run(dest, r.id);
          promotedCount++;
        }
      }
    } else if (input.sourceMustawa) {
      const dest = input.targetMustawa || getNextMustawa(input.sourceMustawa);
      destination = dest;
      if (dest !== input.sourceMustawa) {
        const res = db.prepare('UPDATE students SET mustawa = ? WHERE mustawa = ?').run(dest, input.sourceMustawa);
        promotedCount = res.changes;
      }
    }
  });

  tx();
  return { promotedCount, destinationMustawa: destination };
}

export function listStudyGuides(): StudyGuideRecord[] {
  const rows = db.prepare('SELECT * FROM study_guides ORDER BY id DESC LIMIT 20').all() as Array<{
    id: number;
    title: string;
    source_name: string;
    language: string;
    summary: string;
    key_concepts: string;
    quiz_json: string;
    created_at: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    sourceName: r.source_name,
    language: r.language,
    summary: r.summary,
    keyConcepts: JSON.parse(r.key_concepts || '[]') as string[],
    quiz: JSON.parse(r.quiz_json || '[]') as QuizQuestion[],
    createdAt: r.created_at,
  }));
}

export function saveStudyGuide(input: {
  title: string;
  sourceName: string;
  language: string;
  summary: string;
  keyConcepts: string[];
  quiz: QuizQuestion[];
}): StudyGuideRecord {
  const now = new Date().toISOString();
  const res = db
    .prepare(
      'INSERT INTO study_guides (title, source_name, language, summary, key_concepts, quiz_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .run(
      input.title,
      input.sourceName,
      input.language,
      input.summary,
      JSON.stringify(input.keyConcepts),
      JSON.stringify(input.quiz),
      now
    );

  return {
    id: Number(res.lastInsertRowid),
    ...input,
    createdAt: now,
  };
}

export function getDailyAttendanceBuckets(): DailyAttendanceBucket[] {
  return db
    .prepare(
      `SELECT a.date AS date,
              s.mustawa AS mustawa,
              SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS presentCount,
              SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS absentCount
       FROM attendance a
       JOIN students s ON s.id = a.student_id
       GROUP BY a.date, s.mustawa
       ORDER BY a.date ASC`
    )
    .all() as DailyAttendanceBucket[];
}

function seedSampleStudyGuideIfMissing() {
  const alreadySeeded = db
    .prepare('SELECT value FROM app_meta WHERE key = ?')
    .get('seed_sample_study_guide') as { value: string } | undefined;
  if (alreadySeeded) return;

  const existingCount = db
    .prepare('SELECT COUNT(*) AS count FROM study_guides')
    .get() as { count: number };

  if (existingCount.count === 0) {
    saveStudyGuide({
      title: 'مقدمة في علم الصرف والميزان الصرفي — Arabic Morphology Essentials',
      sourceName: 'Mustawa 2 — Arabic Syntax & Morphology.pdf',
      language: 'Arabic (Modern Standard Arabic)',
      summary:
        'يتناول علم الصرف بنية الكلمة العربية وأحوال أبنيتها غير الإعرابية من حيث الزيادة والتجريد، والإعلال والإبدال، والاشتقاق. ويُعد الميزان الصرفي (فـ ع ل) الأداة المنهجية الأولى لضبط حروف الكلمة الأصلية والزائدة ومعرفة حركاتها وسكناتها.\n\nيركّز المبحث الأول على تقسيم الأفعال إلى مجرد ومزيد؛ فالفعل الثلاثي المجرد يتكون من ثلاثة أصول فقط مثل (كَتَبَ، عَلِمَ، كَرُمَ)، بينما يُبنى المزيد بإضافة حرف أو أكثر من حروف الزيادة المجموعة في قولهم (سألتمونيها) لإفادة معانٍ جديدة كالتعدية والمشاركة والطلب.',
      keyConcepts: [
        'الميزان الصرفي (فَعَلَ): تقابل الفاء الحرف الأول الأصلي، والعين الحرف الثاني، واللام الحرف الثالث.',
        'الفرق بين المجرد والمزيد: المجرد ما كانت جميع حروفه أصلية، والمزيد ما دخلت عليه حروف زيادة لمعانٍ صرفية.',
        'حروف الزيادة العشرة تُجمع في عبارة: سألتمونيها.',
        'الإبدال والإعلال يعالجان تغيّر حروف العلة (ا، و، ي) لتخفيف النطق ومراعاة التجانس الصوتي.',
      ],
      quiz: [
        {
          question: 'ما هو الوزن الصرفي الصحيح لكلمة «اسْتَغْفَرَ»؟',
          options: ['افْتَعَلَ', 'اسْتَفْعَلَ', 'انْفَعَلَ', 'تَفَعَّلَ'],
          correctIndex: 1,
          explanation:
            'أصل الفعل هو «غَفَرَ» على وزن «فَعَلَ»، وقد زيدت عليه الألف والسين والتاء في أوله، فتُنزل كما هي في الميزان الصرفي ليصبح الوزن «اسْتَفْعَلَ».',
        },
        {
          question: 'كم عدد الحروف الأصلية في الفعل الثلاثي المجرد مثل «عَلِمَ»؟',
          options: ['حرفان', 'ثلاثة أحرف', 'أربعة أحرف', 'خمسة أحرف'],
          correctIndex: 1,
          explanation:
            'الثلاثي المجرد يتألف من ثلاثة أحرف أصلية لا يُستغنى عن أحدها في تكوين الجذر اللغوي.',
        },
        {
          question: 'أي من الآتي يمثل حروف الزيادة في اللغة العربية؟',
          options: ['أبجد هوز', 'سألتمونيها', 'حروف القلقلة', 'الأحرف المشبهة بالفعل'],
          correctIndex: 1,
          explanation:
            'جمع علماء الصرف حروف الزيادة العشرة في كلمة «سألتمونيها» لتسهيل حفظها واستحضارها عند الوزن الصرفي.',
        },
      ],
    });
  }

  db.prepare('INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)').run(
    'seed_sample_study_guide',
    '1'
  );
}
