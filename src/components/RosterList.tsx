import React, { useState } from 'react';
import {
  Trash2,
  CheckCircle,
  Clock,
  Shield,
  BookOpen,
  Sparkles,
  ClipboardList,
  AlertTriangle,
  UserX,
  Edit2,
  Printer
} from 'lucide-react';
import { MonitorRecord, MonitorRole, SchoolClass, SchoolSection } from '../types';

interface RosterListProps {
  monitors: MonitorRecord[];
  selectedClass: SchoolClass;
  selectedSection: SchoolSection;
  viewAllRooms: boolean;
  searchQuery: string;
  onToggleTask: (monitorId: string, taskKey: keyof MonitorRecord['tasks']) => void;
  onDeleteMonitor: (monitor: MonitorRecord) => void;
  onUpdateRole: (monitorId: string, newRole: MonitorRole) => void;
  onClearAll?: () => void;
  onOpenPrintNotice?: () => void;
}

export const RosterList: React.FC<RosterListProps> = ({
  monitors,
  selectedClass,
  selectedSection,
  viewAllRooms,
  searchQuery,
  onToggleTask,
  onDeleteMonitor,
  onUpdateRole,
  onClearAll,
  onOpenPrintNotice
}) => {
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  // Filter monitors according to context
  const filtered = monitors.filter((m) => {
    if (!viewAllRooms) {
      if (m.className !== selectedClass || m.section !== selectedSection) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.name.toLowerCase().includes(q);
      const matchRole = m.role.toLowerCase().includes(q);
      const matchRoll = (m.rollNumber || '').toLowerCase().includes(q);
      const matchRoom = `class ${m.className} section ${m.section}`.toLowerCase().includes(q);
      return matchName || matchRole || matchRoll || matchRoom;
    }
    return true;
  });

  const getRoleBadge = (role: MonitorRole) => {
    switch (role) {
      case 'Class Monitor':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-200 shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-indigo-700" />
            <span>Class Monitor</span>
          </span>
        );
      case 'Assistant Monitor':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-900 border border-sky-200 shadow-2xs">
            <BookOpen className="w-3.5 h-3.5 text-sky-700" />
            <span>Assistant Monitor</span>
          </span>
        );
      case 'Discipline Monitor':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-200 shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
            <span>Discipline Monitor</span>
          </span>
        );
      case 'Cleanliness Monitor':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Cleanliness Monitor</span>
          </span>
        );
      case 'Board Writing Monitor':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
            <ClipboardList className="w-3.5 h-3.5 text-amber-700" />
            <span>Board Writing Monitor</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
            {role}
          </span>
        );
    }
  };

  const ALL_ROLES: MonitorRole[] = [
    'Class Monitor',
    'Assistant Monitor',
    'Discipline Monitor',
    'Cleanliness Monitor',
    'Board Writing Monitor'
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5">
      {/* Roster Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-100 mb-4">
        <div>
          <h3 className="text-base font-bold text-[#0f2042]">
            {viewAllRooms
              ? 'Master School Roster (All Classes & Sections)'
              : `Appointed Monitors — Class ${selectedClass}-${selectedSection}`}
          </h3>
          <p className="text-xs text-slate-500">
            Daily task verification checklist and role badge management
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPrintNotice && filtered.length > 0 && (
            <button
              type="button"
              onClick={onOpenPrintNotice}
              className="flex items-center gap-1.5 text-xs font-bold text-[#0f2042] bg-amber-50 hover:bg-amber-100 hover:text-amber-950 px-2.5 py-1 rounded-lg border border-amber-300 transition cursor-pointer shadow-2xs"
              title="Print School Report Card & Duty Evaluation for this room"
            >
              <Printer className="w-3.5 h-3.5 text-amber-600" />
              <span>Report Card</span>
            </button>
          )}
          {onClearAll && monitors.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition cursor-pointer"
              title="Clear all monitors from roster"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
          <span className="bg-indigo-50 text-[#0f2042] text-xs font-bold px-3 py-1 rounded-full border border-indigo-200">
            {filtered.length} {filtered.length === 1 ? 'Monitor' : 'Monitors'} Listed
          </span>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
            <UserX className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">No Monitors Found For This Filter</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {searchQuery
              ? `No student matching "${searchQuery}". Clear your search query to see room monitors.`
              : `There are currently no monitors appointed for Class ${selectedClass}-${selectedSection}. Use the form on the left to appoint a student.`}
          </p>
        </div>
      )}

      {/* Monitors List Cards */}
      <div className="space-y-4">
        {filtered.map((m) => {
          const t = m.tasks;
          const completedCount = [
            t.recessOrder,
            t.cleanDesk,
            t.boardReady,
            t.assemblyLine,
            t.attendanceAssistance,
            t.uniformCheck
          ].filter(Boolean).length;

          return (
            <div
              key={m.id}
              className="border border-slate-200 bg-white rounded-xl p-4 sm:p-5 hover:border-slate-300 transition shadow-2xs hover:shadow-xs"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3.5 border-b border-slate-100">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0f2042] to-[#1b356b] text-amber-400 font-black text-base flex items-center justify-center shadow-xs shrink-0">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">{m.name}</h4>
                      {m.rollNumber && (
                        <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          Roll #{m.rollNumber}
                        </span>
                      )}
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Class {m.className}-{m.section}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {editingRoleId === m.id ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={m.role}
                            onChange={(e) => {
                              onUpdateRole(m.id, e.target.value as MonitorRole);
                              setEditingRoleId(null);
                            }}
                            className="text-xs font-bold bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                          >
                            {ALL_ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setEditingRoleId(null)}
                            className="text-[10px] text-slate-500 hover:text-slate-800 underline"
                          >
                            Done
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {getRoleBadge(m.role)}
                          <button
                            type="button"
                            onClick={() => setEditingRoleId(m.id)}
                            className="p-1 text-slate-400 hover:text-[#0f2042] rounded hover:bg-slate-100 transition"
                            title="Reassign role"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          Updated: {new Date(m.updatedAt || m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right controls: Task progress & Delete */}
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-slate-700">
                      {completedCount} / 6 Duties Checked
                    </span>
                    <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${(completedCount / 6) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteMonitor(m)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title={`Delete monitor assignment for ${m.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Persistent Checklist Layout for Daily Tasks Tracking */}
              <div className="mt-3.5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Daily Duty Verification Checklist (Click to toggle)
                  </p>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Auto-syncs to Google Sheets
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {/* Task 1: Recess Order Check */}
                  <label
                    className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs font-medium cursor-pointer transition select-none ${
                      t.recessOrder
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-semibold'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={t.recessOrder}
                      onChange={() => onToggleTask(m.id, 'recessOrder')}
                      className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="flex-1">Recess Order Check</span>
                    {t.recessOrder && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                  </label>

                  {/* Task 2: Clean Desk Check */}
                  <label
                    className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs font-medium cursor-pointer transition select-none ${
                      t.cleanDesk
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-semibold'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={t.cleanDesk}
                      onChange={() => onToggleTask(m.id, 'cleanDesk')}
                      className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="flex-1">Clean Desk Check</span>
                    {t.cleanDesk && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                  </label>

                  {/* Task 3: Chalk & Board Ready */}
                  <label
                    className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs font-medium cursor-pointer transition select-none ${
                      t.boardReady
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-semibold'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={t.boardReady}
                      onChange={() => onToggleTask(m.id, 'boardReady')}
                      className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="flex-1">Chalk & Board Ready</span>
                    {t.boardReady && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                  </label>

                  {/* Task 4: Line Discipline (Assembly) */}
                  <label
                    className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs font-medium cursor-pointer transition select-none ${
                      t.assemblyLine
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-semibold'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={t.assemblyLine}
                      onChange={() => onToggleTask(m.id, 'assemblyLine')}
                      className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="flex-1">Line Discipline (Assembly)</span>
                    {t.assemblyLine && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                  </label>

                  {/* Task 5: Attendance Assistance */}
                  <label
                    className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs font-medium cursor-pointer transition select-none ${
                      t.attendanceAssistance
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-semibold'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={t.attendanceAssistance}
                      onChange={() => onToggleTask(m.id, 'attendanceAssistance')}
                      className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="flex-1">Attendance Assistance</span>
                    {t.attendanceAssistance && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                  </label>

                  {/* Task 6: Uniform & ID Inspection */}
                  <label
                    className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs font-medium cursor-pointer transition select-none ${
                      t.uniformCheck
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-semibold'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={t.uniformCheck}
                      onChange={() => onToggleTask(m.id, 'uniformCheck')}
                      className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="flex-1">Uniform & ID Inspection</span>
                    {t.uniformCheck && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
