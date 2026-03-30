import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { useTimeBlockStore } from '../store/useTimeBlockStore';
import type { TimeBlock, TaskCategory } from '../types';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Modal } from '../components/shared/Modal';

import { format, addDays, subDays } from 'date-fns';

const CATEGORY_CONFIG: Record<TaskCategory, { label: string; color: string }> = {
  work:     { label: 'Work',     color: '#6B8FAC' },
  health:   { label: 'Health',   color: '#52B788' },
  learning: { label: 'Learning', color: '#F4A261' },
  personal: { label: 'Personal', color: '#E76F51' },
  admin:    { label: 'Admin',    color: '#9CA3AF' },
  none:     { label: 'None',     color: '#9CA3AF' },
};

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}



export default function TimeBlocking() {
  const { addBlock, updateBlock, deleteBlock, getBlocksByDate } = useTimeBlockStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [addingBlock, setAddingBlock] = useState(false);
  const [newBlock, setNewBlock] = useState({
    title: '',
    startTime: '09:00',
    endTime: '10:00',
    category: 'work' as TaskCategory,
    notes: '',
  });

  const todayBlocks = getBlocksByDate(selectedDate).sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  const now = new Date();
  const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const HOUR_HEIGHT = 64; // px per hour
  const DAY_START_HOUR = 6;

  const blockStyle = (block: TimeBlock) => {
    const startMins = timeToMinutes(block.startTime) - DAY_START_HOUR * 60;
    const endMins = timeToMinutes(block.endTime) - DAY_START_HOUR * 60;
    const top = (startMins / 60) * HOUR_HEIGHT;
    const height = Math.max(((endMins - startMins) / 60) * HOUR_HEIGHT, 24);
    return { top, height };
  };

  const handleSaveBlock = () => {
    if (!newBlock.title.trim()) return;
    const color = CATEGORY_CONFIG[newBlock.category].color;
    addBlock({ ...newBlock, date: selectedDate, color });
    setAddingBlock(false);
    setNewBlock({ title: '', startTime: '09:00', endTime: '10:00', category: 'work', notes: '' });
  };

  const handleUpdateBlock = () => {
    if (!editingBlock) return;
    updateBlock(editingBlock.id, editingBlock);
    setEditingBlock(null);
  };

  return (
    <div className="flex gap-6 -mx-0">
      {/* Calendar */}
      <div className="flex-1 min-w-0">
        {/* Date navigator */}
        <div className="flex items-center gap-3 mb-4">
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(subDays(new Date(selectedDate), 1).toISOString().split('T')[0])}>
            ← Prev
          </Button>
          <div className="flex-1 text-center">
            <h2 className="font-display text-lg font-bold">{format(new Date(selectedDate), 'EEEE, MMMM do')}</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(addDays(new Date(selectedDate), 1).toISOString().split('T')[0])}>
            Next →
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>
            Today
          </Button>
        </div>

        {/* Grid */}
        <div className="relative bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="relative" style={{ height: HOUR_HEIGHT * HOURS.length }}>
            {/* Hour lines */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-b border-border/60 flex items-start"
                style={{ top: (hour - DAY_START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
              >
                <span className="text-xs text-text-muted w-14 px-3 pt-2 flex-shrink-0">
                  {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </span>
              </div>
            ))}

            {/* Current time indicator */}
            {isToday && currentTimeMinutes >= DAY_START_HOUR * 60 && (
              <div
                className="absolute left-14 right-0 z-20 flex items-center"
                style={{ top: ((currentTimeMinutes - DAY_START_HOUR * 60) / 60) * HOUR_HEIGHT }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-primary -ml-1.5" />
                <div className="flex-1 h-0.5 bg-primary" />
              </div>
            )}

            {/* Blocks */}
            {todayBlocks.map((block) => {
              const { top, height } = blockStyle(block);
              return (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute left-16 right-3 rounded-xl p-2 cursor-pointer hover:brightness-95 transition-all z-10 overflow-hidden"
                  style={{ top, height, backgroundColor: block.color + '22', borderLeft: `3px solid ${block.color}` }}
                  onClick={() => setEditingBlock(block)}
                >
                  <p className="text-xs font-semibold truncate" style={{ color: block.color }}>{block.title}</p>
                  <p className="text-xs text-text-muted">{block.startTime} – {block.endTime}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-64 shrink-0 space-y-4">
        <Button className="w-full" onClick={() => setAddingBlock(true)}>
          <Plus size={18} className="mr-2" /> Add Block
        </Button>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Today's Blocks</p>
          {todayBlocks.length > 0 ? (
            todayBlocks.map((block) => (
              <div
                key={block.id}
                className="p-3 rounded-xl border border-border bg-surface flex items-start gap-2 cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => setEditingBlock(block)}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: block.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{block.title}</p>
                  <p className="text-xs text-text-muted">{block.startTime} – {block.endTime}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-text-muted text-center py-4">No blocks yet. Add your first one!</p>
          )}
        </div>

        {/* Category legend */}
        <div className="space-y-1.5 pt-2 border-t border-border">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Categories</p>
          {(Object.entries(CATEGORY_CONFIG) as [TaskCategory, { label: string; color: string }][])
            .filter(([k]) => k !== 'none')
            .map(([cat, cfg]) => (
              <div key={cat} className="flex items-center gap-2 text-xs text-text-secondary">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: cfg.color }} />
                {cfg.label}
              </div>
            ))}
        </div>
      </div>

      {/* Add Block Modal */}
      <Modal isOpen={addingBlock} onClose={() => setAddingBlock(false)} title="Add Time Block">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-1 block text-text-secondary">Title</label>
            <Input
              placeholder="e.g. Deep Work Session"
              value={newBlock.title}
              onChange={(e) => setNewBlock((b) => ({ ...b, title: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block text-text-secondary">Start</label>
              <Input type="time" value={newBlock.startTime} onChange={(e) => setNewBlock((b) => ({ ...b, startTime: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block text-text-secondary">End</label>
              <Input type="time" value={newBlock.endTime} onChange={(e) => setNewBlock((b) => ({ ...b, endTime: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block text-text-secondary">Category</label>
            <select
              value={newBlock.category}
              onChange={(e) => setNewBlock((b) => ({ ...b, category: e.target.value as TaskCategory }))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:border-primary"
            >
              {(Object.entries(CATEGORY_CONFIG) as [TaskCategory, { label: string; color: string }][])
                .filter(([k]) => k !== 'none')
                .map(([cat, cfg]) => (
                  <option key={cat} value={cat}>{cfg.label}</option>
                ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block text-text-secondary">Notes</label>
            <textarea
              className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:border-primary bg-surface"
              rows={2}
              placeholder="Optional notes..."
              value={newBlock.notes}
              onChange={(e) => setNewBlock((b) => ({ ...b, notes: e.target.value }))}
            />
          </div>
          <Button className="w-full" onClick={handleSaveBlock}>Add Block</Button>
        </div>
      </Modal>

      {/* Edit Block Modal */}
      <Modal isOpen={!!editingBlock} onClose={() => setEditingBlock(null)} title="Edit Block">
        {editingBlock && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1 block text-text-secondary">Title</label>
              <Input value={editingBlock.title} onChange={(e) => setEditingBlock((b) => b ? { ...b, title: e.target.value } : null)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block text-text-secondary">Start</label>
                <Input type="time" value={editingBlock.startTime} onChange={(e) => setEditingBlock((b) => b ? { ...b, startTime: e.target.value } : null)} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block text-text-secondary">End</label>
                <Input type="time" value={editingBlock.endTime} onChange={(e) => setEditingBlock((b) => b ? { ...b, endTime: e.target.value } : null)} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block text-text-secondary">Category</label>
              <select
                value={editingBlock.category}
                onChange={(e) => setEditingBlock((b) => b ? { ...b, category: e.target.value as TaskCategory, color: CATEGORY_CONFIG[e.target.value as TaskCategory].color } : null)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:border-primary"
              >
                {(Object.entries(CATEGORY_CONFIG) as [TaskCategory, { label: string; color: string }][])
                  .filter(([k]) => k !== 'none')
                  .map(([cat, cfg]) => (
                    <option key={cat} value={cat}>{cfg.label}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block text-text-secondary">Notes</label>
              <textarea
                className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:border-primary bg-surface"
                rows={2}
                value={editingBlock.notes || ''}
                onChange={(e) => setEditingBlock((b) => b ? { ...b, notes: e.target.value } : null)}
              />
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleUpdateBlock}>Save Changes</Button>
              <Button variant="danger" size="sm" onClick={() => { deleteBlock(editingBlock.id); setEditingBlock(null); }}>
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
