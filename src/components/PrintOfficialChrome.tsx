import type { Translations } from '../i18n/translations';

interface PrintOfficialHeaderProps {
  t: Translations;
  reportTitle: string;
  metadataItems: string[];
}

export function PrintOfficialHeader({
  t,
  reportTitle,
  metadataItems,
}: PrintOfficialHeaderProps) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="print-only border-b-2 border-stone-900 pb-4 mb-5">
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wide text-stone-600">
            {t.officialDocBanner}
          </p>
          <h1 className="font-display text-2xl font-bold text-stone-900">
            {reportTitle}
          </h1>
        </div>
        <div className="text-end text-xs font-mono text-stone-600 shrink-0">
          <p>{t.printedOn}: {today}</p>
        </div>
      </div>
      {metadataItems.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-700 font-medium">
          {metadataItems.map((item, idx) => (
            <span key={idx} className="inline-flex items-center gap-2">
              {idx > 0 && <span aria-hidden="true">·</span>}
              <span>{item}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface PrintSignatureFooterProps {
  t: Translations;
}

export function PrintSignatureFooter({ t }: PrintSignatureFooterProps) {
  return (
    <div className="print-only mt-10 pt-6 border-t border-stone-300">
      <div className="grid grid-cols-3 gap-8 text-xs text-stone-700">
        <div className="space-y-6">
          <p className="font-medium">{t.instructorSignature}</p>
          <div className="border-b border-stone-400 h-5" />
        </div>
        <div className="space-y-6">
          <p className="font-medium">{t.registrarSignature}</p>
          <div className="border-b border-stone-400 h-5" />
        </div>
        <div className="space-y-6">
          <p className="font-medium">{t.officialStampDate}</p>
          <div className="border-b border-stone-400 h-5" />
        </div>
      </div>
    </div>
  );
}
