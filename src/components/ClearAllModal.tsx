import React from 'react';
import { Trash2, AlertOctagon, X, Users } from 'lucide-react';
import { MonitorRecord } from '../types';

interface ClearAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  monitors: MonitorRecord[];
}

export const ClearAllModal: React.FC<ClearAllModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  monitors
}) => {
  if (!isOpen) return null;

  const count = monitors.length;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Clear All Monitors Roster?
              </h3>
              <p className="text-xs text-slate-500">
                Bulk removal of all appointed student monitors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
            <p className="font-bold mb-1">Warning: Destructive Bulk Action</p>
            <p className="leading-relaxed">
              You are about to permanently remove <strong>all {count} student monitors</strong> across all classes (1 to 12) and sections (A to E) at St. Mary's School, Dwarka.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
            <div className="flex items-center gap-2 font-bold text-slate-800 mb-2">
              <Users className="w-4 h-4 text-slate-500" />
              <span>Summary of Affected Data ({count} Total Records):</span>
            </div>
            <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-600">
              <li>All appointed Class, Assistant, Discipline, Cleanliness, and Board Writing monitors</li>
              <li>All daily task verification checklists and completion statuses</li>
              <li>Local cache (<code className="font-mono bg-slate-200 px-1 py-0.5 rounded">sm_monitors</code>) and connected Google Sheets spreadsheet records</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 mt-6 pt-3.5 border-t border-slate-100">
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
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition shadow-xs cursor-pointer active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>Confirm Clear All {count} Monitors</span>
          </button>
        </div>
      </div>
    </div>
  );
};
