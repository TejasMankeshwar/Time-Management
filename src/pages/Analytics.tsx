import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useTaskStore } from '../store/useTaskStore';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { useTimeBlockStore } from '../store/useTimeBlockStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/shared/Card';
import { subDays, format, eachDayOfInterval } from 'date-fns';

type DateRange = '7d' | '30d';

const CATEGORY_COLORS: Record<string, string> = {
  work: '#6B8FAC',
  health: '#52B788',
  learning: '#F4A261',
  personal: '#E76F51',
  admin: '#9CA3AF',
};

export default function Analytics() {
  const [range, setRange] = useState<DateRange>('7d');
  const { tasks } = useTaskStore();
  const { sessions } = usePomodoroStore();
  const { blocks } = useTimeBlockStore();

  const days = range === '7d' ? 7 : 30;
  const interval = eachDayOfInterval({ start: subDays(new Date(), days - 1), end: new Date() });

  // Pomodoros per day
  const pomodoroData = interval.map((day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const count = sessions.filter((s) => s.startedAt.startsWith(dayStr) && s.type === 'focus' && s.completed).length;
    return { date: format(day, 'MM/dd'), count };
  });

  // Tasks completed per day
  const tasksData = interval.map((day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const count = tasks.filter((t) => t.completedAt?.startsWith(dayStr)).length;
    return { date: format(day, 'MM/dd'), count };
  });

  // Time distribution by category
  const categoryData = Object.entries(CATEGORY_COLORS).map(([cat, color]) => {
    const catBlocks = blocks.filter((b) => b.category === cat);
    const totalMins = catBlocks.reduce((sum, b) => {
      const start = b.startTime.split(':').map(Number);
      const end = b.endTime.split(':').map(Number);
      return sum + (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
    }, 0);
    return { name: cat.charAt(0).toUpperCase() + cat.slice(1), value: Math.round(totalMins / 60 * 10) / 10, color };
  }).filter((c) => c.value > 0);

  // Summary stats
  const totalPomodoros = sessions.filter((s) => s.type === 'focus' && s.completed).length;
  const totalFocusHours = (sessions.filter(s => s.type === 'focus' && s.completed).reduce((sum, s) => sum + s.durationMinutes, 0) / 60).toFixed(1);
  const totalTasksDone = tasks.filter((t) => t.status === 'completed').length;
  const avgPomodoros = (totalPomodoros / Math.max(days, 1)).toFixed(1);

  const summaryStats = [
    { label: 'Total Focus Hours', value: totalFocusHours + 'h', color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Total Pomodoros', value: totalPomodoros, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Tasks Completed', value: totalTasksDone, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Avg Pomodoros/Day', value: avgPomodoros, color: 'text-accent-warm', bg: 'bg-accent-warm/10' },
  ];

  const handleExportCSV = () => {
    const rows = [
      ['Date', 'Pomodoros', 'Tasks Completed'],
      ...interval.map((day) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const pomos = sessions.filter((s) => s.startedAt.startsWith(dayStr) && s.type === 'focus' && s.completed).length;
        const done = tasks.filter((t) => t.completedAt?.startsWith(dayStr)).length;
        return [dayStr, pomos, done];
      }),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timeflow-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Analytics</h2>
          <p className="text-text-secondary text-sm mt-0.5">Your productivity trends at a glance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-surface-alt rounded-lg p-1 border border-border">
            {(['7d', '30d'] as DateRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${range === r ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary'}`}
              >
                {r === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
          <button
            onClick={handleExportCSV}
            className="text-sm text-primary hover:underline font-medium"
          >
            Export CSV ↓
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <CardContent className="pt-5 pb-4">
                <p className="text-text-muted text-xs font-medium uppercase tracking-wide mb-1">{stat.label}</p>
                <p className={`font-mono text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">🍅 Pomodoros per Day</CardTitle>
          </CardHeader>
          <CardContent>
            {pomodoroData.some((d) => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={pomodoroData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#E76F51" radius={[4, 4, 0, 0]} name="Pomodoros" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-text-muted text-sm">No data yet.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">✅ Tasks Completed per Day</CardTitle>
          </CardHeader>
          <CardContent>
            {tasksData.some((d) => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={tasksData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="count" stroke="#2D6A4F" strokeWidth={2} dot={{ r: 3 }} name="Tasks Done" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-text-muted text-sm">No data yet.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">📅 Time Distribution by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                      {categoryData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}h`} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {categoryData.map((c) => (
                    <div key={c.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="text-text-secondary">{c.name}</span>
                      <span className="text-text-primary font-medium ml-auto">{c.value}h</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-text-muted text-sm">
                <div className="text-center">
                  <p>No time blocks recorded yet.</p>
                  <p className="text-xs mt-1">Add time blocks to see distribution.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">📊 Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (() => {
              const strategyData = [
                { name: 'Eat Frog', count: tasks.filter(t => t.source === 'eatthefrog').length, color: '#E76F51' },
                { name: 'Kanban', count: tasks.filter(t => t.source === 'kanban').length, color: '#52B788' },
                { name: 'GTD', count: tasks.filter(t => t.source === 'gtd').length, color: '#2D6A4F' },
                { name: 'RPM', count: tasks.filter(t => t.source === 'rpm').length, color: '#9061F9' },
                { name: 'Pickle Jar', count: tasks.filter(t => t.source === 'picklejar').length, color: '#F4A261' },
              ].filter(d => d.count > 0);

              return strategyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={strategyData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" width={60} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="count" name="Tasks" radius={[0, 4, 4, 0]}>
                      {strategyData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-text-muted text-sm">No tasks yet.</div>
              );
            })() : (
              <div className="h-48 flex items-center justify-center text-text-muted text-sm">No tasks yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
