import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  MonitorRecord,
  MonitorRole,
  SchoolClass,
  SchoolSection,
  CloudSyncStatus,
  SheetConfig
} from './types';
import {
  loadMonitors,
  saveMonitors,
  loadConfig,
  saveConfig,
  exportRosterToCSV,
  INITIAL_DEMO_MONITORS
} from './utils/storage';
import {
  syncToWebhook,
  createDirectSpreadsheet,
  syncDirectToSpreadsheet
} from './sheetsApi';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getCachedAccessToken
} from './firebase';
import { generateStandaloneHTML } from './utils/standaloneHtml';

import { Header } from './components/Header';
import { MetricsCards } from './components/MetricsCards';
import { ContextSelector } from './components/ContextSelector';
import { AssignmentForm } from './components/AssignmentForm';
import { RosterList } from './components/RosterList';
import { WebhookModal } from './components/WebhookModal';
import { DirectSheetsModal } from './components/DirectSheetsModal';
import { DeleteModal } from './components/DeleteModal';
import { ResetModal } from './components/ResetModal';
import { ClearAllModal } from './components/ClearAllModal';
import { ReportCardModal } from './components/ReportCardModal';

export default function App() {
  // Primary application state
  const [monitors, setMonitors] = useState<MonitorRecord[]>(() => loadMonitors());
  const [selectedClass, setSelectedClass] = useState<SchoolClass>('4');
  const [selectedSection, setSelectedSection] = useState<SchoolSection>('D');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewAllRooms, setViewAllRooms] = useState(false);

  // Cloud & Persistence State
  const [sheetConfig, setSheetConfig] = useState<SheetConfig>(() => loadConfig());
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>('local_only');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Google Workspace Auth State
  const [googleUser, setGoogleUser] = useState<User | null>(null);

  // Modal visibility states
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [isDirectSheetsModalOpen, setIsDirectSheetsModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [pendingDeleteMonitor, setPendingDeleteMonitor] = useState<MonitorRecord | null>(null);

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setGoogleUser(user);
      },
      () => {
        setGoogleUser(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Set initial sync status based on config
  useEffect(() => {
    if (sheetConfig.webhookUrl || sheetConfig.spreadsheetId) {
      setSyncStatus('synced');
      setStatusMessage('Synced to Google Sheets');
    } else {
      setSyncStatus('local_only');
      setStatusMessage('Local Storage Only');
    }
  }, []);

  // Save to localStorage continuously whenever monitors change
  useEffect(() => {
    saveMonitors(monitors);
  }, [monitors]);

  // Debounced auto-sync to Cloud (Google Sheets Webhook or Direct Sheets API)
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

  const performCloudSync = useCallback(
    async (records: MonitorRecord[], reason: string = 'auto_sync') => {
      const hasWebhook = Boolean(sheetConfig.webhookUrl && sheetConfig.webhookUrl.startsWith('http'));
      const hasDirectSheets = Boolean(googleUser && sheetConfig.spreadsheetId);

      if (!hasWebhook && !hasDirectSheets) {
        setSyncStatus('local_only');
        setStatusMessage('Local Storage Only');
        return;
      }

      setIsSyncing(true);
      setSyncStatus('syncing');

      try {
        // If Google Apps Script Webhook configured
        if (hasWebhook) {
          await syncToWebhook(sheetConfig.webhookUrl, records, reason);
        }

        // If Direct Google Sheets REST API connected
        if (hasDirectSheets && sheetConfig.spreadsheetId) {
          const token = getCachedAccessToken();
          if (token) {
            await syncDirectToSpreadsheet(token, sheetConfig.spreadsheetId, records);
          }
        }

        setSyncStatus('synced');
        setStatusMessage('Synced to Google Sheets');
        const updatedConfig = { ...sheetConfig, lastSyncedAt: new Date().toISOString() };
        setSheetConfig(updatedConfig);
        saveConfig(updatedConfig);
      } catch (err: any) {
        console.error('Cloud synchronization error:', err);
        setSyncStatus('error');
        setStatusMessage(err.message || 'Sync failed');
      } finally {
        setIsSyncing(false);
      }
    },
    [sheetConfig, googleUser]
  );

  const triggerDebouncedSync = useCallback(
    (records: MonitorRecord[]) => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
      setSyncStatus('syncing');
      syncTimerRef.current = setTimeout(() => {
        performCloudSync(records, 'change_trigger');
      }, 700);
    },
    [performCloudSync]
  );

  // Monitor Assignment Handler
  const handleAddMonitor = (data: {
    name: string;
    rollNumber: string;
    className: SchoolClass;
    section: SchoolSection;
    role: MonitorRole;
  }) => {
    const newRecord: MonitorRecord = {
      id: `sm-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: data.name,
      rollNumber: data.rollNumber || undefined,
      className: data.className,
      section: data.section,
      role: data.role,
      tasks: {
        recessOrder: false,
        cleanDesk: false,
        boardReady: false,
        assemblyLine: false,
        attendanceAssistance: false,
        uniformCheck: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextList = [newRecord, ...monitors];
    setMonitors(nextList);

    // Switch view to the target classroom if single-room view is active
    if (!viewAllRooms) {
      setSelectedClass(data.className);
      setSelectedSection(data.section);
    }

    triggerDebouncedSync(nextList);
  };

  // Task Toggle Handler
  const handleToggleTask = (monitorId: string, taskKey: keyof MonitorRecord['tasks']) => {
    const nextList = monitors.map((m) => {
      if (m.id === monitorId) {
        return {
          ...m,
          tasks: {
            ...m.tasks,
            [taskKey]: !m.tasks[taskKey],
          },
          updatedAt: new Date().toISOString(),
        };
      }
      return m;
    });

    setMonitors(nextList);
    triggerDebouncedSync(nextList);
  };

  // Role Update Handler
  const handleUpdateRole = (monitorId: string, newRole: MonitorRole) => {
    const nextList = monitors.map((m) => {
      if (m.id === monitorId) {
        return {
          ...m,
          role: newRole,
          updatedAt: new Date().toISOString(),
        };
      }
      return m;
    });

    setMonitors(nextList);
    triggerDebouncedSync(nextList);
  };

  // Delete Request & Confirmation
  const handleDeleteRequest = (monitor: MonitorRecord) => {
    setPendingDeleteMonitor(monitor);
  };

  const handleConfirmDelete = () => {
    if (!pendingDeleteMonitor) return;
    const nextList = monitors.filter((m) => m.id !== pendingDeleteMonitor.id);
    setMonitors(nextList);
    setPendingDeleteMonitor(null);
    triggerDebouncedSync(nextList);
  };

  // Reset Term Handler
  const handleConfirmReset = () => {
    setMonitors(INITIAL_DEMO_MONITORS);
    setIsResetModalOpen(false);
    triggerDebouncedSync(INITIAL_DEMO_MONITORS);
  };

  // Clear All Monitors Handler
  const handleConfirmClearAll = () => {
    setMonitors([]);
    setIsClearAllModalOpen(false);
    triggerDebouncedSync([]);
  };

  // Google Authentication handlers
  const handleGoogleSignIn = async () => {
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setGoogleUser(res.user);
        setIsDirectSheetsModalOpen(true);
      }
    } catch (e: any) {
      console.error('Google Sign-in failed:', e);
      alert('Google Sign-in could not be completed. Please try again.');
    }
  };

  const handleGoogleSignOut = async () => {
    await logoutGoogle();
    setGoogleUser(null);
  };

  // Direct Spreadsheet creation & linkage
  const handleCreateNewSpreadsheet = async () => {
    const token = getCachedAccessToken();
    if (!token) {
      await handleGoogleSignIn();
      return;
    }
    const created = await createDirectSpreadsheet(token);
    const updatedConfig = {
      ...sheetConfig,
      spreadsheetId: created.spreadsheetId,
      spreadsheetUrl: created.spreadsheetUrl,
    };
    setSheetConfig(updatedConfig);
    saveConfig(updatedConfig);

    // Initial sync to the newly created spreadsheet
    await syncDirectToSpreadsheet(token, created.spreadsheetId, monitors);
    setSyncStatus('synced');
    setStatusMessage('Synced to Google Sheets');
  };

  const handleSyncDirect = async () => {
    const token = getCachedAccessToken();
    if (!token || !sheetConfig.spreadsheetId) return;
    await syncDirectToSpreadsheet(token, sheetConfig.spreadsheetId, monitors);
    setSyncStatus('synced');
    setStatusMessage('Synced to Google Sheets');
  };

  // Webhook Configuration Save
  const handleSaveWebhookUrl = (url: string) => {
    const updatedConfig = {
      ...sheetConfig,
      webhookUrl: url,
    };
    setSheetConfig(updatedConfig);
    saveConfig(updatedConfig);

    if (url) {
      performCloudSync(monitors, 'webhook_configured');
    } else {
      setSyncStatus('local_only');
      setStatusMessage('Local Storage Only');
    }
  };

  // Standalone Single-File HTML Exporter
  const handleDownloadStandaloneHTML = () => {
    const html = generateStandaloneHTML();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `St_Marys_Class_Monitor_System_Dwarka_Standalone.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans antialiased">
      {/* Header & Global Utility Bar */}
      <Header
        syncStatus={syncStatus}
        statusMessage={statusMessage}
        isSyncing={isSyncing}
        onSyncNow={() => performCloudSync(monitors, 'manual_sync')}
        onOpenWebhookModal={() => setIsWebhookModalOpen(true)}
        onOpenDirectSheetsModal={() => setIsDirectSheetsModalOpen(true)}
        onExportCSV={() => exportRosterToCSV(monitors)}
        onDownloadStandaloneHTML={handleDownloadStandaloneHTML}
        onOpenPrintNotice={() => setIsPrintModalOpen(true)}
        onResetTerm={() => setIsResetModalOpen(true)}
        onClearAllMonitors={() => setIsClearAllModalOpen(true)}
        totalMonitorsCount={monitors.length}
        googleUser={googleUser}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        sheetConfig={sheetConfig}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        {/* Real-time Counter Metrics Cards */}
        <MetricsCards
          monitors={monitors}
          selectedClass={selectedClass}
          selectedSection={selectedSection}
        />

        {/* Classroom Navigation Toolbar */}
        <ContextSelector
          selectedClass={selectedClass}
          selectedSection={selectedSection}
          onClassChange={setSelectedClass}
          onSectionChange={setSelectedSection}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewAllRooms={viewAllRooms}
          onToggleViewAllRooms={setViewAllRooms}
        />

        {/* Two-Column Working Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Dynamic Assignment Form Module */}
          <div className="lg:col-span-4">
            <AssignmentForm
              currentClass={selectedClass}
              currentSection={selectedSection}
              onAddMonitor={handleAddMonitor}
            />
          </div>

          {/* Roster Tracking & Daily Task Verification List */}
          <div className="lg:col-span-8">
            <RosterList
              monitors={monitors}
              selectedClass={selectedClass}
              selectedSection={selectedSection}
              viewAllRooms={viewAllRooms}
              searchQuery={searchQuery}
              onToggleTask={handleToggleTask}
              onDeleteMonitor={handleDeleteRequest}
              onUpdateRole={handleUpdateRole}
              onClearAll={() => setIsClearAllModalOpen(true)}
              onOpenPrintNotice={() => setIsPrintModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <WebhookModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        currentWebhookUrl={sheetConfig.webhookUrl || ''}
        onSaveWebhookUrl={handleSaveWebhookUrl}
        onTestSync={() => performCloudSync(monitors, 'webhook_test')}
        isSyncing={isSyncing}
      />

      <DirectSheetsModal
        isOpen={isDirectSheetsModalOpen}
        onClose={() => setIsDirectSheetsModalOpen(false)}
        googleUser={googleUser}
        sheetConfig={sheetConfig}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        onCreateNewSpreadsheet={handleCreateNewSpreadsheet}
        onSyncDirect={handleSyncDirect}
        onSaveSpreadsheetId={(id) => {
          const cfg = { ...sheetConfig, spreadsheetId: id };
          setSheetConfig(cfg);
          saveConfig(cfg);
        }}
        isOperating={isSyncing}
      />

      <DeleteModal
        monitor={pendingDeleteMonitor}
        isOpen={Boolean(pendingDeleteMonitor)}
        onClose={() => setPendingDeleteMonitor(null)}
        onConfirm={handleConfirmDelete}
      />

      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
      />

      <ClearAllModal
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        onConfirm={handleConfirmClearAll}
        monitors={monitors}
      />

      <ReportCardModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        monitors={monitors}
        selectedClass={selectedClass}
        selectedSection={selectedSection}
      />

      {/* Academic Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-5 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="font-bold text-slate-300">St. Mary's School, Dwarka</span>
            <span>• Class Monitor Management & Cloud Sync</span>
          </div>
          <div className="text-slate-400 flex items-center gap-4">
            <span>CBSE Affiliation No. 2730386</span>
            <span>•</span>
            <span>Dual Persistence: LocalStorage (sm_monitors) + Google Sheets</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
