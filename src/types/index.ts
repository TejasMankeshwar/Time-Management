export type StrategyType = 
  | 'pomodoro' 
  | 'eatthefrog' 
  | 'timeblocking' 
  | 'kanban' 
  | 'gtd' 
  | 'rpm' 
  | 'picklejar' 
  | 'none';

export type TaskPriority = 'frog' | 'high' | 'medium' | 'low';
export type TaskStatus = 'active' | 'completed' | 'archived';
export type TaskCategory = 'work' | 'health' | 'learning' | 'personal' | 'admin' | 'none';
export type GTDContext = '@home' | '@work' | '@phone' | '@computer' | '@errands' | 'none';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string; // ISO date string
  estimatedMinutes?: number;
  actualMinutes?: number;
  category?: TaskCategory;
  labels?: string[];
  context?: GTDContext;
  source?: StrategyType;
  createdAt: string;
  completedAt?: string;
  projectId?: string; // Specific for GTD
}

export interface TimeBlock {
  id: string;
  title: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  date: string;      // ISO date
  category: TaskCategory;
  color: string;
  notes?: string;
  taskId?: string;
}

export interface DayTemplate {
  id: string;
  name: string;
  blocks: Omit<TimeBlock, 'id' | 'date' | 'taskId'>[];
}

export interface KanbanChecklist {
  id: string;
  text: string;
  done: boolean;
}

export type KanbanPriority = 'critical' | 'high' | 'medium' | 'low';

export interface KanbanCard {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  priority: KanbanPriority;
  dueDate?: string;
  labels: string[];
  checklist: KanbanChecklist[];
  createdAt: string;
  taskId?: string; // Link back to global Task if applicable
}

export interface KanbanColumn {
  id: string;
  title: string;
  wipLimit?: number;
  collapsed?: boolean;
}

export type PomodoroSessionType = 'focus' | 'shortBreak' | 'longBreak';

export interface PomodoroSession {
  id: string;
  type: PomodoroSessionType;
  durationMinutes: number;
  startedAt: string;
  completedAt?: string;
  taskId?: string;
  completed: boolean;
}

export interface PickleJarTask extends Task {
  jarCategory: 'rock' | 'pebble' | 'sand' | 'water';
}

export interface RPMBlock {
  id: string;
  result: string;
  purpose: string;
  category: string;
  createdAt: string;
  // MAP (Massive Action Plan) will be Tasks with source='rpm' and projectId=this.id
}
