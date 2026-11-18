import type { MustawaLevel } from '../utils/academicLogic';

export interface StudentRecord {
  id: string;
  fullName: string;
  mustawa: MustawaLevel;
  email: string;
  phone: string;
  createdAt: string;
  missedClasses: number;
  totalSessions: number;
  deductionPercent: number;
  standing: 'good' | 'warning' | 'critical' | 'barred';
  averageNetScore: number | null;
  lowestNetScore?: number | null;
  lowestSubject?: string | null;
}

export interface AttendanceRecord {
  id: number;
  studentId: string;
  date: string;
  course: string;
  status: 'present' | 'absent';
  note: string;
}

export interface ExamGradeRecord {
  id?: number;
  studentId: string;
  studentName?: string;
  mustawa?: MustawaLevel;
  subject: string;
  midterm: number;
  coursework: number;
  finalExam: number;
  missedClasses: number;
  grossScore: number;
  deductionPercent: number;
  deductedPoints: number;
  netScore: number;
  letterGrade: string;
  passed: boolean;
  updatedAt?: string;
}

export interface AnnouncementRecord {
  id: number;
  mustawa: MustawaLevel;
  title: string;
  body: string;
  author: string;
  createdAt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface StudyGuideRecord {
  id: number;
  title: string;
  sourceName: string;
  language: string;
  summary: string;
  keyConcepts: string[];
  quiz: QuizQuestion[];
  createdAt: string;
}

export interface StudentLookupPayload {
  student: StudentRecord;
  attendance: AttendanceRecord[];
  exams: ExamGradeRecord[];
  announcements: AnnouncementRecord[];
}

export interface DailyAttendanceBucket {
  date: string;
  mustawa: MustawaLevel;
  presentCount: number;
  absentCount: number;
}
