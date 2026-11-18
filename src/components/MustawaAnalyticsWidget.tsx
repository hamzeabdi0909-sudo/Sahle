import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { Translations } from '../i18n/translations';
import type { DailyAttendanceBucket, StudentRecord } from '../types/academic';
import {
  aggregateAttendanceTrends,
  aggregateMustawaPerformance,
} from '../utils/analyticsLogic';

interface MustawaAnalyticsWidgetProps {
  t: Translations;
  students: StudentRecord[];
  attendanceBuckets: DailyAttendanceBucket[];
  selectedMustawa: string;
  onSelectMustawa: (m: string) => void;
}

export function MustawaAnalyticsWidget({
  t,
  students,
  attendanceBuckets,
  selectedMustawa,
  onSelectMustawa,
}: MustawaAnalyticsWidgetProps) {
  const trendData = useMemo(
    () => aggregateAttendanceTrends(attendanceBuckets, selectedMustawa),
    [attendanceBuckets, selectedMustawa]
  );

  const mustawaData = useMemo(
    () => aggregateMustawaPerformance(students),
    [students]
  );

  const activeScopeLabel =
    selectedMustawa === 'ALL' ? t.allMustawas : selectedMustawa;

  return (
    <section
      aria-label="Administrative Analytics"
      className="no-print grid grid-cols-1 xl:grid-cols-2 gap-6"
    >
      {/* Left Chart: Attendance Rate Trend Over Time */}
      <div className="bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] p-5 sm:p-6 min-w-0 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <h3 className="font-display text-base font-semibold text-stone-900">
              {t.analyticsTrendTitle}
            </h3>
            <p className="text-xs text-stone-500">
              {t.analyticsTrendDesc} · <span className="font-medium text-emerald-900">{activeScopeLabel}</span>
            </p>
          </div>
          {trendData.length > 0 && (
            <span className="font-mono tabular-nums text-sm font-bold text-emerald-900 whitespace-nowrap shrink-0">
              {trendData[trendData.length - 1].attendanceRate}%
            </span>
          )}
        </div>

        <div className="h-[240px] w-full min-w-0" dir="ltr">
          {trendData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-stone-500 border border-dashed border-stone-200 rounded-md">
              {t.noChartData}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 24, left: -12, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="emeraldTrendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#064e3b" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#064e3b" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis
                  dataKey="shortDate"
                  padding={{ left: 10, right: 10 }}
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
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const pt = payload[0].payload as (typeof trendData)[number];
                    return (
                      <div className="bg-white border border-stone-200 rounded-md shadow-md px-3 py-2 text-xs space-y-1">
                        <p className="font-mono font-semibold text-stone-900">{pt.date}</p>
                        <p className="text-emerald-900 font-medium font-mono tabular-nums">
                          {t.legendAttendanceRate}: {pt.attendanceRate}%
                        </p>
                        <p className="text-stone-500 font-mono tabular-nums">
                          {pt.presentCount} {t.presentCount} · {pt.absentCount} {t.absentCount}
                        </p>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="attendanceRate"
                  name={t.legendAttendanceRate}
                  stroke="#064e3b"
                  strokeWidth={2.25}
                  fill="url(#emeraldTrendFill)"
                  dot={{ r: 3.5, fill: '#064e3b', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: '#064e3b' }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Right Chart: Exam Performance & Attendance Across Mustawa 1 - 8 */}
      <div className="bg-white border border-stone-200 rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.04)] p-5 sm:p-6 min-w-0 flex flex-col gap-4">
        <div className="space-y-1">
          <h3 className="font-display text-base font-semibold text-stone-900">
            {t.analyticsMustawaTitle}
          </h3>
          <p className="text-xs text-stone-500">{t.analyticsMustawaDesc}</p>
        </div>

        <div className="h-[240px] w-full min-w-0" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mustawaData}
              margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
              barGap={4}
              onClick={(state) => {
                const label = state?.activeLabel;
                if (typeof label === 'string') {
                  const found = mustawaData.find((d) => d.shortLabel === label);
                  if (found) {
                    onSelectMustawa(
                      selectedMustawa === found.mustawa ? 'ALL' : found.mustawa
                    );
                  }
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
              <XAxis
                dataKey="shortLabel"
                tick={{ fill: '#57534e', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
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
              <Tooltip
                cursor={{ fill: '#f5f5f4' }}
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const pt = payload[0].payload as (typeof mustawaData)[number];
                  return (
                    <div className="bg-white border border-stone-200 rounded-md shadow-md px-3 py-2 text-xs space-y-1">
                      <p className="font-semibold text-stone-900">
                        {pt.mustawa} ({pt.studentCount})
                      </p>
                      <p className="text-emerald-900 font-mono tabular-nums">
                        {t.legendAttendanceRate}: {pt.attendanceRate}%
                      </p>
                      <p className="text-amber-700 font-mono tabular-nums">
                        {t.legendAvgNetScore}: {pt.avgNetScore}%
                      </p>
                    </div>
                  );
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="square"
                iconSize={9}
                wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
              />
              <Bar
                dataKey="attendanceRate"
                name={t.legendAttendanceRate}
                fill="#065f46"
                radius={[3, 3, 0, 0]}
                maxBarSize={20}
                className="cursor-pointer"
                isAnimationActive={false}
              />
              <Bar
                dataKey="avgNetScore"
                name={t.legendAvgNetScore}
                fill="#d97706"
                radius={[3, 3, 0, 0]}
                maxBarSize={20}
                className="cursor-pointer"
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
