import React from 'react';
import {
  GraduationCap,
  RefreshCw,
  FileSpreadsheet,
  Download,
  RotateCcw,
  FileCode,
  Printer,
  LogIn,
  LogOut,
  UserCheck,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { CloudSyncStatus, SheetConfig } from '../types';
import { User } from 'firebase/auth';

interface HeaderProps {
  syncStatus: CloudSyncStatus;
  statusMessage?: string;
  onSyncNow: () => void;
  onOpenWebhookModal: () => void;
  onOpenDirectSheetsModal: () => void;
  onExportCSV: () => void;
  onDownloadStandaloneHTML: () => void;
  onOpenPrintNotice: () => void;
  onResetTerm: () => void;
  onClearAllMonitors: () => void;
  totalMonitorsCount: number;
  isSyncing: boolean;
  googleUser: User | null;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  sheetConfig?: SheetConfig;
}

export const Header: React.FC<HeaderProps> = ({
  syncStatus,
  statusMessage,
  onSyncNow,
  onOpenWebhookModal,
  onOpenDirectSheetsModal,
  onExportCSV,
  onDownloadStandaloneHTML,
  onOpenPrintNotice,
  onResetTerm,
  onClearAllMonitors,
  totalMonitorsCount,
  isSyncing,
  googleUser,
  onGoogleSignIn,
  onGoogleSignOut,
  sheetConfig
}) => {
  const spreadsheetUrl = sheetConfig?.spreadsheetUrl || (sheetConfig?.spreadsheetId ? `https://docs.google.com/spreadsheets/d/${sheetConfig.spreadsheetId}/edit` : null);
  const getStatusBadge = () => {
    switch (syncStatus) {
      case 'synced':
        return (
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>{statusMessage || 'Synced to Google Sheets'}</span>
          </div>
        );
      case 'syncing':
        return (
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-950/60 border border-amber-500/30 text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
            <span>Syncing to Sheets...</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/60 border border-rose-500/30 text-rose-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span>Sync Error</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 border border-slate-700 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <span>Local Storage Only</span>
          </div>
        );
    }
  };

  return (
    <header className="bg-[#0f2042] text-white shadow-xl border-b-4 border-amber-500 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* School Branding */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest font-black uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                AFFILIATED TO CBSE • DWARKA
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">Academic Session 2026-27</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              ST. MARY'S SCHOOL, DWARKA
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              Class Monitor Management System • Classes 1 to 12 (Sections A–E)
            </p>
          </div>
        </div>

        {/* Action Controls & Sync Status */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Cloud Sync Status */}
          {getStatusBadge()}

          {/* Sync Now Button */}
          <button
            onClick={onSyncNow}
            disabled={isSyncing}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-sm disabled:opacity-60 cursor-pointer"
            title="Push local roster updates to Google Sheets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Now</span>
          </button>

          {/* Open Google Spreadsheet if connected */}
          {spreadsheetUrl && (
            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-sm cursor-pointer"
              title="Open the active Google Spreadsheet in a new tab"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Open Spreadsheet</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
            </a>
          )}

          {/* Google Account direct integration */}
          {googleUser ? (
            <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 rounded-lg p-1">
              <button
                onClick={onOpenDirectSheetsModal}
                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium px-2 py-1 rounded transition"
                title="Google Sheets connected"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden md:inline font-mono text-[11px]">{googleUser.email?.split('@')[0]}</span>
              </button>
              <button
                onClick={onGoogleSignOut}
                className="text-slate-400 hover:text-rose-400 p-1 rounded transition"
                title="Disconnect Google Account"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onGoogleSignIn}
              className="flex items-center gap-1.5 bg-white text-slate-800 hover:bg-slate-100 font-semibold px-3 py-1.5 rounded-lg text-xs transition shadow-sm cursor-pointer"
              title="Sign in with Google to enable direct Sheets synchronization"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-600" />
              <span>Connect Google</span>
            </button>
          )}

          {/* Google Sheets Webhook Configuration */}
          <button
            onClick={onOpenWebhookModal}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
            title="Configure Google Apps Script Web App Endpoint"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Sheets Webhook</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
            title="Download Roster as CSV file"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Export CSV</span>
          </button>

          {/* Standalone HTML Export */}
          <button
            onClick={onDownloadStandaloneHTML}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
            title="Download single-file standalone HTML"
          >
            <FileCode className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline">Single-File HTML</span>
          </button>

          {/* Official Report Card Print View */}
          <button
            onClick={onOpenPrintNotice}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
            title="Open School-Branded Report Card & PDF Print View"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Print Report Card</span>
          </button>

          {/* Clear All Monitors */}
          <button
            onClick={onClearAllMonitors}
            disabled={totalMonitorsCount === 0}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs transition shadow-xs cursor-pointer"
            title={`Clear all ${totalMonitorsCount} appointed monitors`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear All</span>
          </button>

          {/* Reset Term */}
          <button
            onClick={onResetTerm}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
            title="Reset Term to default sample data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline">Reset Term</span>
          </button>
        </div>
      </div>
    </header>
  );
};
