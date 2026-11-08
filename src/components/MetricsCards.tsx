import React from 'react';
import { Users, LayoutGrid, CheckCircle2, DoorOpen, Award } from 'lucide-react';
import { MonitorRecord, SchoolClass, SchoolSection } from '../types';

interface MetricsCardsProps {
  monitors: MonitorRecord[];
  selectedClass: SchoolClass;
  selectedSection: SchoolSection;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  monitors,
  selectedClass,
  selectedSection
}) => {
  const totalMonitors = monitors.length;

  // Calculate active rooms (unique Class-Section combinations)
  const activeRooms = new Set(monitors.map(m => `${m.className}-${m.section}`));
  const activeRoomsCount = activeRooms.size;

  // Calculate completed daily tasks
  let completedTasksCount = 0;
  const totalTasksPossible = totalMonitors * 6; // 6 tasks per monitor

  monitors.forEach(m => {
    const t = m.tasks;
    if (t.recessOrder) completedTasksCount++;
    if (t.cleanDesk) completedTasksCount++;
    if (t.boardReady) completedTasksCount++;
    if (t.assemblyLine) completedTasksCount++;
    if (t.attendanceAssistance) completedTasksCount++;
    if (t.uniformCheck) completedTasksCount++;
  });

  const completionPercentage = totalTasksPossible > 0 
    ? Math.round((completedTasksCount / totalTasksPossible) * 100) 
    : 0;

  // Selected room monitors count
  const selectedRoomMonitors = monitors.filter(
    m => m.className === selectedClass && m.section === selectedSection
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Monitors */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-sm transition">
        <div>
          <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Total Monitors</p>
          <h3 className="text-2xl font-black text-[#0f2042] mt-1">{totalMonitors}</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            <span>Appointed & on duty</span>
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* Active Managed Rooms */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-sm transition">
        <div>
          <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Active Rooms</p>
          <h3 className="text-2xl font-black text-[#0f2042] mt-1">
            {activeRoomsCount} <span className="text-xs font-medium text-slate-400">/ 60</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Classes 1–12 • Sec A–E
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
          <LayoutGrid className="w-6 h-6" />
        </div>
      </div>

      {/* Completed Daily Tasks */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-sm transition">
        <div className="flex-1 pr-3">
          <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Daily Tasks Done</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-black text-emerald-600">{completedTasksCount}</h3>
            <span className="text-xs font-semibold text-slate-400">/ {totalTasksPossible}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            {completionPercentage}% today's completion
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      {/* Selected Room Context */}
      <div className="bg-white rounded-xl p-4 border border-indigo-200 shadow-xs flex items-center justify-between hover:shadow-sm transition bg-gradient-to-br from-white to-indigo-50/40">
        <div>
          <p className="text-[11px] uppercase tracking-wider font-bold text-indigo-900">Current Room Context</p>
          <h3 className="text-2xl font-black text-[#0f2042] mt-1">
            Class {selectedClass}-{selectedSection}
          </h3>
          <p className="text-xs text-indigo-700 font-semibold mt-0.5">
            {selectedRoomMonitors.length} {selectedRoomMonitors.length === 1 ? 'Monitor' : 'Monitors'} assigned
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-xs">
          <DoorOpen className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
