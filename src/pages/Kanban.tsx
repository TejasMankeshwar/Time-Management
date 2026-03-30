import { useState } from 'react';

import { Plus, Trash2, Check } from 'lucide-react';
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useKanbanStore } from '../store/useKanbanStore';
import type { KanbanCard as KanbanCardType, KanbanColumn as KanbanColumnType, KanbanPriority } from '../types';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Modal } from '../components/shared/Modal';

const PRIORITY_CONFIG: Record<KanbanPriority, { label: string; color: string }> = {
  critical: { label: 'Critical', color: '#DC2626' },
  high:     { label: 'High',     color: '#D97706' },
  medium:   { label: 'Medium',   color: '#2D6A4F' },
  low:      { label: 'Low',      color: '#9CA3AF' },
};

function KanbanCardComp({ card, onClick }: { card: KanbanCardType; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const doneChecklist = card.checklist.filter((c) => c.done).length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-surface rounded-xl border border-border shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-text-primary leading-snug">{card.title}</p>
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
          style={{ backgroundColor: PRIORITY_CONFIG[card.priority].color }}
          title={PRIORITY_CONFIG[card.priority].label}
        />
      </div>
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map((lbl, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{lbl}</span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-text-muted mt-1">
        {card.dueDate && <span>📅 {card.dueDate}</span>}
        {card.checklist.length > 0 && (
          <span className={doneChecklist === card.checklist.length ? 'text-success' : ''}>
            ✓ {doneChecklist}/{card.checklist.length}
          </span>
        )}
      </div>
    </div>
  );
}

function KanbanColumnComp({
  column,
  cards,
  onAddCard,
  onDeleteColumn,
  onCardClick,
}: {
  column: KanbanColumnType;
  cards: KanbanCardType[];
  onAddCard: (columnId: string, title: string) => void;
  onDeleteColumn: (id: string) => void;
  onCardClick: (card: KanbanCardType) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const isOverLimit = column.wipLimit !== undefined && cards.length > column.wipLimit;

  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div className={`flex-shrink-0 w-72 flex flex-col rounded-2xl border ${isOverLimit ? 'border-warning/50 bg-warning/5' : 'border-border bg-surface-alt'} p-3`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-text-primary">{column.title}</h3>
          <span className={`text-xs font-mono px-1.5 py-0.5 rounded-md ${isOverLimit ? 'bg-warning/20 text-warning' : 'bg-border text-text-muted'}`}>
            {cards.length}{column.wipLimit ? `/${column.wipLimit}` : ''}
          </span>
        </div>
        <button onClick={() => onDeleteColumn(column.id)} className="text-text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100">
          <Trash2 size={14} />
        </button>
      </div>

      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex flex-col gap-2 flex-1 min-h-[80px]">
          {cards.map((card) => (
            <KanbanCardComp key={card.id} card={card} onClick={() => onCardClick(card)} />
          ))}
        </div>
      </SortableContext>

      {adding ? (
        <div className="mt-2 space-y-2">
          <Input
            placeholder="Card title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newTitle.trim()) {
                onAddCard(column.id, newTitle.trim());
                setNewTitle('');
                setAdding(false);
              }
              if (e.key === 'Escape') { setAdding(false); setNewTitle(''); }
            }}
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { if (newTitle.trim()) { onAddCard(column.id, newTitle.trim()); setNewTitle(''); } setAdding(false); }}>
              Add
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setNewTitle(''); }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-2 flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-surface w-full"
        >
          <Plus size={16} /> Add card
        </button>
      )}
    </div>
  );
}

export default function Kanban() {
  const { columns, cards, addCard, updateCard, deleteCard, deleteColumn, addColumn, moveCard } = useKanbanStore();
  const [activeCard, setActiveCard] = useState<KanbanCardType | null>(null);
  const [selectedCard, setSelectedCard] = useState<KanbanCardType | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [newLabelInput, setNewLabelInput] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = ({ active }: DragStartEvent) => {
    const card = cards.find((c) => c.id === active.id);
    if (card) setActiveCard(card);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveCard(null);
    if (!over) return;
    const cardId = active.id as string;
    // Check if dropped over a column or a card
    const targetColumn = columns.find((col) => col.id === over.id);
    if (targetColumn) {
      moveCard(cardId, targetColumn.id);
      return;
    }
    const targetCard = cards.find((c) => c.id === over.id);
    if (targetCard) {
      moveCard(cardId, targetCard.columnId);
    }
  };

  const handleAddCard = (columnId: string, title: string) => {
    addCard({ columnId, title, priority: 'medium', labels: [], checklist: [], description: '' });
  };

  const selectedCardData = selectedCard ? cards.find(c => c.id === selectedCard.id) : null;

  return (
    <div className="h-full -m-4 md:-m-8 flex flex-col">
      <div className="px-4 md:px-8 py-4 border-b border-border bg-surface flex items-center justify-between">
        <p className="text-text-muted text-sm">{cards.length} cards across {columns.length} columns</p>
        <div className="flex gap-2">
          {addingColumn ? (
            <>
              <Input
                placeholder="Column name..."
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                className="w-40"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newColumnTitle.trim()) {
                    addColumn(newColumnTitle.trim());
                    setNewColumnTitle('');
                    setAddingColumn(false);
                  }
                }}
              />
              <Button size="sm" onClick={() => { if (newColumnTitle.trim()) addColumn(newColumnTitle.trim()); setAddingColumn(false); setNewColumnTitle(''); }}>Add</Button>
              <Button size="sm" variant="ghost" onClick={() => setAddingColumn(false)}>Cancel</Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setAddingColumn(true)}>
              <Plus size={16} className="mr-1" /> Add Column
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-4 md:px-8 md:py-6">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full items-start">
            {columns.map((col) => (
              <KanbanColumnComp
                key={col.id}
                column={col}
                cards={cards.filter((c) => c.columnId === col.id)}
                onAddCard={handleAddCard}
                onDeleteColumn={deleteColumn}
                onCardClick={setSelectedCard}
              />
            ))}
          </div>
          <DragOverlay>
            {activeCard ? (
              <div className="bg-surface rounded-xl border border-primary shadow-lg p-3 w-72 rotate-2 opacity-90">
                <p className="text-sm font-medium">{activeCard.title}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Card Detail Modal */}
      <Modal
        isOpen={!!selectedCard && !!selectedCardData}
        onClose={() => setSelectedCard(null)}
        title={selectedCardData?.title || ''}
        className="max-w-xl"
      >
        {selectedCardData && (
          <div className="space-y-4">
            {/* Priority */}
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wide block mb-1">Priority</label>
              <div className="flex gap-2 flex-wrap">
                {(Object.entries(PRIORITY_CONFIG) as [KanbanPriority, { label: string; color: string }][]).map(([p, cfg]) => (
                  <button
                    key={p}
                    onClick={() => updateCard(selectedCardData.id, { priority: p })}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedCardData.priority === p ? 'text-white border-transparent' : 'bg-transparent border-border text-text-secondary hover:border-primary'}`}
                    style={selectedCardData.priority === p ? { backgroundColor: cfg.color, borderColor: cfg.color } : {}}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wide block mb-1">Due Date</label>
              <Input
                type="date"
                value={selectedCardData.dueDate || ''}
                onChange={(e) => updateCard(selectedCardData.id, { dueDate: e.target.value })}
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wide block mb-1">Description</label>
              <textarea
                className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:border-primary bg-surface"
                rows={3}
                placeholder="Add a description..."
                value={selectedCardData.description || ''}
                onChange={(e) => updateCard(selectedCardData.id, { description: e.target.value })}
              />
            </div>

            {/* Labels */}
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wide block mb-2">Labels</label>
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedCardData.labels.map((lbl, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary cursor-pointer hover:bg-danger/10 hover:text-danger transition-colors"
                    onClick={() => updateCard(selectedCardData.id, { labels: selectedCardData.labels.filter((_, j) => j !== i) })}
                    title="Click to remove"
                  >
                    {lbl} ×
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add label..."
                  value={newLabelInput}
                  onChange={(e) => setNewLabelInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newLabelInput.trim()) {
                      updateCard(selectedCardData.id, { labels: [...selectedCardData.labels, newLabelInput.trim()] });
                      setNewLabelInput('');
                    }
                  }}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Checklist */}
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wide block mb-2">
                Checklist ({selectedCardData.checklist.filter(c => c.done).length}/{selectedCardData.checklist.length})
              </label>
              <div className="space-y-2 mb-2">
                {selectedCardData.checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <button
                      onClick={() => updateCard(selectedCardData.id, {
                        checklist: selectedCardData.checklist.map((c) => c.id === item.id ? { ...c, done: !c.done } : c)
                      })}
                      className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${item.done ? 'bg-success border-success' : 'border-border hover:border-primary'}`}
                    >
                      {item.done && <Check size={11} className="text-white" />}
                    </button>
                    <span className={`text-sm flex-1 ${item.done ? 'line-through text-text-muted' : ''}`}>{item.text}</span>
                    <button
                      onClick={() => updateCard(selectedCardData.id, { checklist: selectedCardData.checklist.filter((c) => c.id !== item.id) })}
                      className="text-text-muted hover:text-danger transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add checklist item..."
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newChecklistItem.trim()) {
                      updateCard(selectedCardData.id, {
                        checklist: [...selectedCardData.checklist, { id: crypto.randomUUID(), text: newChecklistItem.trim(), done: false }]
                      });
                      setNewChecklistItem('');
                    }
                  }}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Delete */}
            <div className="pt-2 border-t border-border">
              <Button
                variant="danger"
                size="sm"
                onClick={() => { deleteCard(selectedCardData.id); setSelectedCard(null); }}
              >
                <Trash2 size={14} className="mr-1" /> Delete Card
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
