import { motion } from 'framer-motion';
import { CheckCircle2, Timer, Clock, ListTodo, ArrowRight, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useTaskStore } from '../store/useTaskStore';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { useTimeBlockStore } from '../store/useTimeBlockStore';
import { useKanbanStore } from '../store/useKanbanStore';
import { useAppStore } from '../store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/shared/Card';


const CATEGORY_COLORS: Record<string, string> = {
  work: '#6B8FAC',
  health: '#52B788',
  learning: '#F4A261',
  personal: '#E76F51',
  admin: '#9CA3AF',
  none: '#9CA3AF',
};

export default function Dashboard() {
  const { userPrefs } = useAppStore();
  const { tasks } = useTaskStore();
  const { sessions } = usePomodoroStore();
  const { getBlocksByDate } = useTimeBlockStore();
  const { columns, cards } = useKanbanStore();

  const today = new Date().toISOString().split('T')[0];
  const todayBlocks = getBlocksByDate(today);

  const todaySessions = sessions.filter(
    (s) => s.startedAt.startsWith(today) && s.type === 'focus' && s.completed
  );
  const todayCompleted = tasks.filter(
    (t) => t.status === 'completed' && t.completedAt?.startsWith(today)
  );
  const todayPending = tasks.filter((t) => t.status === 'active');
  const todayFrog = tasks.find((t) => t.priority === 'frog' && t.source === 'eatthefrog' && t.status === 'active');
  const focusHours = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0) / 60;

  const kanbanSummary = columns.map((col) => ({
    ...col,
    count: cards.filter((c) => c.columnId === col.id).length,
  }));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const statsCards = [
    { label: "Pomodoros Today", value: todaySessions.length, icon: Timer, color: "text-accent", bg: "bg-accent/10" },
    { label: "Tasks Completed", value: todayCompleted.length, icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
    { label: "Focus Time", value: focusHours.toFixed(1) + 'h', icon: Clock, color: "text-primary", bg: "bg-primary/10" },
    { label: "Tasks Pending", value: todayPending.length, icon: ListTodo, color: "text-accent-warm", bg: "bg-accent-warm/10" },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h2 className="font-display text-3xl font-bold text-text-primary">
            {greeting}, {userPrefs.name}. 👋
          </h2>
          <p className="text-text-secondary mt-1">
            {format(new Date(), "EEEE, MMMM do, yyyy")} — here's your day at a glance.
          </p>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-text-secondary text-sm font-medium">{stat.label}</span>
                  <div className={`w-9 h-9 rounded-full ${stat.bg} flex items-center justify-center`}>
                    <stat.icon size={18} className={stat.color} />
                  </div>
                </div>
                <p className={`font-mono text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Frog */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="overflow-hidden h-full">
            <div className="bg-gradient-to-br from-accent to-accent-warm p-6 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🐸</span>
                <span className="text-white font-semibold font-display text-lg">Today's Frog</span>
              </div>
              {todayFrog ? (
                <>
                  <p className="text-white text-lg font-medium flex-1 leading-relaxed">{todayFrog.title}</p>
                  <Link
                    to="/eat-the-frog"
                    className="mt-4 text-white/80 hover:text-white text-sm flex items-center gap-1 self-start transition-colors"
                  >
                    View task <ArrowRight size={14} />
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-white/80 text-sm flex-1">No frog set yet. Set your most important task for the day.</p>
                  <Link
                    to="/eat-the-frog"
                    className="mt-4 bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-lg transition-colors self-start"
                  >
                    Set today's frog
                  </Link>
                </>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Time Blocks Preview */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Today's Schedule</CardTitle>
                <Link to="/time-blocking" className="text-primary text-sm hover:underline flex items-center gap-1">
                  View full <ArrowRight size={14} />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {todayBlocks.length > 0 ? (
                <div className="space-y-2">
                  {todayBlocks.slice(0, 4).map((block) => (
                    <div key={block.id} className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[block.category] || '#9CA3AF' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{block.title}</p>
                        <p className="text-xs text-text-muted">{block.startTime} – {block.endTime}</p>
                      </div>
                    </div>
                  ))}
                  {todayBlocks.length > 4 && (
                    <p className="text-xs text-text-muted pt-1">+{todayBlocks.length - 4} more blocks</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-text-muted text-sm">
                  <Clock size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No blocks scheduled.</p>
                  <Link to="/time-blocking" className="text-primary hover:underline mt-1 block">Plan your day →</Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Kanban Summary */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Kanban Status</CardTitle>
                <Link to="/kanban" className="text-primary text-sm hover:underline flex items-center gap-1">
                  Open board <ArrowRight size={14} />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {kanbanSummary.map((col) => (
                  <div key={col.id} className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">{col.title}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 bg-border rounded-full flex-1 w-16 lg:w-20">
                        <div
                          className="h-full bg-primary-light rounded-full transition-all"
                          style={{ width: `${Math.min((col.count / Math.max(cards.length, 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono font-medium text-text-primary w-4 text-right">{col.count}</span>
                    </div>
                  </div>
                ))}
                {cards.length === 0 && (
                  <div className="text-center py-4 text-text-muted text-sm">
                    <p>No cards yet.</p>
                    <Link to="/kanban" className="text-primary hover:underline">Add cards →</Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Capture */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Inbox size={20} className="text-primary flex-shrink-0" />
              <input
                placeholder="Quick capture anything on your mind... (Press Enter to add to GTD Inbox)"
                className="flex-1 bg-transparent outline-none text-text-primary placeholder:text-text-muted text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                    // TODO: wire to GTD inbox in Phase 3
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
