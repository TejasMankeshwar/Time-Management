import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  Home, 
  Timer, 
  Target, // Eat The Frog
  Calendar, // Time Blocking
  KanbanSquare, // Kanban -> Trello/Board icon
  CheckSquare, // GTD
  Zap, // RPM
  FlaskConical, // Pickle Jar
  BarChart, // Analytics
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  Leaf
} from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Pomodoro', path: '/pomodoro', icon: Timer },
  { name: 'Eat The Frog', path: '/eat-the-frog', icon: Target },
  { name: 'Time Blocking', path: '/time-blocking', icon: Calendar },
  { name: 'Kanban', path: '/kanban', icon: KanbanSquare },
  { name: 'GTD', path: '/gtd', icon: CheckSquare },
  { name: 'RPM', path: '/rpm', icon: Zap },
  { name: 'Pickle Jar', path: '/pickle-jar', icon: FlaskConical },
  { name: 'Analytics', path: '/analytics', icon: BarChart },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, userPrefs } = useAppStore();

  return (
    <aside
      className={cn(
        'h-full bg-surface border-r border-border transition-all duration-300 flex flex-col',
        sidebarCollapsed ? 'w-16' : 'w-60 lg:w-64'
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <div className={cn('flex items-center gap-3 overflow-hidden', sidebarCollapsed && 'justify-center')}>
          <div className="flex-shrink-0 text-primary">
            <Leaf size={24} />
          </div>
          {!sidebarCollapsed && (
            <span className="font-display font-bold text-xl text-primary whitespace-nowrap">
              TimeFlow
            </span>
          )}
        </div>
        
        {/* Toggle button overlay when hovering or fixed on mobile/tablet */}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-2 scrollbar-hide">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-primary-light/10 text-primary font-medium'
                  : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary',
                sidebarCollapsed && 'justify-center'
              )
            }
            title={sidebarCollapsed ? item.name : undefined}
          >
            <item.icon size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border flex flex-col gap-4">
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-3 px-2 py-2 text-text-muted hover:text-text-primary transition-colors"
          title="Toggle Sidebar"
        >
          {sidebarCollapsed ? (
             <ChevronRight size={20} className="mx-auto" />
          ) : (
            <>
              <ChevronLeft size={20} />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>

        <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}>
          <div className="w-8 h-8 rounded-full bg-surface-alt flex flex-shrink-0 items-center justify-center border border-border">
            <User size={16} className="text-text-secondary" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{userPrefs.name}</span>
              <div className="flex items-center gap-2 mt-1">
                <Settings size={14} className="text-text-muted cursor-pointer hover:text-primary" />
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
