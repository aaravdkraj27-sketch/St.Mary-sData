import React from 'react';
import { RotateCcw } from 'lucide-react';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
          <RotateCcw className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-slate-900">
          Reset Term Monitor Records?
        </h3>

        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          This will reset the monitor assignments back to the initial demo baseline for St. Mary's School, Dwarka (including Aarav D.K Raj and Tarik Khan in Class 4-D).
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
            className="px-4 py-2 text-xs font-bold bg-[#0f2042] hover:bg-[#1b356b] text-white rounded-lg transition shadow-xs cursor-pointer"
          >
            Reset Term Data
          </button>
        </div>
      </div>
    </div>
  );
};
