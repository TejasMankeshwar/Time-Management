import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, List, FlaskConical } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import type { Task } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Badge } from '../components/shared/Badge';

type JarCategory = 'rock' | 'pebble' | 'sand' | 'water';

const JAR_CONFIG: Record<JarCategory, { label: string; emoji: string; color: string; fill: string; desc: string }> = {
  rock:   { label: 'Big Rocks',  emoji: '🪨', color: 'text-stone-700',   fill: '#78716C', desc: 'Most important, high-impact (Must Do)' },
  pebble: { label: 'Pebbles',    emoji: '🪨', color: 'text-stone-500',   fill: '#A8A29E', desc: 'Important but less urgent (Should Do)' },
  sand:   { label: 'Sand',       emoji: '🏖️', color: 'text-amber-500',   fill: '#F59E0B', desc: 'Minor tasks, small errands (Nice to Do)' },
  water:  { label: 'Water',      emoji: '💧', color: 'text-blue-400',    fill: '#60A5FA', desc: 'Distractions & time-wasters (Avoid)' },
};


export default function PickleJar() {
  const { tasks, addTask, deleteTask } = useTaskStore();
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<JarCategory>('rock');
  const [newMinutes, setNewMinutes] = useState(30);
  const [viewMode, setViewMode] = useState<'jar' | 'list'>('jar');
  const [hoveredLayer, setHoveredLayer] = useState<JarCategory | null>(null);

  const pickleJarTasks = tasks
    .filter((t) => t.source === 'picklejar' && t.status === 'active')
    .map((t) => ({ ...t, jarCategory: (t.category as unknown as JarCategory) || 'rock' }));

  const totalMinutes = pickleJarTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0);
  const workdayMinutes = 8 * 60;

  const categoryTotals = (['rock', 'pebble', 'sand', 'water'] as JarCategory[]).map((cat) => {
    const catTasks = pickleJarTasks.filter((t) => (t.category as unknown as JarCategory) === cat);
    const minutes = catTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0);
    return { cat, count: catTasks.length, minutes, pct: (minutes / workdayMinutes) * 100 };
  });

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addTask({
      title: newTitle.trim(),
      priority: 'medium',
      status: 'active',
      source: 'picklejar',
      category: newCategory as unknown as Task['category'],
      estimatedMinutes: newMinutes,
    });
    setNewTitle('');
  };

  // Build SVG jar layers
  const jarH = 300;
  const jarW = 160;
  let filledY = jarH;
  const layers = (['water', 'sand', 'pebble', 'rock'] as JarCategory[]).map((cat) => {
    const data = categoryTotals.find((c) => c.cat === cat)!;
    const layerH = (data.pct / 100) * jarH;
    filledY -= layerH;
    return { cat, y: filledY, h: layerH, fill: JAR_CONFIG[cat].fill };
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">The Pickle Jar</h2>
          <p className="text-text-secondary text-sm mt-0.5">Fill your jar with priorities — big rocks first.</p>
        </div>
        <div className="flex gap-1 bg-surface-alt rounded-lg p-1 border border-border">
          <button
            onClick={() => setViewMode('jar')}
            className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-colors ${viewMode === 'jar' ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary'}`}
          >
            <FlaskConical size={15} /> Jar
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary'}`}
          >
            <List size={15} /> List
          </button>
        </div>
      </div>

      {/* Add Task */}
      <Card>
        <CardContent className="py-4">
          <div className="flex gap-3 flex-wrap">
            <Input
              placeholder="Add a task to your jar..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1 min-w-40"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as JarCategory)}
              className="border border-border rounded-lg px-3 text-sm bg-surface text-text-primary focus:outline-none focus:ring-2 focus:border-primary"
            >
              {(Object.entries(JAR_CONFIG) as [JarCategory, typeof JAR_CONFIG[JarCategory]][]).map(([k, cfg]) => (
                <option key={k} value={k}>{cfg.emoji} {cfg.label}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={newMinutes}
                onChange={(e) => setNewMinutes(Number(e.target.value))}
                className="w-20"
                min={5}
              />
              <span className="text-sm text-text-muted">min</span>
            </div>
            <Button onClick={handleAdd}><Plus size={18} /></Button>
          </div>
        </CardContent>
      </Card>

      {/* Capacity Warning */}
      {totalMinutes > workdayMinutes && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-warning/10 border border-warning/30 rounded-xl p-4 text-warning text-sm"
        >
          ⚠️ Your jar is overflowing! You have {Math.round((totalMinutes - workdayMinutes) / 60)}h more than your 8-hour workday.
        </motion.div>
      )}

      {viewMode === 'jar' ? (
        <div className="flex gap-8 items-start flex-wrap lg:flex-nowrap">
          {/* The Jar SVG */}
          <div className="flex flex-col items-center flex-shrink-0">
            <svg width={jarW + 40} height={jarH + 80} viewBox={`0 0 ${jarW + 40} ${jarH + 80}`}>
              {/* Jar body clip */}
              <defs>
                <clipPath id="jar-clip">
                  <rect x={20} y={30} width={jarW} height={jarH} rx={16} />
                </clipPath>
              </defs>

              {/* Layers */}
              {layers.map(({ cat, y, h, fill }) => (
                <g key={cat}>
                  <motion.rect
                    x={20} y={30 + y} width={jarW} height={h}
                    fill={fill}
                    fillOpacity={hoveredLayer && hoveredLayer !== cat ? 0.4 : 0.85}
                    clipPath="url(#jar-clip)"
                    onMouseEnter={() => setHoveredLayer(cat)}
                    onMouseLeave={() => setHoveredLayer(null)}
                    initial={{ height: 0, y: 30 + jarH }}
                    animate={{ height: h, y: 30 + y }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="cursor-pointer"
                  />
                </g>
              ))}

              {/* Jar outline */}
              <rect
                x={20} y={30} width={jarW} height={jarH}
                rx={16} fill="none"
                stroke="var(--color-border)" strokeWidth={3}
              />

              {/* Jar neck */}
              <rect x={40} y={10} width={jarW - 40} height={25} rx={8}
                fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={2.5} />

              {/* Lid */}
              <rect x={30} y={5} width={jarW - 20} height={12} rx={5}
                fill="var(--color-surface-alt)" stroke="var(--color-border)" strokeWidth={2} />

              {/* Capacity text */}
              <text
                x={jarW / 2 + 20} y={jarH + 55}
                textAnchor="middle"
                className="font-mono" fontSize={13}
                fill="var(--color-text-secondary)"
              >
                {Math.round(totalMinutes / 60)}h / 8h used
              </text>
            </svg>

            {/* Legend */}
            <div className="space-y-2 mt-2">
              {(Object.entries(JAR_CONFIG) as [JarCategory, typeof JAR_CONFIG[JarCategory]][]).map(([cat, cfg]) => {
                const data = categoryTotals.find((c) => c.cat === cat)!;
                return (
                  <div
                    key={cat}
                    className={`flex items-center gap-2 text-sm cursor-pointer transition-opacity ${hoveredLayer && hoveredLayer !== cat ? 'opacity-40' : ''}`}
                    onMouseEnter={() => setHoveredLayer(cat)}
                    onMouseLeave={() => setHoveredLayer(null)}
                  >
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: cfg.fill }} />
                    <span className="text-text-secondary">{cfg.label}</span>
                    <span className="text-text-muted ml-auto">({data.count})</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tasks hovered layer / all tasks */}
          <div className="flex-1 space-y-3">
            {(Object.entries(JAR_CONFIG) as [JarCategory, typeof JAR_CONFIG[JarCategory]][]).map(([cat, cfg]) => {
              const catTasks = pickleJarTasks.filter((t) => (t.category as unknown) === cat);
              if (catTasks.length === 0) return null;
              return (
                <motion.div
                  key={cat}
                  animate={{ opacity: hoveredLayer && hoveredLayer !== cat ? 0.4 : 1 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span>{cfg.emoji}</span>
                    <span className="font-semibold text-sm">{cfg.label}</span>
                    <Badge variant="secondary">{catTasks.length}</Badge>
                  </div>
                  <div className="space-y-1.5 pl-6">
                    {catTasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.fill }} />
                        <span className="flex-1">{task.title}</span>
                        <span className="text-text-muted">{task.estimatedMinutes}m</span>
                        <button onClick={() => deleteTask(task.id)} className="text-text-muted hover:text-danger transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
            {pickleJarTasks.length === 0 && (
              <div className="text-center py-12 text-text-muted">
                <FlaskConical size={40} className="mx-auto mb-3 opacity-30" />
                <p>Your jar is empty. Add tasks above!</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-6">
          {(Object.entries(JAR_CONFIG) as [JarCategory, typeof JAR_CONFIG[JarCategory]][]).map(([cat, cfg]) => {
            const catTasks = pickleJarTasks.filter((t) => (t.category as unknown) === cat);
            return (
              <Card key={cat}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: cfg.fill }} />
                    <CardTitle className="text-base">{cfg.emoji} {cfg.label}</CardTitle>
                    <Badge variant="secondary">{catTasks.length}</Badge>
                  </div>
                  <p className="text-xs text-text-muted">{cfg.desc}</p>
                </CardHeader>
                <CardContent>
                  {catTasks.length > 0 ? (
                    <div className="space-y-2">
                      {catTasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.fill }} />
                          <span className="flex-1 text-sm">{task.title}</span>
                          <span className="text-xs text-text-muted">{task.estimatedMinutes}m</span>
                          <button onClick={() => deleteTask(task.id)} className="text-text-muted hover:text-danger transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-muted text-sm">No tasks in this category.</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
