import React, { useState } from 'react';
import { FileSpreadsheet, X, ExternalLink, PlusCircle, RefreshCw, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';
import { SheetConfig } from '../types';

interface DirectSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleUser: User | null;
  sheetConfig: SheetConfig;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  onCreateNewSpreadsheet: () => Promise<void>;
  onSyncDirect: () => Promise<void>;
  onSaveSpreadsheetId: (id: string) => void;
  isOperating: boolean;
}

export const DirectSheetsModal: React.FC<DirectSheetsModalProps> = ({
  isOpen,
  onClose,
  googleUser,
  sheetConfig,
  onGoogleSignIn,
  onGoogleSignOut,
  onCreateNewSpreadsheet,
  onSyncDirect,
  onSaveSpreadsheetId,
  isOperating
}) => {
  const [manualId, setManualId] = useState(sheetConfig.spreadsheetId || '');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  React.useEffect(() => {
    setManualId(sheetConfig.spreadsheetId || '');
  }, [sheetConfig.spreadsheetId]);

  if (!isOpen) return null;

  const handleCreateNew = async () => {
    setFeedback(null);
    try {
      await onCreateNewSpreadsheet();
      setFeedback({ type: 'success', msg: 'New spreadsheet created in your Google Drive!' });
    } catch (e: any) {
      setFeedback({ type: 'error', msg: e.message || 'Creation failed' });
    }
  };

  const handleSyncNow = async () => {
    setFeedback(null);
    try {
      await onSyncDirect();
      setFeedback({ type: 'success', msg: 'Spreadsheet successfully updated!' });
    } catch (e: any) {
      setFeedback({ type: 'error', msg: e.message || 'Sync failed' });
    }
  };

  const handleSaveManualId = () => {
    onSaveSpreadsheetId(manualId.trim());
    setFeedback({ type: 'success', msg: 'Spreadsheet ID saved!' });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Direct Google Sheets Integration
              </h3>
              <p className="text-xs text-slate-500">
                Authorized via Google Workspace & Firebase Auth
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

        <div className="py-4 space-y-4">
          {feedback && (
            <div
              className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.msg}</span>
            </div>
          )}

          {/* Account status */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Google Workspace Account
                </span>
                {googleUser ? (
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{googleUser.email}</p>
                ) : (
                  <p className="text-xs text-slate-600 mt-0.5">Not signed in</p>
                )}
              </div>
              {googleUser ? (
                <button
                  onClick={onGoogleSignOut}
                  className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={onGoogleSignIn}
                  className="flex items-center gap-2 text-xs font-bold text-white bg-[#0f2042] hover:bg-[#1b356b] px-3 py-1.5 rounded-lg transition shadow-xs cursor-pointer"
                >
                  <span>Sign In with Google</span>
                </button>
              )}
            </div>
          </div>

          {googleUser && (
            <div className="space-y-4">
              {/* Linked Spreadsheet details */}
              {sheetConfig.spreadsheetId ? (
                <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950">Active Connected Sheet</span>
                    <a
                      href={
                        sheetConfig.spreadsheetUrl ||
                        `https://docs.google.com/spreadsheets/d/${sheetConfig.spreadsheetId}/edit`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                    >
                      <span>Open in Google Sheets</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-[11px] font-mono text-slate-600 break-all">
                    ID: {sheetConfig.spreadsheetId}
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSyncNow}
                      disabled={isOperating}
                      className="flex items-center gap-1.5 text-xs font-bold bg-[#0f2042] text-white hover:bg-[#1b356b] px-3.5 py-2 rounded-lg transition shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isOperating ? 'animate-spin' : ''}`} />
                      <span>Push Local Roster to Sheet Now</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-700">No Spreadsheet Linked Yet</p>
                  <p className="text-[11px] text-slate-500 mt-1 mb-3">
                    You can automatically create a dedicated spreadsheet in your Google Drive or link an existing ID.
                  </p>
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    disabled={isOperating}
                    className="flex items-center justify-center gap-2 text-xs font-bold bg-[#0f2042] text-white hover:bg-[#1b356b] px-4 py-2.5 rounded-lg transition shadow-xs mx-auto cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-amber-400" />
                    <span>Create "St. Mary's Monitor Roster" Spreadsheet</span>
                  </button>
                </div>
              )}

              {/* Manual spreadsheet ID input */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Or enter an existing Google Spreadsheet ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#0f2042]"
                  />
                  <button
                    type="button"
                    onClick={handleSaveManualId}
                    className="px-3 py-2 text-xs font-bold bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition cursor-pointer"
                  >
                    Link ID
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
