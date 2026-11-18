import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import type { Translations } from '../i18n/translations';
import type { AttendanceRecord } from '../types/academic';
import {
  aggregateStudentLastSessions,
  formatShortChartDate,
  type StudentSessionTrendPoint,
} from '../utils/analyticsLogic';

interface StudentAttendanceChartProps {
  t: Translations;
  attendance: AttendanceRecord[];
}

interface ChartPoint extends StudentSessionTrendPoint {
  axisKey: string;
}

export function StudentAttendanceChart({ t, attendance }: StudentAttendanceChartProps) {
  const chartData: ChartPoint[] = useMemo(() => {
    const points = aggregateStudentLastSessions(attendance, 10);
    return points.map((p) => ({
      ...p,
      axisKey: `${p.date}#${p.sessionIndex}`,
    }));
  }, [attendance]);

  const latestPoint = chartData.length > 0 ? chartData[chartData.length - 1] : null;
  const windowRate = latestPoint ? latestPoint.attendanceRate : 0;
  const rateColor =
    windowRate >= 75
      ? 'text-emerald-800'
      : windowRate >= 50
      ? 'text-amber-700'
      : 'text-rose-700';

  return (
    <section
      aria-label={t.studentTrendTitle}
      className="no-print bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] p-6 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <h3 className="font-display text-base font-semibold text-stone-900">
            {t.studentTrendTitle}
          </h3>
          <p className="text-xs text-stone-500">{t.studentTrendDesc}</p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-3 text-xs text-stone-600">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-900 inline-block" />
              <span>{t.presentLabel}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-700 inline-block" />
              <span>{t.absentLabel}</span>
            </span>
          </div>

          {latestPoint && (
            <div className="text-end border-s border-stone-200 ps-4">
              <p className={`font-mono tabular-nums text-lg font-bold leading-none ${rateColor}`}>
                {windowRate}%
              </p>
              <p className="text-[11px] font-mono tabular-nums text-stone-500 mt-1">
                {latestPoint.cumulativePresent}/{chartData.length} {t.sessionsWindowSuffix}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="h-[220px] w-full min-w-0" dir="ltr">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-stone-500 border border-dashed border-stone-200 rounded-md">
            {t.noChartData}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 12, right: 24, left: -12, bottom: 0 }}
            >
              <defs>
                <linearGradient id="studentAttendanceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#064e3b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#064e3b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
              <XAxis
                dataKey="axisKey"
                padding={{ left: 12, right: 12 }}
                tickFormatter={(val) => formatShortChartDate(String(val).split('#')[0])}
                tick={{ fill: '#78716c', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={{ stroke: '#d6d3d1' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: '#78716c', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <ReferenceLine
                y={50}
                stroke="#be123c"
                strokeDasharray="4 4"
                strokeOpacity={0.35}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const pt = payload[0].payload as ChartPoint;
                  const isPresent = pt.status === 'present';
                  return (
                    <div className="bg-white border border-stone-200 rounded-md shadow-md px-3 py-2 text-xs space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono font-semibold text-stone-900">
                          {pt.date}
                        </span>
                        <span
                          className={`font-medium ${
                            isPresent ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isPresent ? t.presentLabel : t.absentLabel}
                        </span>
                      </div>
                      <p className="text-stone-500">{pt.course}</p>
                      <p className="font-mono tabular-nums font-medium text-emerald-900">
                        {t.rollingRateLabel}: {pt.attendanceRate}% ({pt.cumulativePresent}/
                        {pt.sessionIndex})
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="attendanceRate"
                name={t.rollingRateLabel}
                stroke="#064e3b"
                strokeWidth={2.25}
                fill="url(#studentAttendanceFill)"
                isAnimationActive={false}
                dot={(props: { cx?: number; cy?: number; payload?: ChartPoint; index?: number }) => {
                  const { cx, cy, payload, index } = props;
                  if (cx === undefined || cy === undefined || !payload) {
                    return <g key={`empty-${index}`} />;
                  }
                  const fill = payload.status === 'present' ? '#064e3b' : '#be123c';
                  return (
                    <circle
                      key={`dot-${payload.axisKey}`}
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={fill}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 5.5, fill: '#064e3b', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
