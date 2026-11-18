import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Megaphone } from 'lucide-react';
import type { Translations } from '../i18n/translations';
import type { AnnouncementRecord } from '../types/academic';

interface HeaderNotificationsBellProps {
  t: Translations;
  relevantAnnouncements: AnnouncementRecord[];
  readIds: number[];
  onMarkOneRead: (id: number) => void;
  onMarkAllRead: () => void;
  onOpenNoticesBoard: () => void;
}

export function HeaderNotificationsBell({
  t,
  relevantAnnouncements,
  readIds,
  onMarkOneRead,
  onMarkAllRead,
  onOpenNoticesBoard,
}: HeaderNotificationsBellProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const readSet = new Set(readIds);
  const unreadCount = relevantAnnouncements.filter((a) => !readSet.has(a.id)).length;

  useEffect(() => {
    if (!open) return;
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={
          unreadCount > 0
            ? `${t.notificationsLabel} (${unreadCount} ${t.unreadCountSuffix})`
            : t.notificationsLabel
        }
        className="relative inline-flex items-center justify-center w-9 h-9 text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span
            data-testid="unread-announcements-count"
            className="absolute -top-1.5 -end-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white font-mono tabular-nums text-[10px] font-bold flex items-center justify-center leading-none shadow-sm"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t.notificationsLabel}
          className="absolute end-0 mt-2 w-80 sm:w-96 bg-white border border-stone-200 rounded-lg shadow-lg z-50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between gap-2 bg-stone-50/70">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-display text-sm font-semibold text-stone-900 truncate">
                {t.notificationsLabel}
              </span>
              <span className="text-xs font-mono tabular-nums text-stone-500 whitespace-nowrap">
                {unreadCount > 0 ? `(${unreadCount} ${t.unreadCountSuffix})` : ''}
              </span>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-900 hover:text-emerald-700 whitespace-nowrap shrink-0"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{t.markAllRead}</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
            {relevantAnnouncements.length === 0 ? (
              <div className="px-4 py-8 text-center space-y-1.5">
                <Megaphone className="w-5 h-5 text-stone-300 mx-auto" />
                <p className="text-xs text-stone-500">{t.noAnnouncements}</p>
              </div>
            ) : (
              relevantAnnouncements.slice(0, 10).map((ann) => {
                const isUnread = !readSet.has(ann.id);
                const isArabicText = /[\u0600-\u06FF]/.test(`${ann.title} ${ann.body}`);
                return (
                  <button
                    key={ann.id}
                    type="button"
                    onClick={() => {
                      if (isUnread) {
                        onMarkOneRead(ann.id);
                      }
                    }}
                    className={`w-full text-start px-4 py-3 transition-colors block ${
                      isUnread
                        ? 'bg-emerald-50/60 hover:bg-emerald-50'
                        : 'bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] text-stone-500 mb-1">
                      <span className="font-semibold text-emerald-900">{ann.mustawa}</span>
                      <span className="font-mono tabular-nums">{ann.createdAt.slice(0, 10)}</span>
                    </div>
                    <p
                      dir={isArabicText ? 'rtl' : undefined}
                      className={`text-xs leading-snug ${
                        isUnread ? 'font-semibold text-stone-900' : 'font-medium text-stone-700'
                      }`}
                    >
                      {ann.title}
                    </p>
                    <p
                      dir={isArabicText ? 'rtl' : undefined}
                      className="text-xs text-stone-500 line-clamp-2 mt-0.5"
                    >
                      {ann.body}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-stone-200 bg-stone-50/70 flex items-center justify-between gap-2">
            <span className="text-[11px] text-stone-500 truncate">
              {unreadCount === 0 ? t.allCaughtUp : `${unreadCount} ${t.unreadCountSuffix}`}
            </span>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenNoticesBoard();
              }}
              className="text-xs font-medium text-emerald-900 hover:text-emerald-700 whitespace-nowrap shrink-0"
            >
              {t.viewAllNotices}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
