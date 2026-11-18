import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getNotificationStorageKey,
  getRelevantAnnouncements,
  getUnreadAnnouncements,
  mergeReadAnnouncementIds,
} from './announcementNotifications';
import type { AnnouncementRecord } from '../types/academic';

const SAMPLE_ANNOUNCEMENTS: AnnouncementRecord[] = [
  {
    id: 1,
    mustawa: 'Mustawa 1',
    title: 'Orientation',
    body: 'Welcome',
    author: 'Admin',
    createdAt: '2026-11-10',
  },
  {
    id: 2,
    mustawa: 'Mustawa 2',
    title: 'Lab Midterm',
    body: 'Room 204',
    author: 'Admin',
    createdAt: '2026-11-12',
  },
  {
    id: 3,
    mustawa: 'Mustawa 2',
    title: 'Extra Study',
    body: 'Friday 10am',
    author: 'Admin',
    createdAt: '2026-11-15',
  },
];

test('getRelevantAnnouncements filters by Mustawa for students and returns all for admin', () => {
  assert.equal(getRelevantAnnouncements(SAMPLE_ANNOUNCEMENTS, 'admin').length, 3);
  const stuNotices = getRelevantAnnouncements(SAMPLE_ANNOUNCEMENTS, 'student', 'Mustawa 2');
  assert.deepEqual(
    stuNotices.map((a) => a.id),
    [2, 3]
  );
});

test('getUnreadAnnouncements excludes read announcement IDs', () => {
  const stuNotices = getRelevantAnnouncements(SAMPLE_ANNOUNCEMENTS, 'student', 'Mustawa 2');
  const unread = getUnreadAnnouncements(stuNotices, [2]);
  assert.deepEqual(
    unread.map((a) => a.id),
    [3]
  );
});

test('mergeReadAnnouncementIds deduplicates IDs cleanly', () => {
  assert.deepEqual(mergeReadAnnouncementIds([1, 2], [2, 3]), [1, 2, 3]);
});

test('getNotificationStorageKey scopes read state per role and student ID', () => {
  assert.equal(getNotificationStorageKey('admin'), 'mustawa_read_announcements_admin');
  assert.equal(getNotificationStorageKey('student', '13'), 'mustawa_read_announcements_student_13');
});
