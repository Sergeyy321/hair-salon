import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/60 p-4 select-none">
      <div className="w-full max-w-md bg-paper-100 border border-line rounded-sm flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-paper-50">
          <div className="flex items-center gap-2.5">
            {isDestructive && (
              <div className="w-7 h-7 rounded-sm bg-status-cancelled-bg border border-status-cancelled-border flex items-center justify-center text-status-cancelled-text">
                <AlertTriangle className="w-4 h-4" />
              </div>
            )}
            <h2 className="font-serif text-headline font-bold text-charcoal-900">
              {title}
            </h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="w-8 h-8 rounded-sm border border-line flex items-center justify-center text-charcoal-500 hover:bg-paper-200 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-body text-charcoal-700 leading-relaxed font-sans">
            {message}
          </p>
        </div>

        <div className="px-6 py-3.5 border-t border-line bg-paper-50 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-line bg-paper-100 text-charcoal-700 text-label rounded-sm hover:bg-paper-200 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 text-paper-50 text-label font-medium rounded-sm transition-colors disabled:opacity-50 ${
              isDestructive
                ? 'bg-status-cancelled-text hover:bg-charcoal-900'
                : 'bg-charcoal-900 hover:bg-charcoal-700'
            }`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
