import { Bell, Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';

const TITLE_MAP: Record<string, string> = {
  '/': 'Dashboard',
  '/pomodoro': 'Pomodoro Technique',
  '/eat-the-frog': 'Eat The Frog',
  '/time-blocking': 'Time Blocking',
  '/kanban': 'Kanban Board',
  '/gtd': 'Getting Things Done',
  '/rpm': 'Rapid Planning Method',
  '/pickle-jar': 'Pickle Jar',
  '/analytics': 'Analytics'
};

export default function TopBar() {
  const { pathname } = useLocation();
  const title = TITLE_MAP[pathname] || 'TimeFlow';
  const currentDate = new Date();

  return (
    <header className="h-16 border-b border-border bg-surface px-4 md:px-8 flex items-center justify-between z-10 shrink-0">
      <div className="flex items-center gap-4 overflow-hidden">
        <h1 className="font-display text-2xl font-bold text-text-primary truncate">
          {title}
        </h1>
        <div className="hidden sm:block text-text-muted text-sm border-l border-border pl-4 truncate">
          {format(currentDate, 'EEEE, MMMM do, yyyy')}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-3 md:px-4 py-2 rounded-[10px] transition-colors shadow-sm font-medium text-sm">
          <Plus size={16} />
          <span className="hidden sm:inline">Quick Add Task</span>
        </button>

        <button className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-surface-alt flex items-center justify-center text-text-secondary hover:text-primary transition-colors hover:shadow-sm">
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}
