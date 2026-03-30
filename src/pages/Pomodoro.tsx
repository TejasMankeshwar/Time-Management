import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { useTaskStore } from '../store/useTaskStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Badge } from '../components/shared/Badge';
import { Modal } from '../components/shared/Modal';
import { Input } from '../components/shared/Input';
import { format } from 'date-fns';
import type { PomodoroSession } from '../types';

type TimerState = 'idle' | 'running' | 'paused' | 'break' | 'longBreak';



function ProgressRing({
  progress,
  size = 220,
  stroke = 12,
  color,
  isRunning,
}: {
  progress: number;
  size?: number;
  stroke?: number;
  color: string;
  isRunning: boolean;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="var(--color-border)"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        animate={isRunning ? { filter: ['drop-shadow(0 0 4px ' + color + ')', 'drop-shadow(0 0 8px ' + color + ')', 'drop-shadow(0 0 4px ' + color + ')'] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </svg>
  );
}

export default function Pomodoro() {
  const { sessions, settings, addSession, updateSettings } = usePomodoroStore();
  const { tasks } = useTaskStore();
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeLeft, setTimeLeft] = useState(settings.focusDuration * 60);
  const [sessionType, setSessionType] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const startTimeRef = useRef<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter((s) => s.startedAt.startsWith(today) && s.type === 'focus' && s.completed);
  const activeTasks = tasks.filter((t) => t.status === 'active');

  const totalSeconds = (() => {
    if (sessionType === 'focus') return settings.focusDuration * 60;
    if (sessionType === 'shortBreak') return settings.shortBreak * 60;
    return settings.longBreak * 60;
  })();
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const ringColor = (() => {
    if (sessionType === 'focus') return '#2D6A4F';
    if (sessionType === 'shortBreak') return '#F4A261';
    return '#52B788';
  })();

  const clearTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleStart = () => {
    startTimeRef.current = new Date();
    setTimerState('running');
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePause = () => {
    clearTimer();
    setTimerState('paused');
  };

  const handleResume = () => {
    setTimerState('running');
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleReset = () => {
    clearTimer();
    setTimerState('idle');
    setTimeLeft(
      sessionType === 'focus'
        ? settings.focusDuration * 60
        : sessionType === 'shortBreak'
        ? settings.shortBreak * 60
        : settings.longBreak * 60
    );
  };

  const handleComplete = () => {
    const session: PomodoroSession = {
      id: crypto.randomUUID(),
      type: sessionType,
      durationMinutes: sessionType === 'focus' ? settings.focusDuration : sessionType === 'shortBreak' ? settings.shortBreak : settings.longBreak,
      startedAt: startTimeRef.current?.toISOString() || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      taskId: selectedTaskId || undefined,
      completed: true,
    };
    addSession(session);
    if (sessionType === 'focus') {
      setPomodoroCount((c) => c + 1);
    }
    setTimerState('idle');
    // Auto-switch
    if (sessionType === 'focus') {
      const newCount = pomodoroCount + 1;
      const nextType = newCount % 4 === 0 ? 'longBreak' : 'shortBreak';
      setSessionType(nextType);
      setTimeLeft(nextType === 'longBreak' ? settings.longBreak * 60 : settings.shortBreak * 60);
    } else {
      setSessionType('focus');
      setTimeLeft(settings.focusDuration * 60);
    }
  };

  const switchSession = (type: 'focus' | 'shortBreak' | 'longBreak') => {
    clearTimer();
    setTimerState('idle');
    setSessionType(type);
    setTimeLeft(
      type === 'focus'
        ? settings.focusDuration * 60
        : type === 'shortBreak'
        ? settings.shortBreak * 60
        : settings.longBreak * 60
    );
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const goalProgress = (todaySessions.length / settings.dailyGoal) * 100;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Session switcher */}
      <div className="flex gap-2 justify-center">
        {([['focus', 'Focus'], ['shortBreak', 'Short Break'], ['longBreak', 'Long Break']] as const).map(([type, label]) => (
          <button
            key={type}
            onClick={() => switchSession(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              sessionType === type
                ? 'bg-primary text-white shadow-md'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-alt'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Timer Card */}
      <Card className="overflow-hidden">
        <CardContent className="py-10 flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            <ProgressRing
              progress={progress}
              size={260}
              stroke={14}
              color={ringColor}
              isRunning={timerState === 'running'}
            />
            <div className="absolute flex flex-col items-center">
              <span className="font-mono text-6xl font-bold text-text-primary tracking-tight">
                {formatTime(timeLeft)}
              </span>
              <span className="text-text-muted text-sm mt-1 capitalize">
                {sessionType === 'focus' ? '🍅 Focus' : sessionType === 'shortBreak' ? '☕ Short Break' : '🌿 Long Break'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <RotateCcw size={18} />
            </Button>
            {timerState === 'idle' && (
              <Button size="lg" onClick={handleStart} className="min-w-32">
                <Play size={18} className="mr-2" /> Start
              </Button>
            )}
            {timerState === 'running' && (
              <Button size="lg" onClick={handlePause} className="min-w-32">
                <Pause size={18} className="mr-2" /> Pause
              </Button>
            )}
            {timerState === 'paused' && (
              <Button size="lg" onClick={handleResume} className="min-w-32">
                <Play size={18} className="mr-2" /> Resume
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
              <Settings size={18} />
            </Button>
          </div>

          {/* Pomodoro dots */}
          <div className="flex items-center gap-2">
            {Array.from({ length: settings.dailyGoal }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-colors text-sm flex items-center justify-center ${
                  i < todaySessions.length ? 'bg-accent text-white' : 'bg-border'
                }`}
              >
                {i < todaySessions.length ? '🍅' : ''}
              </div>
            ))}
          </div>

          {/* Task selector */}
          <div className="w-full max-w-sm">
            <label className="text-xs text-text-muted font-medium uppercase tracking-wide block mb-1">Linked Task</label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface text-text-primary focus:outline-none focus:ring-2 focus:border-primary"
            >
              <option value="">No task linked</option>
              {activeTasks.map((task) => (
                <option key={task.id} value={task.id}>{task.title}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Daily goal progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-secondary">Daily Goal: {todaySessions.length}/{settings.dailyGoal} pomodoros</span>
            <span className="text-xs text-text-muted">{Math.round(goalProgress)}%</span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(goalProgress, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Session Log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Today's Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {todaySessions.length > 0 ? (
            <div className="space-y-2">
              {[...todaySessions].reverse().map((session) => {
                const linkedTask = tasks.find((t) => t.id === session.taskId);
                return (
                  <div key={session.id} className="flex items-center gap-3 text-sm py-1">
                    <span>🍅</span>
                    <span className="text-text-secondary">{format(new Date(session.startedAt), 'HH:mm')}</span>
                    <span className="font-medium flex-1">{linkedTask?.title || 'General Focus'}</span>
                    <Badge variant="secondary">{session.durationMinutes}m</Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-text-muted text-sm text-center py-4">No sessions completed yet today. Start your first pomodoro!</p>
          )}
        </CardContent>
      </Card>

      {/* Settings Modal */}
      <Modal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} title="Pomodoro Settings">
        <div className="space-y-4">
          {[
            { label: 'Focus Duration (min)', key: 'focusDuration' },
            { label: 'Short Break (min)', key: 'shortBreak' },
            { label: 'Long Break (min)', key: 'longBreak' },
            { label: 'Daily Goal (pomodoros)', key: 'dailyGoal' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="text-sm font-medium mb-1 block">{label}</label>
              <Input
                type="number"
                value={localSettings[key as keyof typeof localSettings]}
                onChange={(e) => setLocalSettings((s) => ({ ...s, [key]: Number(e.target.value) }))}
                min={1}
              />
            </div>
          ))}
          <Button
            className="w-full mt-2"
            onClick={() => {
              updateSettings(localSettings);
              handleReset();
              setSettingsOpen(false);
            }}
          >
            Save Settings
          </Button>
        </div>
      </Modal>
    </div>
  );
}
