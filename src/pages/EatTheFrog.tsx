import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, Circle } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import type { TaskPriority } from '../types';
import { Card, CardContent } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Badge } from '../components/shared/Badge';

type FilterType = 'all' | 'active' | 'completed';

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; badge: React.ComponentProps<typeof Badge>['variant']; emoji: string }> = {
  frog:   { label: 'Frog',   badge: 'frog',   emoji: '🐸' },
  high:   { label: 'High',   badge: 'high',   emoji: '🔴' },
  medium: { label: 'Medium', badge: 'medium', emoji: '🟡' },
  low:    { label: 'Low',    badge: 'low',    emoji: '🟢' },
};

export default function EatTheFrog() {
  const { tasks, addTask, completeTask, deleteTask } = useTaskStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [filter, setFilter] = useState<FilterType>('all');

  const frogTasks = tasks.filter((t) => t.source === 'eatthefrog');
  const todayFrog = frogTasks.find((t) => t.priority === 'frog' && t.status === 'active');
  const filteredTasks = frogTasks.filter((t) => {
    if (filter === 'active') return t.status === 'active';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  const handleAddTask = () => {
    const title = newTaskTitle.trim();
    if (!title) return;

    // If adding a frog, demote any existing frog to high
    if (newTaskPriority === 'frog') {
      frogTasks
        .filter((t) => t.priority === 'frog' && t.status === 'active')
        .forEach((t) => useTaskStore.getState().updateTask(t.id, { priority: 'high' }));
    }

    addTask({
      title,
      priority: newTaskPriority,
      status: 'active',
      source: 'eatthefrog',
      dueDate: new Date().toISOString().split('T')[0],
    });
    setNewTaskTitle('');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* THE FROG */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className={`rounded-2xl p-6 ${todayFrog
          ? 'bg-gradient-to-br from-accent to-accent-warm'
          : 'bg-surface border-2 border-dashed border-border'}`}>
          <div className="flex items-start gap-4">
            <span className="text-4xl">🐸</span>
            <div className="flex-1">
              {todayFrog ? (
                <>
                  <Badge variant="secondary" className="mb-2 bg-white/20 text-white border-none text-xs">TODAY'S #1 PRIORITY</Badge>
                  <h2 className="text-white font-display text-2xl font-bold leading-tight">{todayFrog.title}</h2>
                  <p className="text-white/70 text-sm mt-1">Eat this frog first — tackle it before anything else.</p>
                  <div className="flex gap-3 mt-4">
                    <Button
                      size="sm"
                      className="bg-white text-accent hover:bg-white/90"
                      onClick={() => completeTask(todayFrog.id)}
                    >
                      <Check size={16} className="mr-1" /> Done!
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-text-primary font-display text-xl font-semibold">What must you do today?</h2>
                  <p className="text-text-secondary text-sm mt-1">Add a task with 🐸 Frog priority to set your #1 goal.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Add Task */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex gap-3">
            <Input
              placeholder="Add a new task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              className="flex-1"
            />
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
              className="border border-border rounded-lg px-3 text-sm bg-surface text-text-primary focus:outline-none focus:ring-2 focus:border-primary"
            >
              {(Object.entries(PRIORITY_CONFIG) as [TaskPriority, typeof PRIORITY_CONFIG[TaskPriority]][]).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.emoji} {cfg.label}</option>
              ))}
            </select>
            <Button onClick={handleAddTask}><Plus size={18} /></Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-surface-alt rounded-lg p-1">
          {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                filter === f ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="text-sm text-text-muted">{filteredTasks.length} tasks</span>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredTasks
            .sort((a, b) => {
              const order: TaskPriority[] = ['frog', 'high', 'medium', 'low'];
              return order.indexOf(a.priority) - order.indexOf(b.priority);
            })
            .map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                className={`flex items-center gap-4 p-4 rounded-xl border border-border bg-surface shadow-sm hover:shadow-md transition-shadow ${
                  task.status === 'completed' ? 'opacity-60' : ''
                }`}
              >
                <button
                  onClick={() => task.status === 'active' && completeTask(task.id)}
                  className="flex-shrink-0"
                  disabled={task.status === 'completed'}
                >
                  {task.status === 'completed' ? (
                    <CheckCircle size={22} className="text-success" />
                  ) : (
                    <Circle size={22} className="text-border hover:text-primary transition-colors" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-text-primary ${task.status === 'completed' ? 'line-through text-text-muted' : ''}`}>
                    {task.title}
                  </p>
                </div>
                <Badge variant={PRIORITY_CONFIG[task.priority].badge}>
                  {PRIORITY_CONFIG[task.priority].emoji} {PRIORITY_CONFIG[task.priority].label}
                </Badge>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-text-muted hover:text-danger transition-colors flex-shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
        </AnimatePresence>
        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            <span className="text-5xl block mb-3">🎉</span>
            <p className="font-medium">{filter === 'completed' ? 'No completed tasks yet.' : 'No tasks here!'}</p>
            <p className="text-sm mt-1">Add your most important task above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline CheckCircle since we need the filled version
function CheckCircle({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="22 4 12 14.01 9 11.01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
