import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  hideCloseBtn?: boolean;
}

export function Modal({ isOpen, onClose, title, children, className, hideCloseBtn = false }: ModalProps) {
  // Prevent body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-text-primary/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                "bg-surface w-full max-w-lg rounded-2xl shadow-xl border border-border pointer-events-auto flex flex-col max-h-[90vh]",
                className
              )}
            >
              <div className="flex justify-between items-center shrink-0 px-6 py-4 border-b border-border">
                {typeof title === 'string' ? (
                  <h2 className="text-xl font-display font-semibold text-text-primary">{title}</h2>
                ) : (
                  <div>{title}</div>
                )}
                {!hideCloseBtn && (
                  <button
                    onClick={onClose}
                    className="p-1 -mr-1 text-text-muted hover:text-text-primary transition-colors rounded-full hover:bg-surface-alt"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              <div className="p-6 overflow-y-auto shrink">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
