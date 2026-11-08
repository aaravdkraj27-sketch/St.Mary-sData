import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { MonitorRecord } from '../types';

interface DeleteModalProps {
  monitor: MonitorRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  monitor,
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !monitor) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-slate-900">
          Remove Monitor Duty Assignment?
        </h3>

        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          Are you sure you want to remove <strong>{monitor.name}</strong> from their assigned duty as{' '}
          <strong>{monitor.role}</strong> in <strong>Class {monitor.className}-{monitor.section}</strong>?
        </p>

        <p className="text-[11px] text-slate-400 mt-2">
          This action will immediately update the local storage cache and propagate to connected Google Sheets records.
        </p>

        <div className="flex justify-end gap-2.5 mt-6 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition shadow-xs cursor-pointer"
          >
            Confirm Removal
          </button>
        </div>
      </div>
    </div>
  );
};
