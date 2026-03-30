import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';

import { Card, CardContent, CardHeader, CardTitle } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Badge } from '../components/shared/Badge';
import { Modal } from '../components/shared/Modal';

type GTDView = 'inbox' | 'nextActions' | 'projects' | 'waitingFor' | 'someday' | 'reference' | 'weeklyReview';

const GTD_NAV: { key: GTDView; label: string; emoji: string }[] = [
  { key: 'inbox',       label: 'Inbox',          emoji: '📥' },
  { key: 'nextActions', label: 'Next Actions',   emoji: '✅' },
  { key: 'projects',    label: 'Projects',       emoji: '📁' },
  { key: 'waitingFor',  label: 'Waiting For',    emoji: '⏳' },
  { key: 'someday',     label: 'Someday/Maybe',  emoji: '🌟' },
  { key: 'reference',   label: 'Reference',      emoji: '📚' },
  { key: 'weeklyReview', label: 'Weekly Review', emoji: '🔄' },
];

const CONTEXTS = ['@home', '@work', '@phone', '@computer', '@errands'] as const;

export default function GTD() {
  const { tasks, addTask, updateTask, deleteTask, completeTask } = useTaskStore();
  const [activeView, setActiveView] = useState<GTDView>('inbox');
  const [newCapture, setNewCapture] = useState('');
  const [clarifyTaskId, setClarifyTaskId] = useState<string | null>(null);
  const [reviewStep, setReviewStep] = useState(0);

  const inboxTasks = tasks.filter((t) => t.source === 'gtd' && t.status === 'active' && !t.context && !t.projectId && t.priority !== 'frog');
  const nextActions = tasks.filter((t) => t.source === 'gtd' && t.status === 'active' && t.context && t.context !== 'none');
  const projectTasks = tasks.filter((t) => t.source === 'gtd' && t.status === 'active' && t.projectId && t.context);
  const waitingFor = tasks.filter((t) => t.source === 'gtd' && t.status === 'active' && t.labels?.includes('waiting'));
  const someday = tasks.filter((t) => t.source === 'gtd' && t.status === 'active' && t.labels?.includes('someday'));
  const reference = tasks.filter((t) => t.source === 'gtd' && t.status === 'active' && t.labels?.includes('reference'));

  const handleCapture = () => {
    const title = newCapture.trim();
    if (!title) return;
    addTask({ title, priority: 'medium', status: 'active', source: 'gtd' });
    setNewCapture('');
  };

  const clarifyingTask = clarifyTaskId ? tasks.find((t) => t.id === clarifyTaskId) : null;

  const REVIEW_STEPS = [
    'Process your inbox to zero',
    'Review your projects list',
    'Review next actions',
    'Review waiting for list',
    'Review someday/maybe list',
    'Review your calendar',
  ];

  return (
    <div className="flex gap-0 -m-4 md:-m-8 min-h-screen">
      {/* Left sub-nav */}
      <aside className="w-48 shrink-0 bg-surface border-r border-border p-3 min-h-full">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-2 mb-2">GTD Flow</p>
        <nav className="space-y-0.5">
          {GTD_NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveView(item.key)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeView === item.key
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
              }`}
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
              {item.key === 'inbox' && inboxTasks.length > 0 && (
                <span className="ml-auto bg-accent text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">{inboxTasks.length}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* INBOX */}
            {activeView === 'inbox' && (
              <div className="max-w-2xl space-y-4">
                <div>
                  <h2 className="font-display text-2xl font-bold">Capture — Inbox</h2>
                  <p className="text-text-secondary text-sm">Get everything out of your head.</p>
                </div>
                <Card>
                  <CardContent className="py-4 flex gap-3">
                    <Input
                      placeholder="What's on your mind?"
                      value={newCapture}
                      onChange={(e) => setNewCapture(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCapture()}
                      className="flex-1"
                    />
                    <Button onClick={handleCapture}><Plus size={18} /></Button>
                  </CardContent>
                </Card>
                {inboxTasks.length > 0 ? (
                  <div className="space-y-2">
                    {inboxTasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-border shadow-sm">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{task.title}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setClarifyTaskId(task.id)}>Clarify</Button>
                        <button onClick={() => deleteTask(task.id)} className="text-text-muted hover:text-danger transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-text-muted">
                    <span className="text-5xl block mb-3">🎉</span>
                    <p className="font-medium text-lg">Inbox Zero!</p>
                    <p className="text-sm mt-1">All items processed. Well done!</p>
                  </div>
                )}
              </div>
            )}

            {/* NEXT ACTIONS */}
            {activeView === 'nextActions' && (
              <div className="max-w-2xl space-y-4">
                <h2 className="font-display text-2xl font-bold">Next Actions</h2>
                {CONTEXTS.map((ctx) => {
                  const ctxTasks = nextActions.filter((t) => t.context === ctx);
                  return (
                    <Card key={ctx}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs font-mono">{ctx}</Badge>
                          <span className="text-text-muted text-sm font-normal">({ctxTasks.length})</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {ctxTasks.length > 0 ? (
                          <div className="space-y-2">
                            {ctxTasks.map((task) => (
                              <div key={task.id} className="flex items-center gap-3 text-sm">
                                <button
                                  onClick={() => completeTask(task.id)}
                                  className="w-4 h-4 rounded border border-border flex-shrink-0 hover:border-primary hover:bg-primary/10 transition-colors"
                                />
                                <span className="flex-1">{task.title}</span>
                                <button onClick={() => deleteTask(task.id)} className="text-text-muted hover:text-danger transition-colors">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-text-muted text-sm">No tasks for {ctx}.</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* SOMEDAY */}
            {activeView === 'someday' && (
              <div className="max-w-2xl space-y-4">
                <h2 className="font-display text-2xl font-bold">Someday / Maybe</h2>
                {someday.length > 0 ? (
                  someday.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-border shadow-sm">
                      <p className="flex-1 text-sm">{t.title}</p>
                      <button onClick={() => deleteTask(t.id)} className="text-text-muted hover:text-danger"><Trash2 size={16} /></button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-text-muted">
                    <span className="text-5xl block mb-3">🌟</span>
                    <p>No someday items. Process inbox items here.</p>
                  </div>
                )}
              </div>
            )}

            {/* WAITING FOR */}
            {activeView === 'waitingFor' && (
              <div className="max-w-2xl space-y-4">
                <h2 className="font-display text-2xl font-bold">Waiting For</h2>
                {waitingFor.length > 0 ? (
                  waitingFor.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-border shadow-sm">
                      <span className="text-xl">⏳</span>
                      <p className="flex-1 text-sm">{t.title}</p>
                      <button onClick={() => completeTask(t.id)} className="text-success hover:underline text-sm">Done</button>
                      <button onClick={() => deleteTask(t.id)} className="text-text-muted hover:text-danger"><Trash2 size={16} /></button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-text-muted">
                    <span className="text-5xl block mb-3">⏳</span>
                    <p>Nothing waiting. All good!</p>
                  </div>
                )}
              </div>
            )}

            {/* WEEKLY REVIEW */}
            {activeView === 'weeklyReview' && (
              <div className="max-w-xl space-y-4">
                <h2 className="font-display text-2xl font-bold">Weekly Review</h2>
                <p className="text-text-secondary text-sm">A guided reflection to keep your GTD system current.</p>
                <Card>
                  <CardContent className="py-6 space-y-4">
                    {REVIEW_STEPS.map((step, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                          i <= reviewStep ? 'border-primary bg-primary text-white' : 'border-border text-text-muted'
                        }`}>
                          {i < reviewStep ? '✓' : i + 1}
                        </div>
                        <p className={`text-sm ${i <= reviewStep ? 'text-text-primary font-medium' : 'text-text-muted'}`}>{step}</p>
                      </div>
                    ))}
                    <div className="flex gap-3 mt-6 pt-4 border-t border-border">
                      {reviewStep > 0 && (
                        <Button variant="outline" onClick={() => setReviewStep(s => s - 1)}>Back</Button>
                      )}
                      {reviewStep < REVIEW_STEPS.length ? (
                        <Button className="flex-1" onClick={() => setReviewStep(s => s + 1)}>
                          {reviewStep === REVIEW_STEPS.length - 1 ? '🎉 Complete Review' : 'Next Step'}
                        </Button>
                      ) : (
                        <Button className="flex-1 bg-success hover:bg-success/80" onClick={() => setReviewStep(0)}>
                          Start New Review
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* REFERENCE */}
            {activeView === 'reference' && (
              <div className="max-w-2xl space-y-4">
                <h2 className="font-display text-2xl font-bold">Reference</h2>
                {reference.length > 0 ? (
                  reference.map((t) => (
                    <Card key={t.id}>
                      <CardContent className="py-4 flex items-center justify-between gap-3">
                        <p className="flex-1 text-sm">{t.title}</p>
                        <button onClick={() => deleteTask(t.id)} className="text-text-muted hover:text-danger"><Trash2 size={16} /></button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-16 text-text-muted">
                    <span className="text-5xl block mb-3">📚</span>
                    <p>No reference items stored yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* PROJECTS */}
            {activeView === 'projects' && (
              <div className="max-w-2xl space-y-4">
                <h2 className="font-display text-2xl font-bold">Projects</h2>
                {projectTasks.length > 0 ? (
                  projectTasks.map((t) => (
                    <Card key={t.id}>
                      <CardContent className="py-4">
                        <p className="font-medium text-sm">{t.title}</p>
                        <p className="text-xs text-text-muted mt-0.5">{t.context || 'No context'}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-16 text-text-muted">
                    <span className="text-5xl block mb-3">📁</span>
                    <p>No projects yet. Clarify inbox items to create projects.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Clarify Modal */}
      <Modal isOpen={!!clarifyTaskId} onClose={() => setClarifyTaskId(null)} title="Clarify Item">
        {clarifyingTask && (
          <div className="space-y-4">
            <div className="p-3 bg-surface-alt rounded-lg">
              <p className="font-medium">{clarifyingTask.title}</p>
            </div>
            <p className="text-sm font-medium text-text-secondary">Is this actionable?</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-xs text-text-muted font-medium uppercase tracking-wide">✅ Yes, it's actionable</p>
                <Button
                  size="sm" variant="outline" className="w-full justify-start text-xs"
                  onClick={() => {
                    // do it now (< 2 min)
                    completeTask(clarifyingTask.id);
                    setClarifyTaskId(null);
                  }}
                >
                  ⚡ Do it now (&lt;2 min)
                </Button>
                {CONTEXTS.map((ctx) => (
                  <Button
                    key={ctx}
                    size="sm" variant="outline" className="w-full justify-start text-xs font-mono"
                    onClick={() => {
                      updateTask(clarifyingTask.id, { context: ctx });
                      setClarifyTaskId(null);
                    }}
                  >
                    Defer → {ctx}
                  </Button>
                ))}
                <Button
                  size="sm" variant="outline" className="w-full justify-start text-xs"
                  onClick={() => {
                    updateTask(clarifyingTask.id, { labels: ['waiting'] });
                    setClarifyTaskId(null);
                  }}
                >
                  🤝 Delegate (Waiting For)
                </Button>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-text-muted font-medium uppercase tracking-wide">❌ Not actionable</p>
                <Button
                  size="sm" variant="outline" className="w-full justify-start text-xs"
                  onClick={() => {
                    deleteTask(clarifyingTask.id);
                    setClarifyTaskId(null);
                  }}
                >
                  🗑️ Delete it
                </Button>
                <Button
                  size="sm" variant="outline" className="w-full justify-start text-xs"
                  onClick={() => {
                    updateTask(clarifyingTask.id, { labels: ['reference'] });
                    setClarifyTaskId(null);
                  }}
                >
                  📚 File as Reference
                </Button>
                <Button
                  size="sm" variant="outline" className="w-full justify-start text-xs"
                  onClick={() => {
                    updateTask(clarifyingTask.id, { labels: ['someday'] });
                    setClarifyTaskId(null);
                  }}
                >
                  🌟 Someday/Maybe
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
