import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Star } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';

import { Card, CardContent, CardHeader } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Badge } from '../components/shared/Badge';
import { Modal } from '../components/shared/Modal';

const LIFE_AREAS = ['Health', 'Career', 'Finance', 'Relationships', 'Personal Growth', 'Fun', 'Other'];

const AREA_COLORS: Record<string, string> = {
  Health: '#52B788',
  Career: '#2D6A4F',
  Finance: '#F4A261',
  Relationships: '#E76F51',
  'Personal Growth': '#9061F9',
  Fun: '#3B82F6',
  Other: '#9CA3AF',
};

interface RPMBlockData {
  id: string;
  result: string;
  purpose: string;
  category: string;
  createdAt: string;
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} onClick={() => onChange(i)} className="transition-colors">
          <Star
            size={14}
            className={i <= value ? 'text-accent-warm fill-accent-warm' : 'text-border'}
          />
        </button>
      ))}
    </div>
  );
}

export default function RPM() {
  const { tasks, addTask, deleteTask, completeTask } = useTaskStore();
  const [rpmBlocks, setRpmBlocks] = useState<RPMBlockData[]>([]);
  const [newBlockOpen, setNewBlockOpen] = useState(false);
  const [newBlock, setNewBlock] = useState({ result: '', purpose: '', category: 'Career' });
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionPriority, setNewActionPriority] = useState(3);

  const handleCreateBlock = () => {
    if (!newBlock.result.trim()) return;
    const block: RPMBlockData = {
      id: crypto.randomUUID(),
      result: newBlock.result.trim(),
      purpose: newBlock.purpose.trim(),
      category: newBlock.category,
      createdAt: new Date().toISOString(),
    };
    setRpmBlocks((b) => [...b, block]);
    setNewBlock({ result: '', purpose: '', category: 'Career' });
    setNewBlockOpen(false);
    setExpandedBlock(block.id);
  };

  const getBlockActions = (blockId: string) =>
    tasks.filter((t) => t.source === 'rpm' && t.projectId === blockId);

  const addAction = (blockId: string) => {
    if (!newActionTitle.trim()) return;
    addTask({
      title: newActionTitle.trim(),
      priority: newActionPriority >= 4 ? 'high' : newActionPriority >= 3 ? 'medium' : 'low',
      status: 'active',
      source: 'rpm',
      projectId: blockId,
    });
    setNewActionTitle('');
    setNewActionPriority(3);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Rapid Planning Method</h2>
          <p className="text-text-secondary text-sm mt-0.5">Think in outcomes. Every action ties to a result and a purpose.</p>
        </div>
        <Button onClick={() => setNewBlockOpen(true)}>
          <Plus size={18} className="mr-2" /> New RPM Block
        </Button>
      </div>

      {/* Blocks */}
      {rpmBlocks.length > 0 ? (
        <div className="space-y-4">
          {rpmBlocks.map((block) => {
            const actions = getBlockActions(block.id);
            const completed = actions.filter((a) => a.status === 'completed').length;
            const progress = actions.length > 0 ? (completed / actions.length) * 100 : 0;
            const isExpanded = expandedBlock === block.id;

            return (
              <Card key={block.id} className="overflow-hidden">
                <div style={{ borderLeft: `4px solid ${AREA_COLORS[block.category] || '#9CA3AF'}` }}>
                  {/* Header */}
                  <button
                    className="w-full text-left"
                    onClick={() => setExpandedBlock(isExpanded ? null : block.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Badge variant="secondary" className="mb-2 text-xs">{block.category}</Badge>
                          <h3 className="font-display text-lg font-semibold text-text-primary">{block.result}</h3>
                          {block.purpose && (
                            <p className="text-text-secondary text-sm mt-1 italic">"{block.purpose}"</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-text-muted">{completed}/{actions.length} actions</p>
                          <div className="w-20 h-1.5 bg-border rounded-full mt-1">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </button>

                  {/* Expanded: MAP */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <CardContent className="pt-0 pb-4">
                          <div className="border-t border-border pt-4">
                            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                              ⚡ Massive Action Plan
                            </p>

                            {/* Actions */}
                            <div className="space-y-2 mb-4">
                              {actions.map((action) => (
                                <div key={action.id} className="flex items-center gap-3">
                                  <button
                                    onClick={() => action.status === 'active' ? completeTask(action.id) : undefined}
                                    className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                                      action.status === 'completed' ? 'bg-success border-success' : 'border-border hover:border-primary'
                                    }`}
                                  >
                                    {action.status === 'completed' && <span className="text-white text-xs">✓</span>}
                                  </button>
                                  <span className={`flex-1 text-sm ${action.status === 'completed' ? 'line-through text-text-muted' : ''}`}>
                                    {action.title}
                                  </span>
                                  <StarRating
                                    value={action.priority === 'high' ? 4 : action.priority === 'medium' ? 3 : 2}
                                    onChange={() => {}}
                                  />
                                  <button onClick={() => deleteTask(action.id)} className="text-text-muted hover:text-danger transition-colors">
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              ))}
                            </div>

                            {/* Add action */}
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add an action..."
                                value={newActionTitle}
                                onChange={(e) => setNewActionTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addAction(block.id)}
                                className="flex-1"
                              />
                              <StarRating value={newActionPriority} onChange={setNewActionPriority} />
                              <Button size="sm" onClick={() => addAction(block.id)}>
                                <Plus size={15} />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-text-muted">
          <span className="text-6xl block mb-4">⚡</span>
          <p className="font-display text-xl font-semibold text-text-primary mb-2">No RPM Blocks Yet</p>
          <p className="text-sm">Create your first block to define a result, your purpose, and the actions to get there.</p>
          <Button className="mt-6" onClick={() => setNewBlockOpen(true)}>
            <Plus size={18} className="mr-2" /> Create First Block
          </Button>
        </div>
      )}

      {/* New Block Modal */}
      <Modal isOpen={newBlockOpen} onClose={() => setNewBlockOpen(false)} title="Create RPM Block">
        <div className="space-y-4">
          <div className="p-4 bg-surface-alt rounded-xl space-y-1">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">1. Result</p>
            <p className="text-xs text-text-muted">What specific, measurable outcome do you want?</p>
            <Input
              placeholder="e.g. Launch product by December"
              value={newBlock.result}
              onChange={(e) => setNewBlock((b) => ({ ...b, result: e.target.value }))}
            />
          </div>
          <div className="p-4 bg-surface-alt rounded-xl space-y-1">
            <p className="text-xs font-semibold text-accent uppercase tracking-wider">2. Purpose</p>
            <p className="text-xs text-text-muted">Why does this matter? What's your compelling reason?</p>
            <Input
              placeholder="e.g. To achieve financial freedom for my family"
              value={newBlock.purpose}
              onChange={(e) => setNewBlock((b) => ({ ...b, purpose: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block text-text-secondary">Life Area</label>
            <div className="flex flex-wrap gap-2">
              {LIFE_AREAS.map((area) => (
                <button
                  key={area}
                  onClick={() => setNewBlock((b) => ({ ...b, category: area }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    newBlock.category === area
                      ? 'text-white border-transparent'
                      : 'border-border text-text-secondary hover:border-primary'
                  }`}
                  style={newBlock.category === area ? { backgroundColor: AREA_COLORS[area] } : {}}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full" onClick={handleCreateBlock}>
            Create Block &amp; Add Actions
          </Button>
        </div>
      </Modal>
    </div>
  );
}
