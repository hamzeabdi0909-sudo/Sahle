import type { AnnouncementRecord } from '../types/academic';
import type { UserRole } from './api';

export function getNotificationStorageKey(role: UserRole, studentId?: string): string {
  if (role === 'admin') return 'mustawa_read_announcements_admin';
  return `mustawa_read_announcements_student_${studentId || 'unknown'}`;
}

export function getRelevantAnnouncements(
  announcements: AnnouncementRecord[],
  role: UserRole,
  studentMustawa?: string
): AnnouncementRecord[] {
  if (role === 'admin') {
    return announcements;
  }
  if (!studentMustawa || studentMustawa === 'ALL') {
    return announcements;
  }
  return announcements.filter((a) => a.mustawa === studentMustawa);
}

export function getUnreadAnnouncements(
  relevant: AnnouncementRecord[],
  readIds: number[]
): AnnouncementRecord[] {
  const readSet = new Set(readIds);
  return relevant.filter((a) => !readSet.has(a.id));
}

export function mergeReadAnnouncementIds(
  existing: number[],
  newlyRead: number[]
): number[] {
  const set = new Set(existing);
  for (const id of newlyRead) {
    set.add(id);
  }
  return Array.from(set);
}

export function readStoredReadIds(storageKey: string): number[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((n): n is number => typeof n === 'number' && Number.isFinite(n));
  } catch {
    return [];
  }
}

export function writeStoredReadIds(storageKey: string, ids: number[]): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(storageKey, JSON.stringify(ids));
  } catch {
    // Ignore storage quota errors
  }
}
